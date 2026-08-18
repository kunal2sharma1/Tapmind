import { getStandardTiming, getFarnsworthTiming, isValidWpm } from "./timing";

export const SPEED_TIERS = Object.freeze([
  5, 7, 10, 12, 15, 18, 20, 25, 30, 35, 40, 50, 60
]);

export const SPEED_DEFAULTS = Object.freeze({
  startingCharacterWpm: 15,
  startingEffectiveWpm: 10,
  passAccuracy: 85,
  passMinCorrect: 8,
  sessionSeconds: 60,
  maxResponseMs: 6000,
  maxCharacters: 120
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeSpeedProfile(profile = {}) {
  const characterWpm = Number(profile.characterWpm) || SPEED_DEFAULTS.startingCharacterWpm;
  const effectiveWpm = Number(profile.effectiveWpm) || SPEED_DEFAULTS.startingEffectiveWpm;
  return {
    characterWpm: clamp(characterWpm, 1, 200),
    effectiveWpm: clamp(effectiveWpm, 1, 200),
    bestCharacterWpm: Math.max(0, Number(profile.bestCharacterWpm) || 0),
    bestEffectiveWpm: Math.max(0, Number(profile.bestEffectiveWpm) || 0),
    qualifiedCharacterWpm: Math.max(0, Number(profile.qualifiedCharacterWpm) || 0),
    qualifiedEffectiveWpm: Math.max(0, Number(profile.qualifiedEffectiveWpm) || 0),
    attempts: Math.max(0, Number(profile.attempts) || 0),
    passedAttempts: Math.max(0, Number(profile.passedAttempts) || 0),
    lastAttemptAt: profile.lastAttemptAt ?? null
  };
}

export function speedTiming({ characterWpm, effectiveWpm, mode = "farnsworth" } = {}) {
  if (!isValidWpm(characterWpm) || !isValidWpm(effectiveWpm)) {
    throw new RangeError("Character and effective WPM must be between 1 and 200.");
  }
  return mode === "standard"
    ? getStandardTiming(characterWpm)
    : getFarnsworthTiming(effectiveWpm, characterWpm);
}

export function calculateEffectiveWpm({ characters, elapsedMs }) {
  if (!Number.isFinite(characters) || characters <= 0 || !Number.isFinite(elapsedMs) || elapsedMs <= 0) return 0;
  return (characters * 60_000) / (elapsedMs * 5);
}

export function calculateAccuracy(correct, total) {
  if (!Number.isFinite(total) || total <= 0) return 0;
  return Math.round(clamp((correct / total) * 100, 0, 100));
}

export function evaluateSpeedAttempt({ correct = 0, attempted = 0, elapsedMs = 0, targetEffectiveWpm = 0, responseTimes = [] } = {}, options = SPEED_DEFAULTS) {
  const accuracy = calculateAccuracy(correct, attempted);
  const measuredEffectiveWpm = calculateEffectiveWpm(correct, elapsedMs);
  const correctCountPass = correct >= options.passMinCorrect;
  const accuracyPass = accuracy >= options.passAccuracy;
  const speedPass = targetEffectiveWpm <= 0 || measuredEffectiveWpm >= targetEffectiveWpm * 0.85;
  const responsePass = responseTimes.length === 0 || responseTimes.every((value) => value <= options.maxResponseMs);

  return Object.freeze({
    accuracy,
    measuredEffectiveWpm: Math.round(measuredEffectiveWpm * 10) / 10,
    correct,
    attempted,
    elapsedMs,
    targetEffectiveWpm,
    passed: correctCountPass && accuracyPass && speedPass && responsePass
  });
}

function nextTier(currentWpm, passed) {
  const index = SPEED_TIERS.findIndex((tier) => tier >= currentWpm);
  const resolved = index < 0 ? SPEED_TIERS.length - 1 : index;
  if (passed) return SPEED_TIERS[Math.min(SPEED_TIERS.length - 1, resolved + (SPEED_TIERS[resolved] === currentWpm ? 1 : 0))];
  return SPEED_TIERS[Math.max(0, resolved - 1)];
}

export function getNextSpeedTarget({ characterWpm, effectiveWpm, passed }) {
  const nextCharacterWpm = nextTier(characterWpm, passed);
  const nextEffectiveWpm = Math.min(nextCharacterWpm, passed ? Math.max(effectiveWpm + 2, nextCharacterWpm - 5) : effectiveWpm);
  return { characterWpm: nextCharacterWpm, effectiveWpm: nextEffectiveWpm };
}

export function applySpeedAttempt(profile, result, now = new Date()) {
  const current = normalizeSpeedProfile(profile);
  const next = { ...current };
  next.attempts += 1;
  if (result.passed) next.passedAttempts += 1;
  next.bestCharacterWpm = Math.max(current.bestCharacterWpm, current.characterWpm);
  next.bestEffectiveWpm = Math.max(current.bestEffectiveWpm, result.measuredEffectiveWpm);
  next.lastAttemptAt = now.toISOString();

  if (result.passed) {
    next.qualifiedCharacterWpm = Math.max(current.qualifiedCharacterWpm, current.characterWpm);
    next.qualifiedEffectiveWpm = Math.max(current.qualifiedEffectiveWpm, Math.min(current.effectiveWpm, result.measuredEffectiveWpm));
    Object.assign(next, getNextSpeedTarget({
      characterWpm: current.characterWpm,
      effectiveWpm: current.effectiveWpm,
      passed: true
    }));
  }

  return Object.freeze(next);
}

export function getSpeedTierLabel(wpm) {
  if (wpm < 10) return "Foundation";
  if (wpm < 15) return "Beginner";
  if (wpm < 20) return "Developing";
  if (wpm < 30) return "Intermediate";
  if (wpm < 40) return "Advanced";
  return "Fast Reception";
}
