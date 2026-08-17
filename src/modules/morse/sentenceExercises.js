import {
  getSentences,
  MORSE_SENTENCE_MODES,
  getSentenceDifficulty,
} from "./sentences";

function deterministicPick(items, count, seed = 0) {
  if (items.length <= count) return [...items];
  const result = [];
  let cursor = Math.abs(Math.floor(seed)) % items.length;
  while (result.length < count) {
    const item = items[cursor % items.length];
    if (!result.some((candidate) => candidate.id === item.id)) result.push(item);
    cursor += 5;
  }
  return result;
}

function normalizeText(value) {
  return String(value ?? "").trim().toUpperCase();
}

export function rankSentences(sentences, {
  sentenceMastery = {},
  recentIds = [],
  seed = 0,
} = {}) {
  const recent = new Set(recentIds);
  return [...sentences]
    .map((sentence) => {
      const mastery = sentenceMastery[sentence.id] ?? {};
      const overall = Number(mastery.overall) || 0;
      const weak = Math.max(0, 100 - overall);
      const recentPenalty = recent.has(sentence.id) ? 0.45 : 1;
      return { sentence, score: (1 + weak / 20) * recentPenalty, seed };
    })
    .sort((a, b) => b.score - a.score || a.sentence.id.localeCompare(b.sentence.id));
}

export function buildSentenceChoices(target, { count = 4, pool = null, seed = 0 } = {}) {
  const source = pool?.length ? pool : getSentences({ maxDifficulty: getSentenceDifficulty(target) });
  const alternatives = source.filter((sentence) => sentence.id !== target.id);
  return deterministicPick(alternatives, Math.max(0, count - 1), seed)
    .concat(target)
    .sort((a, b) => a.text.localeCompare(b.text));
}

export function createSentenceExercise({
  mode = MORSE_SENTENCE_MODES.RECOGNITION,
  target,
  sentenceMastery = {},
  recentIds = [],
  seed = 0,
  choiceCount = 4,
} = {}) {
  if (!target?.id || !target.text || !target.morse) {
    throw new Error("A canonical sentence is required.");
  }

  if (!Object.values(MORSE_SENTENCE_MODES).includes(mode)) {
    throw new Error(`Unsupported sentence mode: ${mode}`);
  }

  return Object.freeze({
    id: `${mode}:${target.id}`,
    type: "sentence",
    mode,
    target: Object.freeze(target),
    difficulty: getSentenceDifficulty(target),
    choices: Object.freeze(
      mode === MORSE_SENTENCE_MODES.RECOGNITION || mode === MORSE_SENTENCE_MODES.AUDIO_RECOGNITION
        ? buildSentenceChoices(target, { count: choiceCount, seed })
        : []
    ),
    metadata: Object.freeze({
      generatorVersion: 1,
      source: "sentence-corpus",
      seed,
      adaptive: Boolean(Object.keys(sentenceMastery).length),
      recentIds: [...recentIds]
    })
  });
}

export function generateSentenceSession({
  mode = MORSE_SENTENCE_MODES.RECOGNITION,
  count = 5,
  maxDifficulty = 1,
  sentenceMastery = {},
  recentIds = [],
  seed = 0,
} = {}) {
  const pool = getSentences({ maxDifficulty });
  if (!pool.length) throw new Error("No sentences available for this difficulty range.");

  const ranked = rankSentences(pool, { sentenceMastery, recentIds, seed });
  const targets = deterministicPick(ranked.map((entry) => entry.sentence), Math.max(1, count), seed);

  return Object.freeze(targets.map((target, index) => createSentenceExercise({
    mode,
    target,
    sentenceMastery,
    recentIds,
    seed: seed + index,
  })));
}

export function scoreSentenceResponse(exercise, response = {}) {
  if (!exercise?.target) return Object.freeze({ correct: false, score: 0, reason: "invalid-exercise" });

  if (exercise.mode === MORSE_SENTENCE_MODES.RECOGNITION || exercise.mode === MORSE_SENTENCE_MODES.AUDIO_RECOGNITION) {
    const answer = normalizeText(response.text);
    return Object.freeze({
      correct: answer === exercise.target.text,
      score: answer === exercise.target.text ? 1 : 0,
      expected: exercise.target.text,
    });
  }

  const answer = String(response.morse ?? "").trim();
  return Object.freeze({
    correct: answer === exercise.target.morse,
    score: answer === exercise.target.morse ? 1 : 0,
    expected: exercise.target.morse,
  });
}
