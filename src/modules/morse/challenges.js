import { RECEPTION_DIFFICULTIES } from "./reception";

export const CHALLENGE_TYPES = Object.freeze({
  SPEED: "speed",
  ACCURACY: "accuracy",
  STREAK: "streak",
  RECEPTION: "reception",
  REALISM: "realism",
  MIXED: "mixed",
});

export const CHALLENGE_MODIFIERS = Object.freeze({
  CLEAN: "clean",
  FARNsworth: "farnsworth",
  NO_REPLAY: "no-replay",
  TIME_LIMIT: "time-limit",
  REALISTIC_SIGNAL: "realistic-signal",
});

const CHALLENGE_DEFINITIONS = Object.freeze([
  { id: "speed-10", type: CHALLENGE_TYPES.SPEED, title: "10 WPM Sprint", target: 10, minAccuracy: 85, durationSeconds: 60, difficulty: 1, modifiers: [] },
  { id: "speed-15", type: CHALLENGE_TYPES.SPEED, title: "15 WPM Sprint", target: 15, minAccuracy: 90, durationSeconds: 60, difficulty: 2, modifiers: [] },
  { id: "speed-20", type: CHALLENGE_TYPES.SPEED, title: "20 WPM Sprint", target: 20, minAccuracy: 92, durationSeconds: 75, difficulty: 3, modifiers: [CHALLENGE_MODIFIERS.TIME_LIMIT] },
  { id: "accuracy-95", type: CHALLENGE_TYPES.ACCURACY, title: "95% Accuracy", target: 95, minAccuracy: 95, durationSeconds: 90, difficulty: 2, modifiers: [] },
  { id: "streak-10", type: CHALLENGE_TYPES.STREAK, title: "10 Clean", target: 10, minAccuracy: 100, durationSeconds: 120, difficulty: 2, modifiers: [CHALLENGE_MODIFIERS.NO_REPLAY] },
  { id: "reception-basic", type: CHALLENGE_TYPES.RECEPTION, title: "Copy the Message", target: 90, minAccuracy: 90, durationSeconds: 120, difficulty: 2, modifiers: [] },
  { id: "field-signal", type: CHALLENGE_TYPES.REALISM, title: "Field Signal", target: 85, minAccuracy: 85, durationSeconds: 120, difficulty: 4, modifiers: [CHALLENGE_MODIFIERS.REALISTIC_SIGNAL] },
  { id: "mixed-master", type: CHALLENGE_TYPES.MIXED, title: "Morse Master", target: 90, minAccuracy: 90, durationSeconds: 180, difficulty: 4, modifiers: [CHALLENGE_MODIFIERS.TIME_LIMIT, CHALLENGE_MODIFIERS.REALISTIC_SIGNAL] },
]);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hashSeed(seed) {
  let hash = 2166136261;
  for (const char of String(seed)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

export function getChallengeDefinitions(maxDifficulty = 4) {
  return CHALLENGE_DEFINITIONS.filter((challenge) => challenge.difficulty <= clamp(maxDifficulty, 1, 4));
}

export function getChallengeById(id) {
  return CHALLENGE_DEFINITIONS.find((challenge) => challenge.id === id) ?? null;
}

export function isChallengeEligible(challenge, {
  introducedCharacterCount = 0,
  bestEffectiveWpm = 0,
  bestCharacterAccuracy = 0,
  completedChallenges = [],
} = {}) {
  if (!challenge) return false;
  if (challenge.type !== CHALLENGE_TYPES.SPEED && introducedCharacterCount < 3) return false;
  if (challenge.type === CHALLENGE_TYPES.SPEED && challenge.target > Math.max(10, bestEffectiveWpm + 10)) return false;
  if (challenge.type === CHALLENGE_TYPES.ACCURACY && bestCharacterAccuracy < 70 && challenge.target > 90) return false;
  return !completedChallenges.includes(challenge.id) || challenge.difficulty >= 4;
}

export function rankChallenges(challenges, context = {}) {
  return [...challenges]
    .filter((challenge) => isChallengeEligible(challenge, context))
    .map((challenge) => ({
      challenge,
      score:
        challenge.difficulty * 10
        + (challenge.target <= (context.bestEffectiveWpm ?? 0) + 5 ? 20 : 0)
        + (challenge.type === CHALLENGE_TYPES.REALISM && context.receptionReady ? 15 : 0),
    }))
    .sort((a, b) => b.score - a.score || a.challenge.id.localeCompare(b.challenge.id));
}

export function buildChallengeSession({ count = 3, seed = 0, maxDifficulty = 4, context = {} } = {}) {
  const ranked = rankChallenges(getChallengeDefinitions(maxDifficulty), context);
  const pool = ranked.map((entry) => entry.challenge);
  if (!pool.length) return Object.freeze([]);

  const cursor = hashSeed(seed) % pool.length;
  const safeCount = clamp(Math.floor(count), 1, Math.min(6, pool.length));
  const selected = Array.from({ length: safeCount }, (_, index) => pool[(cursor + index) % pool.length]);

  return Object.freeze(selected.map((challenge, index) => Object.freeze({
    ...challenge,
    sessionIndex: index,
    sessionSeed: hashSeed(`${seed}:${challenge.id}:${index}`),
  })));
}

export function scoreChallenge({
  challenge,
  accuracy = 0,
  effectiveWpm = 0,
  streak = 0,
  elapsedMs = 0,
  completed = false,
} = {}) {
  if (!challenge) return Object.freeze({ passed: false, score: 0, reason: "missing-challenge" });

  const accuracyComponent = clamp(accuracy, 0, 100);
  const speedComponent = challenge.target > 0 ? clamp((effectiveWpm / challenge.target) * 100, 0, 100) : 0;
  const streakComponent = challenge.type === CHALLENGE_TYPES.STREAK ? clamp((streak / challenge.target) * 100, 0, 100) : accuracyComponent;
  const timeFactor = elapsedMs > challenge.durationSeconds * 1000 ? 0.5 : 1;
  const passed = completed
    && accuracyComponent >= challenge.minAccuracy
    && (challenge.type !== CHALLENGE_TYPES.SPEED || effectiveWpm >= challenge.target)
    && (challenge.type !== CHALLENGE_TYPES.STREAK || streak >= challenge.target);

  return Object.freeze({
    passed,
    score: Math.round(((accuracyComponent * 0.5) + (speedComponent * 0.3) + (streakComponent * 0.2)) * timeFactor),
    accuracy: Math.round(accuracyComponent),
    effectiveWpm: Number(effectiveWpm.toFixed(1)),
    elapsedMs: Math.max(0, elapsedMs),
  });
}

export function getSignalDifficulty(challenge) {
  if (!challenge?.modifiers?.includes(CHALLENGE_MODIFIERS.REALISTIC_SIGNAL)) return null;
  return challenge.difficulty >= 4 ? RECEPTION_DIFFICULTIES.ADVANCED : RECEPTION_DIFFICULTIES.OPERATIONAL;
}

export const CHALLENGE_CATALOG = CHALLENGE_DEFINITIONS;
