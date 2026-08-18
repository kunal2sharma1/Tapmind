import { getWeakestSkills, calculateOverallMastery } from "./mastery.js";
import { MORSE_LEARNING_MODES } from "./learningModes.js";

const MODE_FOR_SKILL = Object.freeze({
  recognition: MORSE_LEARNING_MODES.RECOGNITION,
  recall: MORSE_LEARNING_MODES.RECALL,
  audioRecognition: MORSE_LEARNING_MODES.AUDIO_RECOGNITION,
  audioRecall: MORSE_LEARNING_MODES.AUDIO_RECALL,
  sending: MORSE_LEARNING_MODES.SENDING,
  timing: MORSE_LEARNING_MODES.SENDING,
  speed: MORSE_LEARNING_MODES.SENDING,
  retention: MORSE_LEARNING_MODES.RECOGNITION,
  confidence: MORSE_LEARNING_MODES.MIXED
});

const DEFAULT_SESSION_WEIGHTS = Object.freeze({
  weak: 0.50,
  reinforce: 0.20,
  retention: 0.20,
  new: 0.10
});

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function scoreCandidate(candidate, stats = {}, weakSkills = []) {
  const mastery = Number.isFinite(stats.overall) ? stats.overall : 0;
  const accuracy = Number.isFinite(stats.accuracy) ? stats.accuracy : 0;
  const attempts = Number.isFinite(stats.attempts) ? stats.attempts : 0;
  const recencyHours = Number.isFinite(stats.hoursSincePractice) ? stats.hoursSincePractice : Infinity;

  let score = 0;

  if (attempts === 0) score += 0.20;
  score += (1 - clamp(mastery / 100)) * 0.45;
  score += (1 - clamp(accuracy / 100)) * 0.15;
  score += clamp(recencyHours / (24 * 7)) * 0.10;

  if (weakSkills.some((item) => item.skill && item.score < 50)) score += 0.10;
  if (candidate?.difficulty === "advanced" && mastery < 60) score -= 0.10;
  if (candidate?.symbol && stats.recentlyFailed) score += 0.15;

  return clamp(score);
}

export function buildAdaptiveContext({ characterMastery = {}, now = Date.now() } = {}) {
  const entries = Object.entries(characterMastery).map(([id, raw]) => {
    const stats = { ...raw };
    const lastPracticedMs = stats.lastPracticed ? Date.parse(stats.lastPracticed) : NaN;
    const hoursSincePractice = Number.isFinite(lastPracticedMs)
      ? Math.max(0, now - lastPracticedMs) / 3_600_000
      : Infinity;

    return [id, {
      ...stats,
      overall: Number.isFinite(stats.overall) ? stats.overall : 0,
      accuracy: Number.isFinite(stats.accuracy) ? stats.accuracy : 0,
      attempts: Number.isFinite(stats.attempts) ? stats.attempts : 0,
      hoursSincePractice,
      recentlyFailed: Number(stats.consecutiveIncorrect) >= 2
    }];
  });

  return Object.freeze(Object.fromEntries(entries));
}

export function rankAdaptiveCandidates(candidates = [], {
  characterMastery = {},
  weakestSkills = [],
  now = Date.now()
} = {}) {
  const context = buildAdaptiveContext({ characterMastery, now });
  const fallbackWeakSkills = weakestSkills.length
    ? weakestSkills
    : getWeakestSkills({
        recognition: 0,
        recall: 0,
        audioRecognition: 0,
        audioRecall: 0,
        sending: 0,
        timing: 0,
        speed: 0,
        retention: 0,
        confidence: 0
      }, 3);

  return candidates
    .map((candidate) => ({
      candidate,
      score: scoreCandidate(candidate, context[candidate.id] ?? {}, fallbackWeakSkills)
    }))
    .sort((a, b) => b.score - a.score);
}

export function chooseAdaptiveMode(mastery = {}) {
  const weakest = getWeakestSkills(mastery, 1)[0];
  if (!weakest) return MORSE_LEARNING_MODES.MIXED;
  return MODE_FOR_SKILL[weakest.skill] ?? MORSE_LEARNING_MODES.MIXED;
}

export function buildAdaptiveSessionPlan({
  candidates = [],
  characterMastery = {},
  sessionLength = 10,
  weights = DEFAULT_SESSION_WEIGHTS,
  mastery = {},
  seed = 1
} = {}) {
  const length = Math.max(1, Math.floor(sessionLength));
  const ranked = rankAdaptiveCandidates(candidates, { characterMastery });
  const sorted = ranked.map((entry) => entry.candidate);
  const countWeak = Math.max(1, Math.round(length * weights.weak));
  const countReinforce = Math.max(0, Math.round(length * weights.reinforce));
  const countRetention = Math.max(0, Math.round(length * weights.retention));
  const used = new Set();
  const plan = [];

  function addCandidate(candidate, role) {
    if (!candidate || used.has(candidate.id) || plan.length >= length) return false;
    used.add(candidate.id);
    plan.push(Object.freeze({
      role,
      characterId: candidate.id,
      mode: chooseAdaptiveMode(mastery),
      score: ranked.find((entry) => entry.candidate.id === candidate.id)?.score ?? 0
    }));
    return true;
  }

  for (const candidate of sorted.slice(0, countWeak)) addCandidate(candidate, "weak");
  for (const candidate of sorted.slice(countWeak, countWeak + countReinforce)) addCandidate(candidate, "reinforce");
  for (const candidate of sorted.slice(-countRetention)) addCandidate(candidate, "retention");

  let cursor = Math.abs(Math.floor(seed)) % Math.max(sorted.length, 1);
  while (plan.length < length && sorted.length) {
    addCandidate(sorted[cursor % sorted.length], "new");
    cursor += 7;
    if (cursor > sorted.length * 3) break;
  }

  return Object.freeze({
    sessionLength: plan.length,
    overallMastery: calculateOverallMastery(mastery),
    items: plan
  });
}

export function summarizeAdaptiveDecision(plan) {
  const counts = plan.items.reduce((result, item) => {
    result[item.role] = (result[item.role] ?? 0) + 1;
    return result;
  }, {});

  return Object.freeze({
    sessionLength: plan.sessionLength,
    overallMastery: plan.overallMastery,
    breakdown: counts,
    dominantMode: plan.items[0]?.mode ?? MORSE_LEARNING_MODES.MIXED
  });
}
