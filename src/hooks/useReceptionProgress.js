import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "tapmind.reception.v1";

const EMPTY_PROFILE = Object.freeze({
  version: 1,
  attempts: 0,
  completedSessions: 0,
  bestCharacterAccuracy: 0,
  bestWordAccuracy: 0,
  bestEffectiveWpm: 0,
  lastSessionAt: null,
});

function normalizeProfile(value) {
  return {
    ...EMPTY_PROFILE,
    ...(value && typeof value === "object" ? value : {}),
    version: 1,
    attempts: Math.max(0, Number(value?.attempts) || 0),
    completedSessions: Math.max(0, Number(value?.completedSessions) || 0),
    bestCharacterAccuracy: Math.max(0, Math.min(100, Number(value?.bestCharacterAccuracy) || 0)),
    bestWordAccuracy: Math.max(0, Math.min(100, Number(value?.bestWordAccuracy) || 0)),
    bestEffectiveWpm: Math.max(0, Number(value?.bestEffectiveWpm) || 0),
    lastSessionAt: value?.lastSessionAt ?? null,
  };
}

function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeProfile(JSON.parse(raw)) : EMPTY_PROFILE;
  } catch {
    return EMPTY_PROFILE;
  }
}

export default function useReceptionProgress() {
  const [profile, setProfile] = useState(loadProfile);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Persistence must never interrupt the learner session.
    }
  }, [profile]);

  const recordAttempt = useCallback((result) => {
    setProfile((previous) => normalizeProfile({
      ...previous,
      attempts: previous.attempts + 1,
      bestCharacterAccuracy: Math.max(previous.bestCharacterAccuracy, result.characterAccuracy ?? 0),
      bestWordAccuracy: Math.max(previous.bestWordAccuracy, result.wordAccuracy ?? 0),
      bestEffectiveWpm: Math.max(previous.bestEffectiveWpm, result.effectiveWpm ?? 0),
      lastSessionAt: new Date().toISOString(),
    }));
  }, []);

  const recordSessionComplete = useCallback(() => {
    setProfile((previous) => normalizeProfile({
      ...previous,
      completedSessions: previous.completedSessions + 1,
      lastSessionAt: new Date().toISOString(),
    }));
  }, []);

  return { profile, recordAttempt, recordSessionComplete };
}
