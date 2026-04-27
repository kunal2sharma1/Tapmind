export default function generateTestQuestions(levels, currentLevel) {
  if (!levels || levels.length === 0) return [];

  // 🔥 LEVEL 10 → MIXED PRACTICE
  if (currentLevel && currentLevel.level === 10) {
    const validLevels = levels.filter(
      (l) => l.level < 10 && l.morse
    );

    if (validLevels.length === 0) return [];

    const questions = [];
    for (let i = 0; i < 6; i++) {
      const pick =
        validLevels[Math.floor(Math.random() * validLevels.length)];
      questions.push(pick);
    }

    return questions;
  }

  // 🔥 NORMAL LEVELS
  const learnedLevels = levels.filter(
    (l) => l.level <= currentLevel.level && l.morse
  );

  if (learnedLevels.length === 0) return [];

  const questions = [];

  for (let i = 0; i < 6; i++) {
    const pick =
      learnedLevels[Math.floor(Math.random() * learnedLevels.length)];
    questions.push(pick);
  }

  return questions;
}