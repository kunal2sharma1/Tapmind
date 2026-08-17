import { buildDailySession, calculateDailyMix } from "../src/modules/morse/dailyLearning.js";
import { getLetters } from "../src/modules/morse/characters.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const letters = getLetters().slice(0, 8);
const mastery = Object.fromEntries(letters.map((character, index) => [
  character.id,
  {
    recognition: index * 8,
    recall: index * 7,
    audioRecognition: index * 6,
    audioRecall: index * 5,
    sending: index * 4,
    timing: index * 3,
    speed: index * 2,
    retention: index * 9,
    confidence: index * 10,
  },
]));

const reviewMap = Object.fromEntries(letters.slice(0, 3).map((character) => [
  character.id,
  { phase: "review", dueAt: "2000-01-01T00:00:00.000Z", intervalMs: 86400000, easeFactor: 2.5 },
]));

const mix = calculateDailyMix({ dueCount: 3, mastery, introducedCharacterIds: letters.map((item) => item.id) });
assert(mix.targetExercises >= 5, "Daily mix must produce at least five target exercises.");
assert(mix.reviewCount > 0, "Due reviews must receive a review allocation.");
assert(mix.adaptiveCount > 0, "Mastery context must produce adaptive practice.");

const session = buildDailySession({
  mastery,
  reviewMap,
  characterMastery: mastery,
  introducedCharacters: letters,
  now: Date.parse("2026-08-18T00:00:00.000Z"),
  seed: 42,
});

assert(session.id === "daily:2026-08-18", "Daily session ID must be deterministic by date.");
assert(session.exercises.length <= session.targetExercises, "Daily session must not exceed its planned target.");
assert(session.dueCount === 3, "Due review count must be preserved.");
assert(session.exercises.every((exercise) => exercise.target?.id), "Every daily exercise needs a target character.");
assert(session.exercises.every((exercise) => exercise.metadata?.source), "Every daily exercise needs a source.");

console.log("Daily learning validation passed.");
console.log(JSON.stringify({
  targetExercises: session.targetExercises,
  dueCount: session.dueCount,
  reviewCount: session.mix.reviewCount,
  adaptiveCount: session.mix.adaptiveCount,
  newCount: session.mix.newCount,
  exercises: session.exercises.length,
}, null, 2));
