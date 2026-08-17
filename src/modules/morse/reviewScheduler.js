export const REVIEW_QUALITY = Object.freeze({
  FAIL: 0,
  HARD: 1,
  GOOD: 2,
  EASY: 3
});

export const REVIEW_PHASES = Object.freeze({
  NEW: "new",
  LEARNING: "learning",
  REVIEW: "review",
  RELEARNING: "relearning"
});

const MINUTES = 60 * 1000;
const DAY = 24 * 60 * MINUTES;

export const REVIEW_DEFAULTS = Object.freeze({
  learningStepsMinutes: [1, 10],
  relearningStepsMinutes: [5, 30],
  graduatingIntervalDays: 1,
  easyBonus: 1.35,
  hardMultiplier: 1.2,
  goodMultiplier: 2.0,
  maxIntervalDays: 180,
  lapseMultiplier: 0.25
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeDate(value, fallback = Date.now()) {
  const parsed = value ? Date.parse(value) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeInterval(intervalMs) {
  return Math.max(MINUTES, Number(intervalMs) || MINUTES);
}

function qualityFromResult({ correct = false, confidence = 70, timingQuality = null, responseMs = null } = {}) {
  if (!correct) return REVIEW_QUALITY.FAIL;
  if (timingQuality !== null && timingQuality < 65) return REVIEW_QUALITY.HARD;
  if (responseMs !== null && responseMs > 2500) return REVIEW_QUALITY.HARD;
  if (confidence >= 90 && (timingQuality === null || timingQuality >= 90)) return REVIEW_QUALITY.EASY;
  return REVIEW_QUALITY.GOOD;
}

export function createInitialReviewState(now = new Date()) {
  const timestamp = now.toISOString();
  return Object.freeze({
    phase: REVIEW_PHASES.NEW,
    repetitions: 0,
    lapses: 0,
    intervalMs: 0,
    easeFactor: 2.5,
    dueAt: timestamp,
    lastReviewedAt: null,
    lastQuality: null,
    updatedAt: timestamp
  });
}

export function normalizeReviewState(state = {}) {
  const initial = createInitialReviewState();
  return {
    ...initial,
    ...state,
    repetitions: Math.max(0, Number(state.repetitions) || 0),
    lapses: Math.max(0, Number(state.lapses) || 0),
    intervalMs: Math.max(0, Number(state.intervalMs) || 0),
    easeFactor: clamp(Number(state.easeFactor) || initial.easeFactor, 1.3, 3.0),
    phase: Object.values(REVIEW_PHASES).includes(state.phase) ? state.phase : REVIEW_PHASES.NEW
  };
}

function nextInterval(state, quality, options) {
  const current = normalizeInterval(state.intervalMs || options.learningStepsMinutes[0] * MINUTES);
  if (quality === REVIEW_QUALITY.FAIL) {
    return Math.max(options.relearningStepsMinutes[0] * MINUTES, current * options.lapseMultiplier);
  }
  if (quality === REVIEW_QUALITY.HARD) return current * options.hardMultiplier;
  if (quality === REVIEW_QUALITY.EASY) return current * state.easeFactor * options.easyBonus;
  return current * state.easeFactor * options.goodMultiplier;
}

function capInterval(intervalMs, options) {
  return clamp(intervalMs, MINUTES, options.maxIntervalDays * DAY);
}

export function scheduleReview(state, {
  correct = false,
  confidence = 70,
  timingQuality = null,
  responseMs = null,
  now = new Date(),
  options = REVIEW_DEFAULTS
} = {}) {
  const current = normalizeReviewState(state);
  const timestamp = now.toISOString();
  const quality = qualityFromResult({ correct, confidence, timingQuality, responseMs });
  const next = { ...current };
  next.lastReviewedAt = timestamp;
  next.lastQuality = quality;
  next.updatedAt = timestamp;

  if (current.phase === REVIEW_PHASES.NEW) {
    next.phase = correct ? REVIEW_PHASES.LEARNING : REVIEW_PHASES.NEW;
    next.repetitions = correct ? 1 : 0;
    next.intervalMs = correct ? options.learningStepsMinutes[0] * MINUTES : 0;
    next.dueAt = new Date(now.getTime() + next.intervalMs).toISOString();
    return Object.freeze(next);
  }

  if (current.phase === REVIEW_PHASES.RELEARNING && correct) {
    next.phase = REVIEW_PHASES.REVIEW;
    next.repetitions += 1;
    next.intervalMs = options.graduatingIntervalDays * DAY;
    next.dueAt = new Date(now.getTime() + next.intervalMs).toISOString();
    next.easeFactor = clamp(current.easeFactor, 1.3, 3.0);
    return Object.freeze(next);
  }

  if (quality === REVIEW_QUALITY.FAIL) {
    next.phase = REVIEW_PHASES.RELEARNING;
    next.repetitions = 0;
    next.lapses = current.lapses + 1;
    next.easeFactor = clamp(current.easeFactor - 0.15, 1.3, 3.0);
    next.intervalMs = Math.max(options.relearningStepsMinutes[0] * MINUTES, current.intervalMs * options.lapseMultiplier);
    next.dueAt = new Date(now.getTime() + next.intervalMs).toISOString();
    return Object.freeze(next);
  }

  next.phase = REVIEW_PHASES.REVIEW;
  next.repetitions = current.repetitions + 1;
  if (quality === REVIEW_QUALITY.HARD) next.easeFactor = clamp(current.easeFactor - 0.05, 1.3, 3.0);
  if (quality === REVIEW_QUALITY.EASY) next.easeFactor = clamp(current.easeFactor + 0.05, 1.3, 3.0);

  next.intervalMs = capInterval(nextInterval(current, quality, options), options);
  next.dueAt = new Date(now.getTime() + next.intervalMs).toISOString();
  return Object.freeze(next);
}

export function isReviewDue(state, now = new Date()) {
  const normalized = normalizeReviewState(state);
  return normalizeDate(normalized.dueAt) <= now.getTime();
}

export function getDueAgeMs(state, now = new Date()) {
  const due = normalizeDate(normalizeReviewState(state).dueAt);
  return Math.max(0, now.getTime() - due);
}

export function rankReviewQueue(items = [], now = new Date()) {
  return [...items]
    .filter((item) => item?.review && isReviewDue(item.review, now))
    .sort((a, b) => {
      const ageDelta = getDueAgeMs(b.review, now) - getDueAgeMs(a.review, now);
      if (ageDelta !== 0) return ageDelta;
      const aOverall = Number(a.mastery?.overall) || 0;
      const bOverall = Number(b.mastery?.overall) || 0;
      return aOverall - bOverall;
    });
}

export function buildReviewQueue(items = [], { now = new Date(), limit = 20 } = {}) {
  return rankReviewQueue(items, now).slice(0, Math.max(0, limit));
}
