import { MORSE_CHARACTERS, getLetters, getNumbers, getPunctuation, getProsigns } from "./characters";
import {
  createLearningExercise,
  MORSE_LEARNING_MODES,
} from "./learningModes";
import { rankAdaptiveCandidates } from "./adaptive";

export const MORSE_DIFFICULTIES = Object.freeze({
  INTRODUCTORY: "introductory",
  STANDARD: "standard",
  CHALLENGING: "challenging",
  ADVANCED: "advanced"
});

const DIFFICULTY_RANK = Object.freeze({
  [MORSE_DIFFICULTIES.INTRODUCTORY]: 0,
  [MORSE_DIFFICULTIES.STANDARD]: 1,
  [MORSE_DIFFICULTIES.CHALLENGING]: 2,
  [MORSE_DIFFICULTIES.ADVANCED]: 3
});

const CATEGORY_POOLS = Object.freeze({
  all: MORSE_CHARACTERS,
  letters: getLetters(),
  numbers: getNumbers(),
  punctuation: getPunctuation(),
  prosigns: getProsigns()
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeDifficulty(value) {
  return Object.prototype.hasOwnProperty.call(DIFFICULTY_RANK, value)
    ? value
    : MORSE_DIFFICULTIES.STANDARD;
}

function scoreCharacterDifficulty(character) {
  const length = character.morse.length;
  const transitions = character.morse.slice(1).split("").reduce(
    (count, symbol, index) => count + (symbol !== character.morse[index] ? 1 : 0),
    0
  );
  const repetitionPenalty = Math.max(0, 3 - new Set(character.morse).size);
  const categoryPenalty = character.category === "prosign" ? 2 : character.category === "punctuation" ? 1 : 0;

  return length + transitions * 0.5 + repetitionPenalty * 0.25 + categoryPenalty;
}

function difficultyForCharacter(character) {
  const score = scoreCharacterDifficulty(character);
  if (score <= 1.75) return MORSE_DIFFICULTIES.INTRODUCTORY;
  if (score <= 3.25) return MORSE_DIFFICULTIES.STANDARD;
  if (score <= 4.75) return MORSE_DIFFICULTIES.CHALLENGING;
  return MORSE_DIFFICULTIES.ADVANCED;
}

function getPool(category = "letters") {
  const pool = CATEGORY_POOLS[category] ?? CATEGORY_POOLS.letters;
  return [...pool];
}

function normalizeStats(stats = {}) {
  return stats && typeof stats === "object" ? stats : {};
}

function candidateWeight(character, context) {
  const stats = normalizeStats(context.characterStats)[character.symbol] ?? {};
  const attempts = Number.isFinite(stats.attempts) ? stats.attempts : 0;
  const accuracy = Number.isFinite(stats.accuracy)
    ? stats.accuracy
    : attempts > 0
      ? Math.round((stats.correct / attempts) * 100)
      : 0;
  const due = context.dueCharacterIds?.includes(character.id) ? 1 : 0;
  const weak = Math.max(0, (100 - accuracy) / 100);
  const unseen = attempts === 0 ? 1 : 0;
  const recentPenalty = context.recentCharacterIds?.includes(character.id) ? 0.55 : 1;

  return (1 + due * 5 + weak * 3 + unseen * 1.5) * recentPenalty;
}

function deterministicPick(items, count, seed = 0) {
  if (items.length <= count) return [...items];

  const result = [];
  let cursor = Math.abs(Math.floor(seed)) % items.length;
  while (result.length < count) {
    const item = items[cursor % items.length];
    if (!result.includes(item)) result.push(item);
    cursor += 7;
  }
  return result;
}

export function getCharacterDifficulty(character) {
  if (!character) return MORSE_DIFFICULTIES.STANDARD;
  return difficultyForCharacter(character);
}

export function rankCharacters(candidates, context = {}) {
  const ranked = context.characterMastery
    ? rankAdaptiveCandidates(candidates, {
        characterMastery: context.characterMastery,
        weakestSkills: context.weakestSkills,
        now: context.now,
      }).map((entry) => ({
        character: entry.candidate,
        difficulty: getCharacterDifficulty(entry.candidate),
        weight: entry.score,
      }))
    : [...candidates].map((character) => ({
        character,
        difficulty: getCharacterDifficulty(character),
        weight: candidateWeight(character, context),
      }));

  return ranked.sort((a, b) => {
    if (b.weight !== a.weight) return b.weight - a.weight;
    return a.character.id.localeCompare(b.character.id);
  });
}

export function selectCandidates({
  category = "letters",
  count = 10,
  difficulty = null,
  excludeIds = [],
  context = {},
  seed = 0,
} = {}) {
  const normalizedDifficulty = difficulty ? normalizeDifficulty(difficulty) : null;
  const excluded = new Set(excludeIds);
  let pool = getPool(category).filter((character) => !excluded.has(character.id));

  if (normalizedDifficulty) {
    const exact = pool.filter((character) => getCharacterDifficulty(character) === normalizedDifficulty);
    if (exact.length >= count) pool = exact;
  }

  const ranked = rankCharacters(pool, context).map((entry) => entry.character);
  return deterministicPick(ranked, Math.max(0, Math.floor(count)), seed);
}

export function buildDistractors(target, {
  category = "letters",
  count = 3,
  context = {},
  difficulty = null,
  seed = 0,
} = {}) {
  if (!target) return [];

  const desiredCount = Math.max(0, Math.floor(count));
  const targetDifficulty = difficulty ? normalizeDifficulty(difficulty) : getCharacterDifficulty(target);
  const pool = getPool(category).filter((character) => character.id !== target.id);

  const sameDifficulty = pool.filter((character) => getCharacterDifficulty(character) === targetDifficulty);
  const confusionPool = sameDifficulty.length >= desiredCount ? sameDifficulty : pool;
  const ranked = rankCharacters(confusionPool, context).map((entry) => entry.character);

  return deterministicPick(ranked, desiredCount, seed).filter((character) => character.id !== target.id);
}

export function generateExercise({
  mode = MORSE_LEARNING_MODES.RECALL,
  category = "letters",
  difficulty = MORSE_DIFFICULTIES.STANDARD,
  target = null,
  candidates = null,
  context = {},
  seed = 0,
  distractorCount = 3,
  source = "generator",
} = {}) {
  const normalizedDifficulty = normalizeDifficulty(difficulty);
  const available = target
    ? [target]
    : candidates?.length
      ? candidates
      : selectCandidates({ category, count: 1, difficulty: normalizedDifficulty, context, seed });

  if (!available[0]) throw new Error("Unable to select a Morse character for exercise generation.");

  const selected = available[0];
  const distractors = buildDistractors(selected, {
    category,
    count: distractorCount,
    context,
    difficulty: normalizedDifficulty,
    seed: seed + 13,
  });

  return Object.freeze({
    ...createLearningExercise({
      mode,
      character: selected,
      options: {
        difficulty: normalizedDifficulty,
        source,
      },
    }),
    generator: Object.freeze({
      version: 2,
      category,
      selectedDifficulty: getCharacterDifficulty(selected),
      candidatesConsidered: available.length,
      distractorCount: distractors.length,
      seed,
      adaptive: Boolean(context.characterMastery),
    }),
    choices: Object.freeze([selected, ...distractors]),
  });
}

export function generateSession({
  mode = MORSE_LEARNING_MODES.MIXED,
  count = 5,
  category = "letters",
  difficulty = MORSE_DIFFICULTIES.STANDARD,
  context = {},
  seed = 0,
  excludeIds = [],
} = {}) {
  const safeCount = clamp(Math.floor(count), 1, 100);
  const candidates = selectCandidates({
    category,
    count: Math.max(safeCount, 12),
    difficulty,
    excludeIds,
    context,
    seed,
  });

  return Object.freeze(
    Array.from({ length: safeCount }, (_, index) => {
      const target = candidates[index % candidates.length];
      const modeForExercise = mode === MORSE_LEARNING_MODES.MIXED
        ? [
            MORSE_LEARNING_MODES.RECOGNITION,
            MORSE_LEARNING_MODES.RECALL,
            MORSE_LEARNING_MODES.AUDIO_RECOGNITION,
            MORSE_LEARNING_MODES.AUDIO_RECALL,
            MORSE_LEARNING_MODES.SENDING,
          ][index % 5]
        : mode;

      return generateExercise({
        mode: modeForExercise,
        category,
        difficulty,
        target,
        context,
        seed: seed + index,
        source: context.characterMastery ? "adaptive-session-generator" : "session-generator",
      });
    })
  );
}

export function getDifficultyRank(difficulty) {
  return DIFFICULTY_RANK[normalizeDifficulty(difficulty)];
}
