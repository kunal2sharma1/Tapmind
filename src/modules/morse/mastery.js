export const MORSE_MASTERY_SKILLS = Object.freeze({
  RECOGNITION: "recognition",
  RECALL: "recall",
  AUDIO_RECOGNITION: "audioRecognition",
  AUDIO_RECALL: "audioRecall",
  SENDING: "sending",
  TIMING: "timing",
  SPEED: "speed",
  RETENTION: "retention",
  CONFIDENCE: "confidence"
});

export const MORSE_MASTERY_STATES = Object.freeze({
  NEW: "new",
  INTRODUCED: "introduced",
  LEARNING: "learning",
  DEVELOPING: "developing",
  STRONG: "strong",
  MASTERED: "mastered",
  AT_RISK: "at-risk",
  RELEARNING: "relearning"
});

export const DEFAULT_MASTERY = Object.freeze({
  recognition: 0,
  recall: 0,
  audioRecognition: 0,
  audioRecall: 0,
  sending: 0,
  timing: 0,
  speed: 0,
  retention: 0,
  confidence: 0,
  attempts: 0,
  correct: 0,
  consecutiveCorrect: 0,
  consecutiveIncorrect: 0,
  lastPracticed: null,
  lastCorrect: null,
  state: MORSE_MASTERY_STATES.NEW
});

const SKILL_WEIGHTS = Object.freeze({
  recognition: 0.14,
  recall: 0.14,
  audioRecognition: 0.13,
  audioRecall: 0.13,
  sending: 0.13,
  timing: 0.09,
  speed: 0.06,
  retention: 0.10,
  confidence: 0.08
});

const MODE_TO_SKILLS = Object.freeze({
  learn: ["recognition"],
  recognition: ["recognition"],
  recall: ["recall"],
  "audio-recognition": ["audioRecognition"],
  "audio-recall": ["audioRecall"],
  sending: ["sending", "timing"],
  mixed: ["recognition", "recall", "audioRecognition", "audioRecall", "sending", "timing"]
});

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function blend(previous, next, learningRate = 0.22) {
  return clamp(previous + (next - previous) * learningRate);
}

export function createEmptyMastery() {
  return { ...DEFAULT_MASTERY };
}

export function normalizeMastery(value = {}) {
  const normalized = { ...DEFAULT_MASTERY, ...value };
  for (const skill of Object.values(MORSE_MASTERY_SKILLS)) {
    if (skill in normalized) normalized[skill] = clamp(Number(normalized[skill]) || 0);
  }
  normalized.attempts = Math.max(0, Number(normalized.attempts) || 0);
  normalized.correct = Math.max(0, Number(normalized.correct) || 0);
  normalized.consecutiveCorrect = Math.max(0, Number(normalized.consecutiveCorrect) || 0);
  normalized.consecutiveIncorrect = Math.max(0, Number(normalized.consecutiveIncorrect) || 0);
  return normalized;
}

export function getSkillsForMode(mode) {
  return MODE_TO_SKILLS[mode] ? [...MODE_TO_SKILLS[mode]] : [];
}

export function calculateOverallMastery(mastery) {
  const normalized = normalizeMastery(mastery);
  let totalWeight = 0;
  let weighted = 0;

  for (const [skill, weight] of Object.entries(SKILL_WEIGHTS)) {
    weighted += normalized[skill] * weight;
    totalWeight += weight;
  }

  return totalWeight ? Math.round(clamp(weighted / totalWeight)) : 0;
}

export function getMasteryState(mastery, { previouslyPracticed = false } = {}) {
  const normalized = normalizeMastery(mastery);
  const overall = calculateOverallMastery(normalized);

  if (!previouslyPracticed && normalized.attempts === 0) return MORSE_MASTERY_STATES.NEW;
  if (normalized.consecutiveIncorrect >= 3 && overall < 55) return MORSE_MASTERY_STATES.RELEARNING;
  if (normalized.attempts > 0 && overall < 25) return MORSE_MASTERY_STATES.INTRODUCED;
  if (overall < 50) return MORSE_MASTERY_STATES.LEARNING;
  if (overall < 75) return MORSE_MASTERY_STATES.DEVELOPING;
  if (overall < 90) return MORSE_MASTERY_STATES.STRONG;
  if (normalized.retention < 75) return MORSE_MASTERY_STATES.AT_RISK;
  return MORSE_MASTERY_STATES.MASTERED;
}

export function buildMasteryEvent({
  mode,
  correct,
  responseMs = null,
  timingQuality = null,
  retained = null,
  confidence = null
} = {}) {
  const skills = getSkillsForMode(mode);
  return Object.freeze({
    mode,
    skills,
    correct: Boolean(correct),
    responseMs: Number.isFinite(responseMs) ? responseMs : null,
    timingQuality: Number.isFinite(timingQuality) ? clamp(timingQuality) : null,
    retained: retained === null ? null : Boolean(retained),
    confidence: Number.isFinite(confidence) ? clamp(confidence) : null,
    timestamp: new Date().toISOString()
  });
}

function skillTarget(event, skill, previous) {
  if (event.correct) {
    if (skill === MORSE_MASTERY_SKILLS.TIMING && event.timingQuality !== null) return event.timingQuality;
    if (skill === MORSE_MASTERY_SKILLS.SPEED && event.responseMs !== null) {
      return clamp(100 - Math.min(event.responseMs / 20, 100));
    }
    if (skill === MORSE_MASTERY_SKILLS.RETENTION && event.retained !== null) return event.retained ? 100 : 25;
    if (skill === MORSE_MASTERY_SKILLS.CONFIDENCE && event.confidence !== null) return event.confidence;
    return 100;
  }

  if (skill === MORSE_MASTERY_SKILLS.TIMING && event.timingQuality !== null) return event.timingQuality * 0.5;
  if (skill === MORSE_MASTERY_SKILLS.RETENTION && event.retained !== null) return event.retained ? 55 : 0;
  return Math.max(0, previous - 12);
}

export function applyMasteryEvent(mastery, event) {
  const previous = normalizeMastery(mastery);
  const next = { ...previous };

  next.attempts += 1;
  if (event.correct) {
    next.correct += 1;
    next.consecutiveCorrect += 1;
    next.consecutiveIncorrect = 0;
  } else {
    next.consecutiveIncorrect += 1;
    next.consecutiveCorrect = 0;
  }

  for (const skill of event.skills ?? []) {
    const target = skillTarget(event, skill, previous[skill] ?? 0);
    next[skill] = Math.round(blend(previous[skill] ?? 0, target, event.correct ? 0.22 : 0.30));
  }

  const accuracy = next.attempts ? (next.correct / next.attempts) * 100 : 0;
  next.confidence = Math.round(blend(previous.confidence, event.confidence ?? accuracy, event.correct ? 0.12 : 0.18));

  if (event.retained !== null) {
    next.retention = Math.round(blend(previous.retention, event.retained ? 100 : 0, event.retained ? 0.15 : 0.25));
  } else if (previous.attempts === 0 && event.correct) {
    next.retention = Math.round(blend(previous.retention, 70, 0.10));
  }

  next.lastPracticed = event.timestamp ?? new Date().toISOString();
  next.lastCorrect = event.correct ? next.lastPracticed : previous.lastCorrect;
  next.state = getMasteryState(next, { previouslyPracticed: true });

  return Object.freeze(next);
}

export function getSkillStrengths(mastery) {
  const normalized = normalizeMastery(mastery);
  return Object.fromEntries(
    Object.values(MORSE_MASTERY_SKILLS).map((skill) => [skill, Math.round(normalized[skill] ?? 0)])
  );
}

export function getWeakestSkills(mastery, limit = 3) {
  const strengths = getSkillStrengths(mastery);
  return Object.entries(strengths)
    .sort(([, a], [, b]) => a - b)
    .slice(0, Math.max(0, limit))
    .map(([skill, score]) => ({ skill, score }));
}
