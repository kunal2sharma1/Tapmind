import { createLesson, getLevelId } from "../domain/model";

export function shuffle(items) {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

export function getAssessableLevels(levels, currentLevel) {
  if (!Array.isArray(levels) || !currentLevel) return [];

  const lesson = createLesson(currentLevel);
  const scope = lesson.assessment.scope;

  if (scope === "all-learned") {
    return levels.filter((level) => level.morse && level.level <= currentLevel.level);
  }

  if (scope === "module") {
    return levels.filter((level) => level.morse);
  }

  return currentLevel.morse ? [currentLevel] : [];
}

export function getTestLength(pool, requestedLength = 6) {
  if (!pool.length) return 0;
  return Math.min(Math.max(requestedLength, 1), Math.max(pool.length, 1));
}

export function getRequestedAssessmentCount(currentLevel) {
  return createLesson(currentLevel).assessment.questionCount;
}

export function generateAssessment(levels, currentLevel) {
  const pool = getAssessableLevels(levels, currentLevel);
  if (!pool.length) return [];

  const requestedLength = getRequestedAssessmentCount(currentLevel) || 6;
  const questionCount = getTestLength(pool, requestedLength);
  const questions = [];

  if (currentLevel.morse) {
    questions.push(currentLevel);
  }

  const remaining = shuffle(
    pool.filter((level) => getLevelId(level) !== getLevelId(currentLevel))
  );

  for (const question of remaining) {
    if (questions.length >= questionCount) break;
    questions.push(question);
  }

  let repeatIndex = 0;
  while (questions.length < questionCount) {
    questions.push(pool[repeatIndex % pool.length]);
    repeatIndex += 1;
  }

  return shuffle(questions);
}

export function calculatePass(score, totalQuestions, passPercent = 0.8) {
  if (!totalQuestions) return false;
  const threshold = Math.ceil(totalQuestions * passPercent);
  return score >= threshold;
}

export function calculateAccuracy(correct, attempts) {
  if (!attempts) return 0;
  return Math.round((correct / attempts) * 100);
}
