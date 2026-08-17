import { MORSE_WORDS, buildWordTarget, validateWordCharacters } from "../src/modules/morse/words.js";
import { generateWordSession, scoreWordExercise } from "../src/modules/morse/wordGenerator.js";

const failures = [];
const ids = new Set();
const texts = new Set();

for (const word of MORSE_WORDS) {
  if (ids.has(word.id)) failures.push(`duplicate word id: ${word.id}`);
  ids.add(word.id);

  if (texts.has(word.text)) failures.push(`duplicate word text: ${word.text}`);
  texts.add(word.text);

  const validation = validateWordCharacters(word);
  if (!validation.valid) failures.push(`${word.text}: ${validation.reason}`);

  const target = buildWordTarget(word);
  if (!target?.morse) failures.push(`${word.text}: unable to encode word`);
}

const session = generateWordSession({ count: 8, seed: 17 });
if (session.length !== 8) failures.push("word session length mismatch");

for (const exercise of session) {
  const result = scoreWordExercise(exercise, exercise.mode.includes("recognition") ? { text: exercise.target.text } : { morse: exercise.target.morse });
  if (!result.correct) failures.push(`generator cannot score canonical answer: ${exercise.id}`);
}

if (failures.length) {
  console.error("Word validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Word validation passed: ${MORSE_WORDS.length} words.`);
