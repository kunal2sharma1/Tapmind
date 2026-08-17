import { buildReviewQueue } from "./reviewScheduler";
import { generateExercise } from "./exerciseGenerator";
import { getWeakestSkills } from "./mastery";

export const DAILY_SESSION_TYPES = Object.freeze({
  REVIEW: "review",
  ADAPTIVE: "adaptive",
  NEW_MATERIAL: "new-material",
  MIXED: "mixed"
});

const DEFAULTS = Object.freeze({
  durationMinutes: 10,
  minimumExercises: 5,
  maximumExercises: 20
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeOptions(options = {}) {
  const durationMinutes = clamp(
    Number.isFinite(options.durationMinutes) ? options.durationMinutes : DEFAULTS.durationMinutes,
    3,
    45
  );
  const maximumExercises = clamp(
    Number.isFinite(options.maximumExercises) ? Math.floor(options.maximumExercises) : DEFAULTS.maximumExercises,
    DEFAULTS.minimumExercises,
    DEFAULTS.maximumExercises
  );
  const estimatedExerciseSeconds = clamp(
    Number.isFinite(options.estimatedExerciseSeconds) ? options.estimatedExerciseSeconds : 45,
    15,
    180
  );

  return {
    durationMinutes,
    maximumExercises,
    estimatedExerciseSeconds,
    targetExercises: clamp(
      Math.round((durationMinutes * 60) / estimatedExerciseSeconds),
      DEFAULTS.minimumExercises,
      maximumExercises
    )
  };
}

function aggregateWeakestSkills(masteries) {
  const aggregate = new Map();

  for (const mastery of Object.values(masteries ?? {})) {
    for (const item of getWeakestSkills(mastery, 9)) {
      const existing = aggregate.get(item.skill);
      aggregate.set(item.skill, {
        skill: item.skill,
        score: existing ? existing.score + item.score : item.score,
        samples: existing ? existing.samples + 1 : 1,
      });
    }
  }

  return [...aggregate.values()]
    .map((item) => ({ skill: item.skill, score: Math.round(item.score / item.samples) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);
}

export function calculateDailyMix({ dueCount = 0, mastery = {}, introducedCharacterIds = [], options = {} } = {}) {
  const normalized = normalizeOptions(options);
  const weakest = aggregateWeakestSkills(mastery);
  const dueRatio = dueCount > 0
    ? Math.min(0.7, 0.5 + Math.min(dueCount / Math.max(1, normalized.targetExercises * 4), 0.2))
    : 0;
  const remaining = 1 - dueRatio;
  const adaptiveRatio = remaining * (weakest.length ? 0.65 : 0.4);
  const newMaterialRatio = Math.max(0, 1 - dueRatio - adaptiveRatio);

  const reviewCount = dueCount > 0
    ? Math.min(dueCount, Math.max(1, Math.round(normalized.targetExercises * dueRatio)))
    : 0;
  const adaptiveCount = weakest.length ? Math.max(1, Math.round(normalized.targetExercises * adaptiveRatio)) : 0;
  const newCount = Math.max(0, normalized.targetExercises - reviewCount - adaptiveCount);

  return Object.freeze({
    targetExercises: normalized.targetExercises,
    reviewCount,
    adaptiveCount,
    newCount,
    dueCount,
    weakestSkills: weakest,
    introducedCharacterIds: [...introducedCharacterIds],
    ratios: Object.freeze({ dueRatio, adaptiveRatio, newMaterialRatio })
  });
}

function buildReviewItems(reviewMap, characterLookup) {
  return Object.entries(reviewMap ?? {}).map(([characterId, review]) => ({
    characterId,
    review,
    mastery: characterLookup?.[characterId] ?? null,
  }));
}

function generateForCharacters(characters, mode, context, count, seed, source) {
  return characters.slice(0, count).map((character, index) =>
    generateExercise({
      mode,
      target: character,
      category: character.category === "number"
        ? "numbers"
        : character.category === "punctuation"
          ? "punctuation"
          : character.category === "prosign"
            ? "prosigns"
            : "letters",
      context,
      seed: seed + index,
      source,
    })
  );
}

export function buildDailySession({
  mastery = {},
  reviewMap = {},
  characterMastery = {},
  introducedCharacters = [],
  now = Date.now(),
  options = {},
  seed = 0,
} = {}) {
  const normalized = normalizeOptions(options);
  const reviewItems = buildReviewQueue(
    buildReviewItems(reviewMap, characterMastery),
    { now: new Date(now), limit: normalized.maximumExercises }
  );
  const introduced = introducedCharacters.filter(Boolean);
  const introducedById = new Map(introduced.map((character) => [character.id, character]));
  const mix = calculateDailyMix({
    dueCount: reviewItems.length,
    mastery,
    introducedCharacterIds: introduced.map((character) => character.id),
    options: normalized,
  });

  const reviewCharacters = reviewItems
    .map((item) => introducedById.get(item.characterId))
    .filter(Boolean);
  const reviewIds = new Set(reviewCharacters.map((character) => character.id));
  const remainingCharacters = introduced.filter((character) => !reviewIds.has(character.id));

  const context = {
    characterMastery,
    mastery,
    dueCharacterIds: reviewCharacters.map((character) => character.id),
    introducedCharacterIds: introduced.map((character) => character.id),
    now,
  };

  const exercises = [
    ...generateForCharacters(
      reviewCharacters,
      "mixed",
      context,
      mix.reviewCount,
      seed + 1000,
      "daily-review"
    ),
    ...generateForCharacters(
      remainingCharacters,
      "mixed",
      context,
      mix.adaptiveCount,
      seed + 2000,
      "daily-adaptive"
    ),
    ...generateForCharacters(
      remainingCharacters.slice(mix.adaptiveCount),
      "learn",
      { ...context, characterMastery: null },
      mix.newCount,
      seed + 3000,
      "daily-new-material"
    )
  ].slice(0, normalized.maximumExercises);

  return Object.freeze({
    id: `daily:${new Date(now).toISOString().slice(0, 10)}`,
    createdAt: new Date(now).toISOString(),
    durationMinutes: normalized.durationMinutes,
    targetExercises: normalized.targetExercises,
    dueCount: reviewItems.length,
    mix,
    exercises: Object.freeze(exercises),
    weakestSkills: mix.weakestSkills,
    hasDueReviews: reviewItems.length > 0,
    completed: false,
  });
}

export function summarizeDailySession(session) {
  if (!session) return null;
  const total = session.exercises?.length ?? 0;
  const completedCount = session.exercises?.filter((exercise) => exercise.completed).length ?? 0;

  return Object.freeze({
    id: session.id,
    durationMinutes: session.durationMinutes,
    totalExercises: total,
    completedExercises: completedCount,
    remainingExercises: Math.max(0, total - completedCount),
    dueCount: session.dueCount,
    weakestSkills: session.weakestSkills ?? [],
    completed: total > 0 && completedCount === total,
  });
}

export { DEFAULTS as DAILY_LEARNING_DEFAULTS };
