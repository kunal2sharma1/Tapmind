import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "tapmind.challenges.v1";

const EMPTY = Object.freeze({
  version: 1,
  attempts: 0,
  wins: 0,
  currentStreak: 0,
  bestStreak: 0,
  bestScore: 0,
  bestEffectiveWpm: 0,
  completed: {},
  history: [],
  lastChallengeAt: null,
});

function normalize(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    ...EMPTY,
    ...source,
    version: 1,
    attempts: Math.max(0, Number(source.attempts) || 0),
    wins: Math.max(0, Number(source.wins) || 0),
    currentStreak: Math.max(0, Number(source.currentStreak) || 0),
    bestStreak: Math.max(0, Number(source.bestStreak) || 0),
    bestScore: Math.max(0, Number(source.bestScore) || 0),
    bestEffectiveWpm: Math.max(0, Number(source.bestEffectiveWpm) || 0),
    completed: source.completed && typeof source.completed === "object" ? source.completed : {},
    history: Array.isArray(source.history) ? source.history.slice(-100) : [],
    lastChallengeAt: source.lastChallengeAt ?? null,
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalize(JSON.parse(raw)) : EMPTY;
  } catch {
    return EMPTY;
  }
}

export default function useChallengeProgress() {
  const [progress, setProgress] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Challenge persistence must never break training.
    }
  }, [progress]);

  const recordAttempt = useCallback((challengeId, result) => {
    if (!challengeId || !result) return;
    setProgress((previous) => {
      const nextStreak = result.passed ? previous.currentStreak + 1 : 0;
      const historyEntry = {
        challengeId,
        passed: Boolean(result.passed),
        score: Number(result.score) || 0,
        accuracy: Number(result.accuracy) || 0,
        effectiveWpm: Number(result.effectiveWpm) || 0,
        at: new Date().toISOString(),
      };

      return normalize({
        ...previous,
        attempts: previous.attempts + 1,
        wins: previous.wins + (result.passed ? 1 : 0),
        currentStreak: nextStreak,
        bestStreak: Math.max(previous.bestStreak, nextStreak),
        bestScore: Math.max(previous.bestScore, result.score || 0),
        bestEffectiveWpm: Math.max(previous.bestEffectiveWpm, result.effectiveWpm || 0),
        completed: result.passed
          ? { ...previous.completed, [challengeId]: (previous.completed[challengeId] || 0) + 1 }
          : previous.completed,
        history: [...previous.history, historyEntry],
        lastChallengeAt: historyEntry.at,
      });
    });
  }, []);

  return { progress, recordAttempt };
}
