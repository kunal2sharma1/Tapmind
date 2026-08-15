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

  if (currentLevel.assessment?.scope === "all-learned") {
    return levels.filter((level) => level.morse && level.level <= currentLevel.level);
  }

  if (currentLevel.assessment?.scope === "module") {
    return levels.filter((level) => level.morse);
  }

  return currentLevel.morse ? [currentLevel] : [];
}

export function getTestLength(pool, requestedLength = 6) {
  if (!pool.length) return 0;
  return Math.min(Math.max(requestedLength, 1), Math.max(pool.length, 1));
}

export function generateAssessment(levels, currentLevel) {
  const pool = getAssessableLevels(levels, currentLevel);
  if (!pool.length) return [];

  const requestedLength = currentLevel.assessment?.questionCount ?? 6;
  const questionCount = getTestLength(pool, requestedLength);
  const questions = [];

  // Always assess the current lesson when it represents a character.
  if (currentLevel.morse) {
    questions.push(currentLevel);
  }

  const remaining = shuffle(pool.filter((level) => level.level !== currentLevel.level));

  for (const question of remaining) {
    if (questions.length >= questionCount) break;
    questions.push(question);
  }

  // When the pool is smaller than the requested test length, repeat questions
  // deliberately rather than introducing uncontrolled random duplicates.
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
