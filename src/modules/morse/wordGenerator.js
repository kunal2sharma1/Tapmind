import { MORSE_WORDS, buildWordTarget, getWordDifficultyRank } from "./words";

export const WORD_EXERCISE_MODES = Object.freeze({
  LISTEN_RECOGNITION: "word-audio-recognition",
  MORSE_RECOGNITION: "word-morse-recognition",
  WORD_RECALL: "word-recall",
  MORSE_RECALL: "word-morse-recall",
  MIXED: "word-mixed",
});

const MODE_ROTATION = [
  WORD_EXERCISE_MODES.LISTEN_RECOGNITION,
  WORD_EXERCISE_MODES.MORSE_RECOGNITION,
  WORD_EXERCISE_MODES.WORD_RECALL,
  WORD_EXERCISE_MODES.MORSE_RECALL,
];

function deterministicPick(items, count, seed = 0) {
  if (items.length <= count) return [...items];
  const output = [];
  let cursor = Math.abs(Math.floor(seed)) % items.length;
  while (output.length < count) {
    const candidate = items[cursor % items.length];
    if (!output.some((item) => item.id === candidate.id)) output.push(candidate);
    cursor += 5;
  }
  return output;
}

function candidateScore(word, context = {}) {
  const stats = context.wordMastery?.[word.id] ?? {};
  const overall = Number(stats.overall) || 0;
  const attempts = Number(stats.attempts) || 0;
  const due = context.dueWordIds?.includes(word.id) ? 5 : 0;
  const weak = Math.max(0, (100 - overall) / 20);
  const unseen = attempts === 0 ? 2 : 0;
  const recent = context.recentWordIds?.includes(word.id) ? -2 : 0;
  return due + weak + unseen + recent;
}

export function rankWords(words = MORSE_WORDS, context = {}) {
  return [...words]
    .map((word) => ({ word, score: candidateScore(word, context) }))
    .sort((a, b) => b.score - a.score || wordTieBreak(a.word, b.word));
}

function wordTieBreak(a, b) {
  return a.id.localeCompare(b.id);
}

export function selectWords({
  difficulty = null,
  count = 5,
  excludeIds = [],
  context = {},
  seed = 0,
} = {}) {
  const excluded = new Set(excludeIds);
  let pool = MORSE_WORDS.filter((word) => !excluded.has(word.id));

  if (difficulty) {
    const rank = getWordDifficultyRank(difficulty);
    const exact = pool.filter((word) => getWordDifficultyRank(word.difficulty) === rank);
    if (exact.length >= count) pool = exact;
  }

  const ranked = rankWords(pool, context).map(({ word }) => word);
  return deterministicPick(ranked, Math.max(1, Math.floor(count)), seed);
}

export function buildWordDistractors(target, { count = 3, context = {}, difficulty = null, seed = 0 } = {}) {
  if (!target) return [];
  const targetRank = difficulty ? getWordDifficultyRank(difficulty) : getWordDifficultyRank(target.difficulty);
  const pool = MORSE_WORDS.filter((word) => word.id !== target.id);
  const sameDifficulty = pool.filter((word) => getWordDifficultyRank(word.difficulty) === targetRank);
  const ranked = rankWords(sameDifficulty.length >= count ? sameDifficulty : pool, context).map(({ word }) => word);
  return deterministicPick(ranked, Math.max(0, Math.floor(count)), seed);
}

export function generateWordExercise({
  mode = WORD_EXERCISE_MODES.MIXED,
  target = null,
  difficulty = null,
  context = {},
  seed = 0,
  distractorCount = 3,
  source = "word-generator",
} = {}) {
  const selected = target ?? selectWords({ difficulty, count: 1, context, seed })[0];
  const canonical = buildWordTarget(selected);
  if (!canonical) throw new Error("Unable to build Morse target for word exercise.");

  const resolvedMode = mode === WORD_EXERCISE_MODES.MIXED
    ? MODE_ROTATION[Math.abs(seed) % MODE_ROTATION.length]
    : mode;

  const distractors = buildWordDistractors(selected, {
    count: distractorCount,
    context,
    difficulty,
    seed: seed + 11,
  }).map(buildWordTarget).filter(Boolean);

  return Object.freeze({
    id: `${resolvedMode}:${selected.id}`,
    mode: resolvedMode,
    target: canonical,
    choices: Object.freeze([canonical, ...distractors]),
    metadata: Object.freeze({
      source,
      difficulty: selected.difficulty,
      seed,
      wordLength: selected.text.length,
      morseLength: canonical.morse.replaceAll(" ", "").length,
    }),
  });
}

export function generateWordSession({
  mode = WORD_EXERCISE_MODES.MIXED,
  count = 5,
  difficulty = null,
  context = {},
  seed = 0,
  excludeIds = [],
} = {}) {
  const targets = selectWords({
    difficulty,
    count,
    excludeIds,
    context,
    seed,
  });

  return Object.freeze(targets.map((word, index) => generateWordExercise({
    mode,
    target: word,
    difficulty,
    context,
    seed: seed + index,
    source: "word-session",
  })));
}

export function scoreWordExercise(exercise, response = {}) {
  if (!exercise?.target) return Object.freeze({ correct: false, score: 0, reason: "invalid-exercise" });
  const expectedWord = exercise.target.text;
  const expectedMorse = exercise.target.morse;

  if ([WORD_EXERCISE_MODES.LISTEN_RECOGNITION, WORD_EXERCISE_MODES.MORSE_RECOGNITION].includes(exercise.mode)) {
    const answer = typeof response.text === "string" ? response.text.trim().toUpperCase() : "";
    const correct = answer === expectedWord;
    return Object.freeze({ correct, score: correct ? 1 : 0, expected: expectedWord });
  }

  const answer = typeof response.morse === "string" ? response.morse.trim() : "";
  const correct = answer === expectedMorse;
  return Object.freeze({ correct, score: correct ? 1 : 0, expected: expectedMorse });
}
