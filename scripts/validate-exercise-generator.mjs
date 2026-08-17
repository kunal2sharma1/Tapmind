import assert from "node:assert/strict";
import {
  generateExercise,
  generateSession,
  getCharacterDifficulty,
  MORSE_DIFFICULTIES,
  selectCandidates,
} from "../src/modules/morse/exerciseGenerator.js";
import { MORSE_LEARNING_MODES } from "../src/modules/morse/learningModes.js";

const context = {
  characterStats: {
    E: { attempts: 10, correct: 10, accuracy: 100 },
    A: { attempts: 8, correct: 4, accuracy: 50 },
  },
  dueCharacterIds: ["letter-a"],
  recentCharacterIds: ["letter-e"],
};

const modes = [
  MORSE_LEARNING_MODES.LEARN,
  MORSE_LEARNING_MODES.RECOGNITION,
  MORSE_LEARNING_MODES.RECALL,
  MORSE_LEARNING_MODES.AUDIO_RECOGNITION,
  MORSE_LEARNING_MODES.AUDIO_RECALL,
  MORSE_LEARNING_MODES.SENDING,
  MORSE_LEARNING_MODES.MIXED,
];

for (const mode of modes) {
  const exercise = generateExercise({
    mode,
    category: "letters",
    difficulty: MORSE_DIFFICULTIES.STANDARD,
    context,
    seed: 17,
  });

  assert.ok(exercise.id);
  assert.equal(exercise.mode, mode);
  assert.ok(exercise.target.id);
  assert.ok(exercise.target.symbol);
  assert.ok(exercise.target.morse);
  assert.ok(Array.isArray(exercise.choices));
  assert.equal(new Set(exercise.choices.map((item) => item.id)).size, exercise.choices.length);
  assert.ok(exercise.choices.every((item) => item.id !== exercise.target.id || item === exercise.target));
}

const excluded = selectCandidates({
  category: "letters",
  count: 6,
  excludeIds: ["letter-e", "letter-t"],
  seed: 4,
});
assert.ok(excluded.every((item) => !["letter-e", "letter-t"].includes(item.id)));

const sessionA = generateSession({ mode: MORSE_LEARNING_MODES.MIXED, count: 10, seed: 42 });
const sessionB = generateSession({ mode: MORSE_LEARNING_MODES.MIXED, count: 10, seed: 42 });
assert.deepEqual(sessionA, sessionB);
assert.equal(sessionA.length, 10);
assert.equal(sessionA[0].mode, MORSE_LEARNING_MODES.RECOGNITION);
assert.equal(sessionA[1].mode, MORSE_LEARNING_MODES.RECALL);
assert.equal(sessionA[2].mode, MORSE_LEARNING_MODES.AUDIO_RECOGNITION);
assert.equal(sessionA[3].mode, MORSE_LEARNING_MODES.AUDIO_RECALL);
assert.equal(sessionA[4].mode, MORSE_LEARNING_MODES.SENDING);

for (const difficulty of Object.values(MORSE_DIFFICULTIES)) {
  assert.ok(Object.values(MORSE_DIFFICULTIES).includes(getCharacterDifficulty(
    selectCandidates({ difficulty, count: 1, seed: 1 })[0]
  )));
}

console.log("Exercise generator validation passed.");
