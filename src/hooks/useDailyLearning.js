import { useCallback, useMemo, useState } from "react";
import { buildDailySession, summarizeDailySession } from "../modules/morse/dailyLearning";

const STORAGE_KEY = "tapmind.daily.v1";

function loadSavedSession() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!parsed || typeof parsed !== "object") return null;
    const today = new Date().toISOString().slice(0, 10);
    if (parsed.id !== `daily:${today}`) return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function useDailyLearning({ progress, introducedCharacters = [] } = {}) {
  const [session, setSession] = useState(loadSavedSession);

  const reviewMap = progress?.reviews ?? {};
  const characterMastery = progress?.mastery ?? {};

  const todaySession = useMemo(() => {
    if (session) return session;
    return buildDailySession({
      mastery: characterMastery,
      reviewMap,
      characterMastery,
      introducedCharacters,
    });
  }, [session, characterMastery, reviewMap, introducedCharacters]);

  const saveSession = useCallback((next) => {
    setSession(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // A daily session should continue even if local persistence is unavailable.
    }
  }, []);

  const startOrRefresh = useCallback(() => {
    const next = buildDailySession({
      mastery: progress?.mastery ?? {},
      reviewMap: progress?.reviews ?? {},
      characterMastery: progress?.mastery ?? {},
      introducedCharacters,
      seed: Date.now(),
    });
    saveSession(next);
    return next;
  }, [progress, introducedCharacters, saveSession]);

  const summary = useMemo(() => summarizeDailySession(todaySession), [todaySession]);

  return {
    session: todaySession,
    summary,
    startOrRefresh,
    saveSession,
  };
}
