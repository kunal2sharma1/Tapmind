import { MORSE_LEARNING_MODES, describeLearningMode, createLearningExercise, listLearningModes } from "../src/modules/morse/learningModes.js";
import { canUseLearningMode } from "../src/modules/morse/learningModePolicy.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const catalogPath = path.join(root, "src/modules/morse/characters.json");
const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
const firstCharacter = catalog.characters.find((character) => character.category === "letter");

const expectedModes = Object.values(MORSE_LEARNING_MODES);
const actualModes = listLearningModes().map((mode) => mode.id);

for (const mode of expectedModes) {
  if (!describeLearningMode(mode)) {
    throw new Error(`Missing learning mode description: ${mode}`);
  }
}

if (actualModes.length !== expectedModes.length) {
  throw new Error("Learning mode list does not match the canonical mode set.");
}

const exercise = createLearningExercise({
  mode: MORSE_LEARNING_MODES.SENDING,
  character: firstCharacter
});

if (exercise.target.symbol !== firstCharacter.symbol || exercise.target.morse !== firstCharacter.morse) {
  throw new Error("Generated exercise does not preserve the canonical character target.");
}

const audioMode = canUseLearningMode(MORSE_LEARNING_MODES.AUDIO_RECOGNITION, {
  audioSupported: true,
  inputSupported: true
});

if (!audioMode.allowed) {
  throw new Error("Audio recognition should be available when audio is supported.");
}

console.log(`Learning mode validation passed: ${expectedModes.length} modes.`);
