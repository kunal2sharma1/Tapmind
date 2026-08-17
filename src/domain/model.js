import {
  getCharacterByMorse,
  getCharacterBySymbol,
  isCanonicalCharacter
} from "../modules/morse/catalog";

export const EXERCISE_TYPES = Object.freeze({
  FOUNDATION_BINARY: "foundation-binary",
  CHARACTER_REPRODUCTION: "character-reproduction",
  CHARACTER_RECALL: "character-recall",
  AUDIO_RECOGNITION: "audio-recognition",
  AUDIO_REPRODUCTION: "audio-reproduction",
  TIMING_REPRODUCTION: "timing-reproduction",
  MIXED_ASSESSMENT: "mixed-assessment",
  REVIEW: "review"
});

export const MASTERY_STATES = Object.freeze({
  NEW: "new",
  LEARNING: "learning",
  DEVELOPING: "developing",
  STRONG: "strong",
  MASTERED: "mastered"
});

export const PROGRESS_STATES = Object.freeze({
  LOCKED: "locked",
  AVAILABLE: "available",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed"
});

export const LEARNING_STAGES = Object.freeze({
  FOUNDATION: "foundation",
  LETTERS: "letters",
  NUMBERS: "numbers",
  PUNCTUATION: "punctuation",
  PROSIGNS: "prosigns",
  REVIEW: "review",
  MASTERY: "mastery",
  WORDS: "words",
  SENTENCES: "sentences",
  FLUENCY: "fluency"
});

export function getLevelId(level) {
  return level.id ?? `level-${level.level}`;
}

export function getCanonicalCharacter({ symbol, morse } = {}) {
  if (symbol) return getCharacterBySymbol(symbol);
  if (morse) return getCharacterByMorse(morse);
  return null;
}

export function getCharacterId(level) {
  const character = getCanonicalCharacter(level);
  return character?.id ?? (level.morse ? level.id ?? `morse-${level.level}` : null);
}

export function createCharacter(level) {
  const character = getCanonicalCharacter(level);

  if (character && !isCanonicalCharacter(character)) {
    throw new Error(`Invalid canonical Morse character: ${character.id}`);
  }

  return {
    id: character?.id ?? getCharacterId(level),
    moduleId: level.moduleId ?? "morse",
    level: level.level,
    symbol: character?.symbol ?? level.letter ?? null,
    letter: character?.symbol ?? level.letter ?? null,
    morse: character?.morse ?? level.morse ?? null,
    category: character?.category ?? null,
    stage: level.stage ?? null,
    label: level.label,
    state: character ? MASTERY_STATES.NEW : null
  };
}

export function createExercise(level, type) {
  return {
    id: `${getLevelId(level)}-${type}`,
    type,
    levelId: getLevelId(level),
    characterId: getCharacterId(level),
    stage: level.stage ?? null,
    skillTags: level.skills ?? []
  };
}

export function createLesson(level) {
  return {
    id: getLevelId(level),
    moduleId: level.moduleId ?? "morse",
    level: level.level,
    title: level.title ?? level.label,
    type: level.type,
    stage: level.stage ?? null,
    characterId: getCharacterId(level),
    skills: level.skills ?? [],
    objectives: level.objectives ?? [],
    progression: {
      prerequisites: level.prerequisites ?? [],
      masteryGate: level.masteryGate ?? null
    },
    timing: {
      recommendedCharacterWpm: level.recommendedCharacterWpm ?? null,
      recommendedEffectiveWpm: level.recommendedEffectiveWpm ?? null
    },
    practice: {
      mode: level.practiceMode ?? "none",
      repeats: level.practiceRepeats ?? 0
    },
    assessment: {
      enabled: Boolean(level.assessment?.enabled),
      scope: level.assessment?.scope ?? "current",
      questionCount: level.assessment?.questionCount ?? 0,
      passPercent: level.assessment?.passPercent ?? 1
    },
    exerciseTypes: getExerciseTypes(level)
  };
}

export function createAttempt({
  id,
  sessionId,
  exerciseId,
  characterId = null,
  input = "",
  expected = "",
  correct = false,
  durationMs = null,
  metadata = {}
}) {
  return {
    id,
    sessionId,
    exerciseId,
    characterId,
    input,
    expected,
    correct,
    durationMs,
    metadata,
    createdAt: new Date().toISOString()
  };
}

export function createSession({ moduleId = "morse", lessonId, id, mode = "learning" }) {
  return {
    id,
    moduleId,
    lessonId,
    mode,
    startedAt: new Date().toISOString(),
    completedAt: null,
    attempts: [],
    score: 0,
    correct: 0,
    total: 0
  };
}

export function createMastery() {
  return {
    state: MASTERY_STATES.NEW,
    attempts: 0,
    correct: 0,
    accuracy: 0,
    recentAccuracy: 0,
    recognition: 0,
    recall: 0,
    audioRecognition: 0,
    sending: 0,
    timing: 0,
    speed: 0,
    retention: 0,
    confidence: 0,
    lastPracticedAt: null,
    nextReviewAt: null
  };
}

export function createProgress(lessons) {
  return Object.fromEntries(
    lessons.map((lesson, index) => [
      lesson.id,
      {
        state: index === 0 ? PROGRESS_STATES.AVAILABLE : PROGRESS_STATES.LOCKED,
        startedAt: null,
        completedAt: null
      }
    ])
  );
}

export function getExerciseTypes(level) {
  if (level.type === "foundation") return [EXERCISE_TYPES.FOUNDATION_BINARY];

  if (level.type === "review") {
    return [
      EXERCISE_TYPES.MIXED_ASSESSMENT,
      EXERCISE_TYPES.AUDIO_RECOGNITION,
      EXERCISE_TYPES.TIMING_REPRODUCTION
    ];
  }

  if (["character", "number", "punctuation", "prosign"].includes(level.type)) {
    return [
      EXERCISE_TYPES.CHARACTER_REPRODUCTION,
      EXERCISE_TYPES.CHARACTER_RECALL,
      EXERCISE_TYPES.AUDIO_RECOGNITION,
      EXERCISE_TYPES.TIMING_REPRODUCTION
    ];
  }

  return [EXERCISE_TYPES.REVIEW];
}
