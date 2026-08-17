import { MORSE_LEARNING_MODES } from "./learningModes";

const DEFAULT_POLICY = Object.freeze({
  minMasteryScore: 0,
  requiresAudioSupport: false,
  requiresInputSupport: false
});

const MODE_POLICIES = Object.freeze({
  [MORSE_LEARNING_MODES.LEARN]: {
    minMasteryScore: 0,
    requiresAudioSupport: false,
    requiresInputSupport: false
  },
  [MORSE_LEARNING_MODES.RECOGNITION]: {
    minMasteryScore: 0,
    requiresAudioSupport: false,
    requiresInputSupport: false
  },
  [MORSE_LEARNING_MODES.RECALL]: {
    minMasteryScore: 0,
    requiresAudioSupport: false,
    requiresInputSupport: true
  },
  [MORSE_LEARNING_MODES.AUDIO_RECOGNITION]: {
    minMasteryScore: 0,
    requiresAudioSupport: true,
    requiresInputSupport: false
  },
  [MORSE_LEARNING_MODES.AUDIO_RECALL]: {
    minMasteryScore: 0,
    requiresAudioSupport: true,
    requiresInputSupport: true
  },
  [MORSE_LEARNING_MODES.SENDING]: {
    minMasteryScore: 0,
    requiresAudioSupport: false,
    requiresInputSupport: true
  },
  [MORSE_LEARNING_MODES.MIXED]: {
    minMasteryScore: 25,
    requiresAudioSupport: true,
    requiresInputSupport: true
  }
});

export function getLearningModePolicy(mode) {
  return Object.freeze({
    ...DEFAULT_POLICY,
    ...(MODE_POLICIES[mode] ?? {})
  });
}

export function canUseLearningMode(mode, context = {}) {
  const policy = getLearningModePolicy(mode);
  const masteryScore = Number.isFinite(context.masteryScore) ? context.masteryScore : 0;

  if (masteryScore < policy.minMasteryScore) {
    return Object.freeze({
      allowed: false,
      reason: `Requires at least ${policy.minMasteryScore}% mastery.`,
      policy
    });
  }

  if (policy.requiresAudioSupport && context.audioSupported === false) {
    return Object.freeze({
      allowed: false,
      reason: "Audio support is required for this training mode.",
      policy
    });
  }

  if (policy.requiresInputSupport && context.inputSupported === false) {
    return Object.freeze({
      allowed: false,
      reason: "Morse input support is required for this training mode.",
      policy
    });
  }

  return Object.freeze({ allowed: true, reason: null, policy });
}

export function getRecommendedLearningModes(context = {}) {
  return Object.values(MORSE_LEARNING_MODES).filter((mode) =>
    canUseLearningMode(mode, context).allowed
  );
}
