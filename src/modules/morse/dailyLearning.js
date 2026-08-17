import { getReviewQueue } from "./reviewScheduler";
import { generateSession } from "./exerciseGenerator";
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
  maximumExercises: 20,
  reviewRatio: 0.5,
  adaptiveRatio: 0.3,
  newMaterialRatio: 0.2
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

export function calculateDailyMix({ dueCount = 0, mastery = {}, introducedCharacterIds = [], options = {} } = {}) {
  const normalized = normalizeOptions(options);
  const weakest = getWeakestSkillsForMap(mastery);
  const dueRatio = dueCount > 0 ? Math.min(0.7, DEFAULTS.reviewRatio + Math.min(dueCount / 100, 0.2)) : 0;
  const remaining = 1 - dueRatio;
  const adaptiveRatio = remaining * (weakest.length ? 0.65 : 0.45);
  const newMaterialRatio = Math.max(0, 1 - dueRatio - adaptiveRatio);

  const reviewCount = dueCount > 0
    ? Math.min(dueCount, Math.max(1, Math.round(normalized.targetExercises * dueRatio)))
    : 0;
  const adaptiveCount = Math.max(
    weakest.length ? 1 : 0,
    Math.round(normalized.targetExercises * adaptiveRatio)
  );
  const newCount = Math.max(
    0,
    normalized.targetExercises - reviewCount - adaptiveCount
  );

  return Object.freeze({
    targetExercises: normalized.targetExercises,
    reviewCount,
    adaptiveCount,
    newCount,
    dueCount,
    weakestSkills: weakest,
    introducedCharacterIds: [...introducedCharacterIds],
  });
}

function getWeakestSkillsForMap(masteries) {
  const merged = Object.values(masteries ?? {}).reduce(
    (accumulator, mastery) => {
      for (const [skill, score] of Object.entries(getWeakestSkills(mastery, 9))) {
        const existing = accumulator.find((item) => item.skill === skill);
        if (existing) existing.score += score;
        else accumulator.push({ skill, score });
      }
      return accumulator;
    },
    []
  );

  return merged
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);
}

function buildReviewCandidates(reviewQueue, limit) {
  return reviewQueue.slice(0, limit).map((item) => item.characterId).filter(Boolean);
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
  const reviewQueue = getReviewQueue(reviewMap, now);
  const introduced = introducedCharacters.length ? introducedCharacters : [];
  const mix = calculateDailyMix({
    dueCount: reviewQueue.length,
    mastery,
    introducedCharacterIds: introduced.map((character) => character.id),
    options: normalized,
  });

  const reviewIds = buildReviewCandidates(reviewQueue, mix.reviewCount);
  const reviewCharacters = introduced.filter((character) => reviewIds.includes(character.id));
  const remainingCharacters = introduced.filter((character) => !reviewIds.includes(character.id));

  const context = {
    characterMastery,
    mastery,
    dueCharacterIds: reviewIds,
    introducedCharacterIds: introduced.map((character) => character.id),
    now,
  };

  const exercises = [];

  if (reviewCharacters.length) {
    exercises.push(...generateSession({
      mode: "mixed",
      count: Math.min(reviewCharacters.length, mix.reviewCount),
      candidates: reviewCharacters,
      context,
      seed: seed + 1000,
      source: "daily-review",
    }));
  }

  if (mix.adaptiveCount > 0 && remainingCharacters.length) {
    exercises.push(...generateSession({
      mode: "mixed",
      count: Math.min(mix.adaptiveCount, remainingCharacters.length),
      candidates: remainingCharacters,
      context,
      seed: seed + 2000,
      source: "daily-adaptive",
    }));
  }

  if (mix.newCount > 0 && remainingCharacters.length) {
    exercises.push(...generateSession({
      mode: "learn",
      count: Math.min(mix.newCount, remainingCharacters.length),
      candidates: remainingCharacters,
      context: { ...context, characterMastery: null },
      seed: seed + 3000,
      source: "daily-new-material",
    }));
  }

  const orderedExercises = exercises.slice(0, normalized.maximumExercises);

  return Object.freeze({
    id: `daily:${new Date(now).toISOString().slice(0, 10)}`,
    createdAt: new Date(now).toISOString(),
    durationMinutes: normalized.durationMinutes,
    targetExercises: normalized.targetExercises,
    dueCount: reviewQueue.length,
    mix,
    exercises: Object.freeze(orderedExercises),
    weakestSkills: mix.weakestSkills,
    hasDueReviews: reviewQueue.length > 0,
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
