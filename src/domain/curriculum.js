import { createCharacter, createLesson, getLevelId } from "./model";
import { getCharacterById } from "../modules/morse/catalog";

export function validateCurriculum(levels) {
  if (!Array.isArray(levels) || levels.length === 0) {
    throw new Error("TapMind curriculum must contain at least one lesson");
  }

  const levelNumbers = new Set();
  const lessonIds = new Set();

  for (const level of levels) {
    if (!Number.isInteger(level.level) || level.level < 1) {
      throw new Error(`Invalid curriculum level number: ${level.level}`);
    }

    const lessonId = getLevelId(level);
    if (lessonIds.has(lessonId)) {
      throw new Error(`Duplicate curriculum lesson id: ${lessonId}`);
    }
    lessonIds.add(lessonId);

    if (levelNumbers.has(level.level)) {
      throw new Error(`Duplicate curriculum level number: ${level.level}`);
    }
    levelNumbers.add(level.level);

    if (level.morse) {
      const characterId = level.characterId ?? null;
      const canonical = characterId
        ? getCharacterById(characterId)
        : null;

      if (characterId && !canonical) {
        throw new Error(`Unknown canonical character id: ${characterId}`);
      }
    }
  }

  const sorted = [...levelNumbers].sort((a, b) => a - b);
  for (let index = 0; index < sorted.length; index += 1) {
    if (sorted[index] !== index + 1) {
      throw new Error("Curriculum levels must be contiguous starting at level 1");
    }
  }

  return true;
}

export function buildCurriculum(levels) {
  validateCurriculum(levels);

  return levels.map((level) => ({
    raw: level,
    lesson: createLesson(level),
    character: createCharacter(level)
  }));
}

export function getLessonById(curriculum, lessonId) {
  return curriculum.find((item) => item.lesson.id === lessonId) ?? null;
}

export function getLessonByLevel(curriculum, levelNumber) {
  return curriculum.find((item) => item.lesson.level === levelNumber) ?? null;
}

export function getLessonsByStage(curriculum, stage) {
  return curriculum.filter((item) => item.lesson.stage === stage);
}

export function getLearnableCharacters(curriculum) {
  return curriculum
    .map((item) => item.character)
    .filter((character) => character?.id && character?.morse);
}

export function getPreviousLesson(curriculum, lesson) {
  return curriculum.find((item) => item.lesson.level === lesson.level - 1) ?? null;
}

export function getNextLesson(curriculum, lesson) {
  return curriculum.find((item) => item.lesson.level === lesson.level + 1) ?? null;
}

export function canEnterLesson(curriculum, lessonId, completedLessonIds = []) {
  const current = getLessonById(curriculum, lessonId);
  if (!current) return false;
  if (current.lesson.level === 1) return true;

  const explicitPrerequisites = current.lesson.progression.prerequisites;
  if (explicitPrerequisites.length > 0) {
    return explicitPrerequisites.every((id) => completedLessonIds.includes(id));
  }

  const previous = getPreviousLesson(curriculum, current.lesson);
  return Boolean(previous && completedLessonIds.includes(getLevelId(previous.raw)));
}

export function getCurriculumSummary(curriculum) {
  const stages = {};
  let learnableCharacters = 0;

  for (const item of curriculum) {
    const stage = item.lesson.stage ?? "unclassified";
    stages[stage] = (stages[stage] ?? 0) + 1;
    if (item.character?.morse) learnableCharacters += 1;
  }

  return {
    totalLessons: curriculum.length,
    learnableCharacters,
    stages
  };
}
