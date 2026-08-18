import { CHARACTERS_BY_SYMBOL, encodeTextToMorse, normalizeText } from "./textEncoding";
import { resolveTiming } from "./timing";

export const RECEPTION_DIFFICULTIES = Object.freeze({
  FOUNDATION: 1,
  BASIC: 2,
  OPERATIONAL: 3,
  ADVANCED: 4,
});

const RECEPTION_MESSAGES = Object.freeze([
  { id: "rx-foundation-01", text: "MEET AT NOON", difficulty: 1, tags: ["time", "basic"] },
  { id: "rx-foundation-02", text: "SEND FIVE", difficulty: 1, tags: ["numbers", "basic"] },
  { id: "rx-basic-01", text: "THE WEATHER IS GOOD", difficulty: 2, tags: ["weather"] },
  { id: "rx-basic-02", text: "CALL ME AFTER DINNER", difficulty: 2, tags: ["conversation"] },
  { id: "rx-basic-03", text: "WE ARE READY TO GO", difficulty: 2, tags: ["conversation"] },
  { id: "rx-operational-01", text: "REPORT YOUR POSITION", difficulty: 3, tags: ["radio", "instruction"] },
  { id: "rx-operational-02", text: "WAIT FOR FURTHER INSTRUCTIONS", difficulty: 3, tags: ["radio", "instruction"] },
  { id: "rx-operational-03", text: "MESSAGE RECEIVED LOUD AND CLEAR", difficulty: 3, tags: ["radio"] },
  { id: "rx-advanced-01", text: "THE SIGNAL WAS LOST DURING THE STORM", difficulty: 4, tags: ["radio", "weather"] },
  { id: "rx-advanced-02", text: "TRANSMIT THE NEXT MESSAGE WHEN READY", difficulty: 4, tags: ["radio", "instruction"] },
]);

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function levenshtein(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let row = 0; row < rows; row += 1) matrix[row][0] = row;
  for (let column = 0; column < cols; column += 1) matrix[0][column] = column;

  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < cols; column += 1) {
      const substitution = matrix[row - 1][column - 1] + (a[row - 1] === b[column - 1] ? 0 : 1);
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        substitution,
      );
    }
  }
  return matrix[rows - 1][cols - 1];
}

export function getReceptionMessages(maxDifficulty = RECEPTION_DIFFICULTIES.ADVANCED) {
  return RECEPTION_MESSAGES.filter((message) => message.difficulty <= maxDifficulty);
}

export function getReceptionMessageById(id) {
  return RECEPTION_MESSAGES.find((message) => message.id === id) ?? null;
}

export function getReceptionTiming({ wpm = 10, characterWpm = wpm, mode = "standard" } = {}) {
  return resolveTiming({ wpm, characterWpm, mode });
}

export function encodeReceptionMessage(text, timingOptions = {}) {
  const normalized = normalizeText(text);
  const morse = encodeTextToMorse(normalized);
  return Object.freeze({
    text: normalized,
    morse,
    timing: getReceptionTiming(timingOptions),
  });
}

export function scoreReceptionCopy(expectedText, submittedText, elapsedMs = 0) {
  const expected = normalizeText(expectedText);
  const submitted = normalizeText(submittedText);
  const distance = levenshtein(expected, submitted);
  const characterCount = expected.replace(/\s/g, "").length;
  const expectedWords = expected ? expected.split(" ") : [];
  const submittedWords = submitted ? submitted.split(" ") : [];

  const characterAccuracy = characterCount === 0
    ? 0
    : clamp(100 * (1 - distance / Math.max(expected.length, submitted.length, 1)));

  const correctWords = expectedWords.reduce(
    (count, word, index) => count + (submittedWords[index] === word ? 1 : 0),
    0,
  );
  const wordAccuracy = expectedWords.length === 0
    ? 0
    : clamp((correctWords / expectedWords.length) * 100);

  const minutes = Math.max(elapsedMs / 60000, 1 / 60);
  const effectiveCpm = submitted.replace(/\s/g, "").length / minutes;
  const effectiveWpm = effectiveCpm / 5;

  return Object.freeze({
    expected,
    submitted,
    editDistance: distance,
    characterAccuracy: Math.round(characterAccuracy),
    wordAccuracy: Math.round(wordAccuracy),
    effectiveWpm: Number(effectiveWpm.toFixed(1)),
    elapsedMs: Math.max(0, elapsedMs),
    passed: characterAccuracy >= 90 && wordAccuracy >= 75,
  });
}

export function buildReceptionSession({
  count = 5,
  maxDifficulty = RECEPTION_DIFFICULTIES.ADVANCED,
  seed = 0,
  wpm = 10,
  characterWpm = wpm,
  timingMode = "standard",
} = {}) {
  const pool = getReceptionMessages(maxDifficulty);
  const safeCount = clamp(Math.floor(count), 1, Math.min(20, pool.length));
  const start = Math.abs(Math.floor(seed)) % pool.length;

  const messages = Array.from({ length: safeCount }, (_, index) => {
    const message = pool[(start + index * 3) % pool.length];
    return Object.freeze({
      ...message,
      encoded: encodeReceptionMessage(message.text, { wpm, characterWpm, mode: timingMode }),
    });
  });

  return Object.freeze({
    id: `reception:${seed}:${wpm}:${maxDifficulty}`,
    count: messages.length,
    wpm,
    characterWpm,
    timingMode,
    messages: Object.freeze(messages),
  });
}

export const RECEPTION_CORPUS = RECEPTION_MESSAGES;
export { CHARACTERS_BY_SYMBOL };
