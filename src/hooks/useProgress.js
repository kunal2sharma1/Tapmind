import { useCallback, useEffect, useState } from "react";
import {
  applyMasteryEvent,
  buildMasteryEvent,
  createEmptyMastery,
  getMasteryState,
  calculateOverallMastery,
  normalizeMastery
} from "../modules/morse/mastery";
import { createInitialReviewState, normalizeReviewState, scheduleReview } from "../modules/morse/reviewScheduler";

const STORAGE_KEY = "tapmind.progress.v4";
const LEGACY_STORAGE_KEY = "tapmind.progress.v3";
const OLDER_STORAGE_KEY = "tapmind.progress.v2";
const OLDEST_STORAGE_KEY = "tapmind.progress.v1";
const STORAGE_VERSION = 4;

const LEGACY_LEVEL_TO_NEW_LEVEL = Object.freeze({
  1: 1,
  2: 27,
  3: 9,
  4: 7,
  5: 14,
  6: 13,
  7: 3,
  8: 5,
  9: 11,
});

const EMPTY_PROGRESS = {
  version: STORAGE_VERSION,
  currentLevel: 1,
  completedLevels: [],
  characterStats: {},
  mastery: {},
  reviews: {},
  migration: {
    migratedFromVersion: null,
    migratedAt: null,
  },
};

function normalizeCharacterStats(stats) {
  if (!stats || typeof stats !== "object") return {};

  return Object.fromEntries(
    Object.entries(stats).map(([symbol, value]) => {
      const attempts = Math.max(0, Number(value?.attempts) || 0);
      const correct = Math.max(0, Number(value?.correct) || 0);
      return [symbol, {
        ...value,
        attempts,
        correct,
        accuracy: attempts ? Math.round((correct / attempts) * 100) : 0,
      }];
    })
  );
}

function normalizeMasteryMap(masteries) {
  if (!masteries || typeof masteries !== "object") return {};
  return Object.fromEntries(
    Object.entries(masteries).map(([symbol, value]) => {
      const normalized = normalizeMastery(value);
      return [symbol, {
        ...normalized,
        overall: calculateOverallMastery(normalized),
        state: getMasteryState(normalized, { previouslyPracticed: normalized.attempts > 0 }),
      }];
    })
  );
}

function normalizeReviewMap(reviews) {
  if (!reviews || typeof reviews !== "object") return {};
  return Object.fromEntries(
    Object.entries(reviews).map(([symbol, value]) => [symbol, normalizeReviewState(value)])
  );
}

function normalizeProgress(parsed) {
  return {
    ...EMPTY_PROGRESS,
    ...parsed,
    version: STORAGE_VERSION,
    completedLevels: Array.isArray(parsed.completedLevels)
      ? [...new Set(parsed.completedLevels.filter(Number.isFinite))].sort((a, b) => a - b)
      : [],
    characterStats: normalizeCharacterStats(parsed.characterStats),
    mastery: normalizeMasteryMap(parsed.mastery),
    reviews: normalizeReviewMap(parsed.reviews),
  };
}

function migrateProgress(parsed, fromVersion) {
  return normalizeProgress({
    ...parsed,
    mastery: parsed.mastery ?? {},
    reviews: {},
    migration: {
      migratedFromVersion: fromVersion,
      migratedAt: new Date().toISOString(),
    },
  });
}

function migrateV1Progress(parsed) {
  const migratedCompletedLevels = (parsed.completedLevels ?? [])
    .map((levelNumber) => LEGACY_LEVEL_TO_NEW_LEVEL[levelNumber])
    .filter(Number.isFinite);

  const mappedCurrentLevel = LEGACY_LEVEL_TO_NEW_LEVEL[parsed.currentLevel] ?? 1;

  return normalizeProgress({
    ...parsed,
    currentLevel: mappedCurrentLevel,
    completedLevels: migratedCompletedLevels,
    mastery: {},
    reviews: {},
    migration: {
      migratedFromVersion: 1,
      migratedAt: new Date().toISOString(),
    },
  });
}

function loadProgress() {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) {
      const parsed = JSON.parse(current);
      if (parsed?.version === STORAGE_VERSION) return normalizeProgress(parsed);
    }

    const v3 = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (v3) {
      const parsed = JSON.parse(v3);
      if (parsed?.version === 3) return migrateProgress(parsed, 3);
    }

    const v2 = localStorage.getItem(OLDER_STORAGE_KEY);
    if (v2) {
      const parsed = JSON.parse(v2);
      if (parsed?.version === 2) return migrateProgress(parsed, 2);
    }

    const v1 = localStorage.getItem(OLDEST_STORAGE_KEY);
    if (v1) {
      const parsed = JSON.parse(v1);
      if (parsed?.version === 1) return migrateV1Progress(parsed);
    }

    return EMPTY_PROGRESS;
  } catch {
    return EMPTY_PROGRESS;
  }
}

export default function useProgress() {
  const [progress, setProgress] = useState(loadProgress);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Persistence failure should never break the learning session.
    }
  }, [progress]);

  const recordAttempt = useCallback((level, correct, exercise = null, responseMeta = {}) => {
    const symbol = level?.letter ?? level?.symbol;
    if (!symbol) return;

    setProgress((previous) => {
      const existing = previous.characterStats[symbol] || {
        attempts: 0,
        correct: 0,
        lastPracticed: null,
      };

      const attempts = existing.attempts + 1;
      const correctCount = existing.correct + (correct ? 1 : 0);
      const now = new Date();

      const nextCharacterStats = {
        ...previous.characterStats,
        [symbol]: {
          ...existing,
          attempts,
          correct: correctCount,
          lastPracticed: now.toISOString(),
          accuracy: Math.round((correctCount / attempts) * 100),
        },
      };

      if (!exercise?.mode) {
        return { ...previous, characterStats: nextCharacterStats };
      }

      const previousMastery = previous.mastery[symbol] || createEmptyMastery();
      const event = buildMasteryEvent({
        mode: exercise.mode,
        correct,
        responseMs: responseMeta.responseMs,
        timingQuality: responseMeta.timingQuality,
        retained: responseMeta.retained,
        confidence: responseMeta.confidence,
      });
      const nextMastery = applyMasteryEvent(previousMastery, event);
      const storedMastery = {
        ...nextMastery,
        overall: calculateOverallMastery(nextMastery),
        state: getMasteryState(nextMastery, { previouslyPracticed: true }),
      };

      const previousReview = previous.reviews[symbol] || createInitialReviewState(now);
      const nextReview = scheduleReview(previousReview, {
        correct,
        confidence: responseMeta.confidence ?? storedMastery.confidence,
        timingQuality: responseMeta.timingQuality,
        responseMs: responseMeta.responseMs,
        now,
      });

      return {
        ...previous,
        characterStats: nextCharacterStats,
        mastery: {
          ...previous.mastery,
          [symbol]: storedMastery,
        },
        reviews: {
          ...previous.reviews,
          [symbol]: nextReview,
        },
      };
    });
  }, []);

  const completeLevel = useCallback((levelNumber) => {
    if (!Number.isFinite(levelNumber)) return;

    setProgress((previous) => {
      const completedLevels = previous.completedLevels.includes(levelNumber)
        ? previous.completedLevels
        : [...previous.completedLevels, levelNumber].sort((a, b) => a - b);

      const nextLevel = levelNumber + 1;

      return {
        ...previous,
        completedLevels,
        currentLevel: Math.max(previous.currentLevel, nextLevel),
      };
    });
  }, []);

  const setCurrentLevel = useCallback((levelNumber) => {
    if (!Number.isFinite(levelNumber)) return;

    setProgress((previous) => ({
      ...previous,
      currentLevel: levelNumber,
    }));
  }, []);

  const isLevelUnlocked = useCallback(
    (levelNumber) => {
      if (levelNumber === 1) return true;
      return progress.completedLevels.includes(levelNumber - 1);
    },
    [progress.completedLevels]
  );

  const getCharacterStats = useCallback(
    (letter) => progress.characterStats[letter] || null,
    [progress.characterStats]
  );

  const getMastery = useCallback(
    (symbol) => progress.mastery[symbol] || createEmptyMastery(),
    [progress.mastery],
  );

  const getReview = useCallback(
    (symbol) => progress.reviews[symbol] || createInitialReviewState(),
    [progress.reviews],
  );

  return {
    progress,
    recordAttempt,
    completeLevel,
    setCurrentLevel,
    isLevelUnlocked,
    getCharacterStats,
    getMastery,
    getReview,
  };
}
