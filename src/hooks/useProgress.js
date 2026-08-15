import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "tapmind.progress.v1";
const STORAGE_VERSION = 1;

const EMPTY_PROGRESS = {
  version: STORAGE_VERSION,
  currentLevel: 1,
  completedLevels: [],
  characterStats: {},
};

function loadProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return EMPTY_PROGRESS;

    const parsed = JSON.parse(saved);
    if (!parsed || parsed.version !== STORAGE_VERSION) return EMPTY_PROGRESS;

    return {
      ...EMPTY_PROGRESS,
      ...parsed,
      completedLevels: Array.isArray(parsed.completedLevels)
        ? parsed.completedLevels
        : [],
      characterStats:
        parsed.characterStats && typeof parsed.characterStats === "object"
          ? parsed.characterStats
          : {},
    };
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
