export const MORSE_LEARNING_MODES = Object.freeze({
  LEARN: "learn",
  RECOGNITION: "recognition",
  RECALL: "recall",
  AUDIO_RECOGNITION: "audio-recognition",
  AUDIO_RECALL: "audio-recall",
  SENDING: "sending",
  MIXED: "mixed"
});

export const MORSE_LEARNING_SKILLS = Object.freeze({
  VISUAL_RECOGNITION: "visual-recognition",
  SYMBOL_RECALL: "symbol-recall",
  AUDIO_RECOGNITION: "audio-recognition",
  AUDIO_RECALL: "audio-recall",
  SENDING: "sending",
  TIMING: "timing"
});

const MODE_SKILLS = Object.freeze({
  [MORSE_LEARNING_MODES.LEARN]: [MORSE_LEARNING_SKILLS.VISUAL_RECOGNITION],
  [MORSE_LEARNING_MODES.RECOGNITION]: [MORSE_LEARNING_SKILLS.VISUAL_RECOGNITION],
  [MORSE_LEARNING_MODES.RECALL]: [MORSE_LEARNING_SKILLS.SYMBOL_RECALL],
  [MORSE_LEARNING_MODES.AUDIO_RECOGNITION]: [MORSE_LEARNING_SKILLS.AUDIO_RECOGNITION],
  [MORSE_LEARNING_MODES.AUDIO_RECALL]: [MORSE_LEARNING_SKILLS.AUDIO_RECALL],
  [MORSE_LEARNING_MODES.SENDING]: [MORSE_LEARNING_SKILLS.SENDING, MORSE_LEARNING_SKILLS.TIMING],
  [MORSE_LEARNING_MODES.MIXED]: [
    MORSE_LEARNING_SKILLS.VISUAL_RECOGNITION,
    MORSE_LEARNING_SKILLS.SYMBOL_RECALL,
    MORSE_LEARNING_SKILLS.AUDIO_RECOGNITION,
    MORSE_LEARNING_SKILLS.AUDIO_RECALL,
    MORSE_LEARNING_SKILLS.SENDING,
    MORSE_LEARNING_SKILLS.TIMING
  ]
});

const MODE_LABELS = Object.freeze({
  [MORSE_LEARNING_MODES.LEARN]: "Learn",
  [MORSE_LEARNING_MODES.RECOGNITION]: "Recognition",
  [MORSE_LEARNING_MODES.RECALL]: "Recall",
  [MORSE_LEARNING_MODES.AUDIO_RECOGNITION]: "Audio Recognition",
  [MORSE_LEARNING_MODES.AUDIO_RECALL]: "Audio Recall",
  [MORSE_LEARNING_MODES.SENDING]: "Sending",
  [MORSE_LEARNING_MODES.MIXED]: "Mixed Practice"
});

const MODE_DESCRIPTIONS = Object.freeze({
  [MORSE_LEARNING_MODES.LEARN]: "Understand a new character through visual pattern, sound and guided reproduction.",
  [MORSE_LEARNING_MODES.RECOGNITION]: "Identify the character represented by a visible Morse pattern.",
  [MORSE_LEARNING_MODES.RECALL]: "Produce the Morse pattern when shown a character.",
  [MORSE_LEARNING_MODES.AUDIO_RECOGNITION]: "Identify a character from its Morse audio without relying on the visual pattern.",
  [MORSE_LEARNING_MODES.AUDIO_RECALL]: "Reproduce a Morse pattern after hearing the target character audio.",
  [MORSE_LEARNING_MODES.SENDING]: "Send a character with deliberate dit/dah timing.",
  [MORSE_LEARNING_MODES.MIXED]: "Blend previously trained skills to reduce dependence on one cue type."
});

const BASE_MODE_CONFIG = Object.freeze({
  [MORSE_LEARNING_MODES.LEARN]: { attempts: 3, revealAnswer: true, audio: true, inputRequired: true },
  [MORSE_LEARNING_MODES.RECOGNITION]: { attempts: 1, revealAnswer: false, audio: false, inputRequired: false },
  [MORSE_LEARNING_MODES.RECALL]: { attempts: 1, revealAnswer: false, audio: false, inputRequired: true },
  [MORSE_LEARNING_MODES.AUDIO_RECOGNITION]: { attempts: 1, revealAnswer: false, audio: true, inputRequired: false },
  [MORSE_LEARNING_MODES.AUDIO_RECALL]: { attempts: 1, revealAnswer: false, audio: true, inputRequired: true },
  [MORSE_LEARNING_MODES.SENDING]: { attempts: 1, revealAnswer: false, audio: true, inputRequired: true },
  [MORSE_LEARNING_MODES.MIXED]: { attempts: 1, revealAnswer: false, audio: true, inputRequired: true }
});

export function isLearningMode(mode) {
  return Object.values(MORSE_LEARNING_MODES).includes(mode);
}

export function getLearningModeSkills(mode) {
  return isLearningMode(mode) ? [...MODE_SKILLS[mode]] : [];
}

export function describeLearningMode(mode) {
  if (!isLearningMode(mode)) return null;

  return Object.freeze({
    id: mode,
    label: MODE_LABELS[mode],
    description: MODE_DESCRIPTIONS[mode],
    skills: getLearningModeSkills(mode),
    ...BASE_MODE_CONFIG[mode]
  });
}

export function listLearningModes() {
  return Object.values(MORSE_LEARNING_MODES).map(describeLearningMode);
}

export function createLearningExercise({
  mode,
  character,
  options = {}
} = {}) {
  if (!isLearningMode(mode)) {
    throw new Error(`Unsupported Morse learning mode: ${String(mode)}`);
  }

  if (!character || typeof character.symbol !== "string" || typeof character.morse !== "string") {
    throw new Error("A canonical Morse character is required to create an exercise.");
  }

  const config = describeLearningMode(mode);

  return Object.freeze({
    id: `${mode}:${character.id}`,
    mode,
    target: Object.freeze({
      id: character.id,
      symbol: character.symbol,
      morse: character.morse,
      category: character.category
    }),
    skills: config.skills,
    attemptsAllowed: Number.isFinite(options.attemptsAllowed)
      ? Math.max(1, Math.floor(options.attemptsAllowed))
      : config.attempts,
    revealAnswer: options.revealAnswer ?? config.revealAnswer,
    audioRequired: options.audioRequired ?? config.audio,
    inputRequired: options.inputRequired ?? config.inputRequired,
    metadata: Object.freeze({
      generatedAt: Date.now(),
      source: options.source ?? "curriculum",
      difficulty: options.difficulty ?? "standard"
    })
  });
}

export function isExerciseAttemptValid(exercise, response = {}) {
  if (!exercise || !isLearningMode(exercise.mode)) return false;

  switch (exercise.mode) {
    case MORSE_LEARNING_MODES.RECOGNITION:
    case MORSE_LEARNING_MODES.AUDIO_RECOGNITION:
      return typeof response.symbol === "string" && response.symbol.length > 0;
    case MORSE_LEARNING_MODES.RECALL:
    case MORSE_LEARNING_MODES.AUDIO_RECALL:
    case MORSE_LEARNING_MODES.SENDING:
    case MORSE_LEARNING_MODES.MIXED:
      return typeof response.morse === "string" && response.morse.length > 0;
    case MORSE_LEARNING_MODES.LEARN:
      return Boolean(response.completed);
    default:
      return false;
  }
}

export function scoreLearningResponse(exercise, response = {}) {
  if (!isExerciseAttemptValid(exercise, response)) {
    return Object.freeze({ correct: false, score: 0, reason: "invalid-response" });
  }

  const expectedSymbol = exercise.target.symbol;
  const expectedMorse = exercise.target.morse;

  switch (exercise.mode) {
    case MORSE_LEARNING_MODES.RECOGNITION:
    case MORSE_LEARNING_MODES.AUDIO_RECOGNITION:
      return Object.freeze({
        correct: response.symbol.toUpperCase() === expectedSymbol,
        score: response.symbol.toUpperCase() === expectedSymbol ? 1 : 0,
        expected: expectedSymbol
      });
    case MORSE_LEARNING_MODES.RECALL:
    case MORSE_LEARNING_MODES.AUDIO_RECALL:
    case MORSE_LEARNING_MODES.SENDING:
    case MORSE_LEARNING_MODES.MIXED:
      return Object.freeze({
        correct: response.morse === expectedMorse,
        score: response.morse === expectedMorse ? 1 : 0,
        expected: expectedMorse
      });
    case MORSE_LEARNING_MODES.LEARN:
      return Object.freeze({ correct: Boolean(response.completed), score: response.completed ? 1 : 0 });
    default:
      return Object.freeze({ correct: false, score: 0, reason: "unsupported-mode" });
  }
}
