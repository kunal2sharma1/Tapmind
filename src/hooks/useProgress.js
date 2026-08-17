import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "tapmind.progress.v2";
const LEGACY_STORAGE_KEY = "tapmind.progress.v1";
const STORAGE_VERSION = 2;

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
  migration: {
    migratedFromVersion: null,
    migratedAt: null,
  },
};

function normalizeProgress(parsed) {
  return {
    ...EMPTY_PROGRESS,
    ...parsed,
    version: STORAGE_VERSION,
    completedLevels: Array.isArray(parsed.completedLevels)
      ? [...new Set(parsed.completedLevels.filter(Number.isFinite))].sort((a, b) => a - b)
      : [],
    characterStats:
      parsed.characterStats && typeof parsed.characterStats === "object"
        ? parsed.characterStats
        : {},
  };
}

function migrateLegacyProgress(parsed) {
  const migratedCompletedLevels = (parsed.completedLevels ?? [])
    .map((levelNumber) => LEGACY_LEVEL_TO_NEW_LEVEL[levelNumber])
    .filter(Number.isFinite);

  const mappedCurrentLevel = LEGACY_LEVEL_TO_NEW_LEVEL[parsed.currentLevel] ?? 1;

  return normalizeProgress({
    ...parsed,
    currentLevel: mappedCurrentLevel,
    completedLevels: migratedCompletedLevels,
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

    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (parsed?.version === 1) return migrateLegacyProgress(parsed);
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

  const recordAttempt = useCallback((level, correct) => {
    if (!level?.letter) return;

    setProgress((previous) => {
      const existing = previous.characterStats[level.letter] || {
        attempts: 0,
        correct: 0,
        lastPracticed: null,
      };

      const attempts = existing.attempts + 1;
      const correctCount = existing.correct + (correct ? 1 : 0);

      return {
        ...previous,
        characterStats: {
          ...previous.characterStats,
          [level.letter]: {
            ...existing,
            attempts,
            correct: correctCount,
            lastPracticed: new Date().toISOString(),
            accuracy: Math.round((correctCount / attempts) * 100),
          },
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

  return {
    progress,
    recordAttempt,
    completeLevel,
    setCurrentLevel,
    isLevelUnlocked,
    getCharacterStats,
  };
}
