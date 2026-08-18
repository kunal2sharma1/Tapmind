import { useCallback, useEffect, useState } from "react";
import { normalizeSpeedProfile, SPEED_DEFAULTS } from "../modules/morse/speedEngine";

const STORAGE_KEY = "tapmind.speed.v1";

const DEFAULT_PROFILE = normalizeSpeedProfile({
  characterWpm: SPEED_DEFAULTS.startingCharacterWpm,
  effectiveWpm: SPEED_DEFAULTS.startingEffectiveWpm,
});

function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return normalizeSpeedProfile(JSON.parse(raw));
  } catch {
    return DEFAULT_PROFILE;
  }
}

export default function useSpeedProgress() {
  const [profile, setProfile] = useState(loadProfile);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Speed progress must never break a learning session.
    }
  }, [profile]);

  const recordSpeedAttempt = useCallback((nextProfile) => {
    setProfile(normalizeSpeedProfile(nextProfile));
  }, []);

  const resetSpeedProfile = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
  }, []);

  return { profile, recordSpeedAttempt, resetSpeedProfile };
}
