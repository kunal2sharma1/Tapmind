import wordCatalog from "./words.json";
import { encodeSymbol, getCharacterBySymbol } from "./characters";

export const MORSE_WORDS = Object.freeze(wordCatalog.words);

const WORD_BY_ID = new Map(MORSE_WORDS.map((word) => [word.id, word]));
const WORD_BY_TEXT = new Map(MORSE_WORDS.map((word) => [word.text, word]));

const DIFFICULTY_RANK = Object.freeze({
  introductory: 0,
  standard: 1,
  challenging: 2,
  advanced: 3,
});

export function getWordById(id) {
  return WORD_BY_ID.get(id) ?? null;
}

export function getWordByText(text) {
  if (typeof text !== "string") return null;
  return WORD_BY_TEXT.get(text.trim().toUpperCase()) ?? null;
}

export function getWordsByStage(stage) {
  return MORSE_WORDS.filter((word) => word.stage === stage);
}

export function getWordsByDifficulty(difficulty) {
  return MORSE_WORDS.filter((word) => word.difficulty === difficulty);
}

export function getWordDifficultyRank(difficulty) {
  return DIFFICULTY_RANK[difficulty] ?? DIFFICULTY_RANK.standard;
}

export function encodeWordText(text) {
  if (typeof text !== "string" || !text.trim()) return null;
  const normalized = text.trim().toUpperCase();
  const encoded = [];

  for (const symbol of normalized) {
    const morse = encodeSymbol(symbol);
    if (!morse) return null;
    encoded.push(morse);
  }

  return encoded.join(" ");
}

export function buildWordTarget(word) {
  if (!word?.text) return null;
  const morse = encodeWordText(word.text);
  if (!morse) return null;

  return Object.freeze({
    id: word.id,
    text: word.text,
    morse,
    stage: word.stage,
    difficulty: word.difficulty,
  });
}

export function getWordTargets(words = MORSE_WORDS) {
  return words.map(buildWordTarget).filter(Boolean);
}

export function validateWordCharacters(word) {
  if (!word?.text) return { valid: false, reason: "missing-text" };
  const unsupported = [...word.text.toUpperCase()].filter((symbol) => !getCharacterBySymbol(symbol));
  return unsupported.length
    ? { valid: false, reason: "unsupported-character", unsupported: [...new Set(unsupported)] }
    : { valid: true, unsupported: [] };
}
