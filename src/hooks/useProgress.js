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

const STORAGE_KEY = "tapmind.progress.v5";
const LEGACY_STORAGE_KEY = "tapmind.progress.v4";
const OLDER_STORAGE_KEY = "tapmind.progress.v3";
const STORAGE_V2_KEY = "tapmind.progress.v2";
const STORAGE_V1_KEY = "tapmind.progress.v1";
const STORAGE_VERSION = 5;

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
  wordMastery: {},
  sentenceMastery: {},
  migration: {
    migratedFromVersion: null,
    migratedAt: null,
  },
};

function normalizeAccuracyMap(stats) {
  if (!stats || typeof stats !== "object") return {};
  return Object.fromEntries(
    Object.entries(stats).map(([key, value]) => {
      const attempts = Math.max(0, Number(value?.attempts) || 0);
      const correct = Math.max(0, Number(value?.correct) || 0);
      return [key, {
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
    Object.entries(masteries).map(([key, value]) => {
      const normalized = normalizeMastery(value);
      return [key, {
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
    Object.entries(reviews).map(([key, value]) => [key, normalizeReviewState(value)])
  );
}

function normalizeLearningMap(map) {
  if (!map || typeof map !== "object") return {};
  return Object.fromEntries(
    Object.entries(map).map(([key, value]) => ({
      0: key,
      1: {
        attempts: Math.max(0, Number(value?.attempts) || 0),
        correct: Math.max(0, Number(value?.correct) || 0),
        accuracy: Number.isFinite(value?.accuracy) ? value.accuracy : 0,
        lastPracticed: value?.lastPracticed ?? null,
        overall: Math.min(100, Math.max(0, Number(value?.overall) || 0)),
      },
    })).reduce((acc, item) => ({ ...acc, [item[0]]: item[1] }), {})
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
    characterStats: normalizeAccuracyMap(parsed.characterStats),
    mastery: normalizeMasteryMap(parsed.mastery),
    reviews: normalizeReviewMap(parsed.reviews),
    wordMastery: normalizeLearningMap(parsed.wordMastery),
    sentenceMastery: normalizeLearningMap(parsed.sentenceMastery),
  };
}

function migrateProgress(parsed, fromVersion) {
  return normalizeProgress({
    ...parsed,
    wordMastery: parsed.wordMastery ?? {},
    sentenceMastery: parsed.sentenceMastery ?? {},
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
    wordMastery: {},
    sentenceMastery: {},
    migration: { migratedFromVersion: 1, migratedAt: new Date().toISOString() },
  });
}

function loadProgress() {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) {
      const parsed = JSON.parse(current);
      if (parsed?.version === STORAGE_VERSION) return normalizeProgress(parsed);
    }
    const v4 = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (v4) {
      const parsed = JSON.parse(v4);
      if (parsed?.version === 4) return migrateProgress(parsed, 4);
    }
    const v3 = localStorage.getItem(OLDER_STORAGE_KEY);
    if (v3) {
      const parsed = JSON.parse(v3);
      if (parsed?.version === 3) return migrateProgress(parsed, 3);
    }
    const v2 = localStorage.getItem(STORAGE_V2_KEY);
    if (v2) {
      const parsed = JSON.parse(v2);
      if (parsed?.version === 2) return migrateProgress(parsed, 2);
    }
    const v1 = localStorage.getItem(STORAGE_V1_KEY);
    if (v1) {
      const parsed = JSON.parse(v1);
      if (parsed?.version === 1) return migrateV1Progress(parsed);
    }
    return EMPTY_PROGRESS;
  } catch {
    return EMPTY_PROGRESS;
  }
}

function updateLearningMap(previousMap, key, correct) {
  const existing = previousMap[key] || { attempts: 0, correct: 0, accuracy: 0, lastPracticed: null, overall: 0 };
  const attempts = existing.attempts + 1;
  const correctCount = existing.correct + (correct ? 1 : 0);
  const accuracy = Math.round((correctCount / attempts) * 100);
  const overall = Math.round(existing.overall + (accuracy - existing.overall) * (correct ? 0.22 : 0.30));
  return {
    ...previousMap,
    [key]: {
      ...existing,
      attempts,
      correct: correctCount,
      accuracy,
      overall: Math.min(100, Math.max(0, overall)),
      lastPracticed: new Date().toISOString(),
    },
  };
}

export default function useProgress() {
  const [progress, setProgress] = useState(loadProgress);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Persistence failure should never break learning.
    }
  }, [progress]);

  const recordAttempt = useCallback((level, correct, exercise = null, responseMeta = {}) => {
    const symbol = level?.letter ?? level?.symbol;
    if (!symbol) return;

    setProgress((previous) => {
      const existing = previous.characterStats[symbol] || { attempts: 0, correct: 0, lastPracticed: null };
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

      if (!exercise?.mode) return { ...previous, characterStats: nextCharacterStats };

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
        mastery: { ...previous.mastery, [symbol]: storedMastery },
        reviews: { ...previous.reviews, [symbol]: nextReview },
      };
    });
  }, []);

  const recordWordAttempt = useCallback((wordId, correct) => {
    if (!wordId) return;
    setProgress((previous) => ({
      ...previous,
      wordMastery: updateLearningMap(previous.wordMastery, wordId, correct),
    }));
  }, []);

  const recordSentenceAttempt = useCallback((sentenceId, correct) => {
    if (!sentenceId) return;
    setProgress((previous) => ({
      ...previous,
      sentenceMastery: updateLearningMap(previous.sentenceMastery, sentenceId, correct),
    }));
  }, []);

  const completeLevel = useCallback((levelNumber) => {
    if (!Number.isFinite(levelNumber)) return;
    setProgress((previous) => {
      const completedLevels = previous.completedLevels.includes(levelNumber)
        ? previous.completedLevels
        : [...previous.completedLevels, levelNumber].sort((a, b) => a - b);
      return {
        ...previous,
        completedLevels,
        currentLevel: Math.max(previous.currentLevel, levelNumber + 1),
      };
    });
  }, []);

  const setCurrentLevel = useCallback((levelNumber) => {
    if (!Number.isFinite(levelNumber)) return;
    setProgress((previous) => ({ ...previous, currentLevel: levelNumber }));
  }, []);

  const isLevelUnlocked = useCallback(
    (levelNumber) => levelNumber === 1 || progress.completedLevels.includes(levelNumber - 1),
    [progress.completedLevels]
  );

  const getCharacterStats = useCallback((symbol) => progress.characterStats[symbol] || null, [progress.characterStats]);
  const getMastery = useCallback((symbol) => progress.mastery[symbol] || createEmptyMastery(), [progress.mastery]);
  const getReview = useCallback((symbol) => progress.reviews[symbol] || createInitialReviewState(), [progress.reviews]);

  return {
    progress,
    recordAttempt,
    recordWordAttempt,
    recordSentenceAttempt,
    completeLevel,
    setCurrentLevel,
    isLevelUnlocked,
    getCharacterStats,
    getMastery,
    getReview,
  };
}
