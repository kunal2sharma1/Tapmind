import { createCharacter, createLesson, getLevelId } from "./model";

export function buildCurriculum(levels) {
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

export function getPreviousLesson(curriculum, lesson) {
  return curriculum.find((item) => item.lesson.level === lesson.level - 1) ?? null;
}

export function canEnterLesson(curriculum, lessonId, completedLessonIds = []) {
  const current = getLessonById(curriculum, lessonId);
  if (!current) return false;
  if (current.lesson.level === 1) return true;

  const previous = getPreviousLesson(curriculum, current.lesson);
  return Boolean(previous && completedLessonIds.includes(getLevelId(previous.raw)));
}
