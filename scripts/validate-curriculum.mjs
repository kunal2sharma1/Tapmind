import { readFile } from "node:fs/promises";

const [levelsText, charactersText] = await Promise.all([
  readFile(new URL("../src/modules/morse/levels.json", import.meta.url), "utf8"),
  readFile(new URL("../src/modules/morse/characters.json", import.meta.url), "utf8")
]);

const levels = JSON.parse(levelsText);
const characterCatalog = JSON.parse(charactersText).characters;

const characterBySymbol = new Map(characterCatalog.map((character) => [character.symbol, character]));
const lessonIds = new Set();
const levelNumbers = new Set();
const errors = [];

if (!Array.isArray(levels) || levels.length === 0) {
  errors.push("Curriculum must contain at least one level.");
}

for (const level of levels) {
  if (!Number.isInteger(level.level) || level.level < 1) {
    errors.push(`Invalid level number: ${level.level}`);
  }

  if (lessonIds.has(level.id)) {
    errors.push(`Duplicate lesson id: ${level.id}`);
  }
  lessonIds.add(level.id);

  if (levelNumbers.has(level.level)) {
    errors.push(`Duplicate level number: ${level.level}`);
  }
  levelNumbers.add(level.level);

  if (level.morse && level.letter) {
    const canonical = characterBySymbol.get(level.letter);
    if (!canonical) {
      errors.push(`Level ${level.level} references unknown symbol ${level.letter}.`);
    } else if (canonical.morse !== level.morse) {
      errors.push(
        `Level ${level.level} mismatch for ${level.letter}: curriculum=${level.morse}, catalog=${canonical.morse}.`
      );
    }
  }

  if (level.assessment) {
    const { questionCount, passPercent } = level.assessment;
    if (!Number.isInteger(questionCount) || questionCount < 0) {
      errors.push(`Level ${level.level} has invalid assessment.questionCount.`);
    }
    if (typeof passPercent !== "number" || passPercent < 0 || passPercent > 1) {
      errors.push(`Level ${level.level} has invalid assessment.passPercent.`);
    }
  }

  if (level.masteryGate) {
    const { minimumAccuracy, minimumAttempts } = level.masteryGate;
    if (typeof minimumAccuracy !== "number" || minimumAccuracy < 0 || minimumAccuracy > 1) {
      errors.push(`Level ${level.level} has invalid masteryGate.minimumAccuracy.`);
    }
    if (!Number.isInteger(minimumAttempts) || minimumAttempts < 0) {
      errors.push(`Level ${level.level} has invalid masteryGate.minimumAttempts.`);
    }
  }
}

const sortedLevels = [...levelNumbers].sort((a, b) => a - b);
for (let index = 0; index < sortedLevels.length; index += 1) {
  if (sortedLevels[index] !== index + 1) {
    errors.push("Curriculum level numbers must be contiguous starting at 1.");
    break;
  }
}

if (!errors.length) {
  const stages = Object.fromEntries(
    levels.reduce((counts, level) => {
      const stage = level.stage ?? "unclassified";
      counts.set(stage, (counts.get(stage) ?? 0) + 1);
      return counts;
    }, new Map())
  );

  console.log(`Curriculum valid: ${levels.length} lessons.`);
  console.log(`Canonical characters: ${characterCatalog.length}.`);
  console.log(`Stages: ${JSON.stringify(stages)}.`);
  process.exit(0);
}

console.error(`Curriculum validation failed with ${errors.length} error(s):`);
for (const error of errors) console.error(`- ${error}`);
process.exit(1);
