export const EXERCISE_TYPES = Object.freeze({
  FOUNDATION_BINARY: "foundation-binary",
  CHARACTER_REPRODUCTION: "character-reproduction",
  CHARACTER_RECALL: "character-recall",
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

export function getLevelId(level) {
  return level.id ?? `level-${level.level}`;
}

export function getCharacterId(level) {
  return level.morse ? level.id ?? `morse-${level.level}` : null;
}

export function createCharacter(level) {
  return {
    id: getCharacterId(level),
    moduleId: level.moduleId ?? "morse",
    level: level.level,
    letter: level.letter ?? null,
    morse: level.morse ?? null,
    label: level.label,
    state: level.morse ? MASTERY_STATES.NEW : null
  };
}

export function createExercise(level, type) {
  return {
    id: `${getLevelId(level)}-${type}`,
    type,
    levelId: getLevelId(level),
    characterId: getCharacterId(level)
  };
}

export function createLesson(level) {
  return {
    id: getLevelId(level),
    moduleId: level.moduleId ?? "morse",
    level: level.level,
    title: level.title ?? level.label,
    type: level.type,
    characterId: getCharacterId(level),
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
  durationMs = null
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
    createdAt: new Date().toISOString()
  };
}

export function createSession({ moduleId = "morse", lessonId, id }) {
  return {
    id,
    moduleId,
    lessonId,
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
    lastPracticedAt: null
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
  if (level.type === "review") return [EXERCISE_TYPES.MIXED_ASSESSMENT];
  if (level.type === "character") {
    return [
      EXERCISE_TYPES.CHARACTER_REPRODUCTION,
      EXERCISE_TYPES.CHARACTER_RECALL
    ];
  }
  return [];
}
