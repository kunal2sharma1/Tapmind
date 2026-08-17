import { MORSE_SENTENCES, MORSE_SENTENCE_MODES } from "../src/modules/morse/sentences.js";
import { createSentenceExercise } from "../src/modules/morse/sentenceExercises.js";

const errors = [];
const ids = new Set();

if (MORSE_SENTENCES.length < 20) errors.push("Sentence corpus must contain at least 20 entries.");

for (const sentence of MORSE_SENTENCES) {
  if (ids.has(sentence.id)) errors.push(`Duplicate sentence id: ${sentence.id}`);
  ids.add(sentence.id);
  if (!sentence.text || !sentence.morse) errors.push(`Missing text or Morse: ${sentence.id}`);
  if (sentence.characterCount < 1) errors.push(`Invalid character count: ${sentence.id}`);
  if (sentence.wordCount < 1) errors.push(`Invalid word count: ${sentence.id}`);

  for (const mode of Object.values(MORSE_SENTENCE_MODES)) {
    try {
      createSentenceExercise({ mode, target: sentence, seed: 11 });
    } catch (error) {
      errors.push(`${sentence.id}/${mode}: ${error.message}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Sentence validation passed: ${MORSE_SENTENCES.length} sentences.`);
