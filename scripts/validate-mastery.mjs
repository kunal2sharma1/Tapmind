import {
  MORSE_MASTERY_SKILLS,
  MORSE_MASTERY_STATES,
  applyMasteryEvent,
  buildMasteryEvent,
  calculateOverallMastery,
  createEmptyMastery,
  getMasteryState,
  getWeakestSkills,
  normalizeMastery,
} from "../src/modules/morse/mastery.js";

const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

const empty = createEmptyMastery();
check(empty.state === MORSE_MASTERY_STATES.NEW, "new mastery state is incorrect");
check(calculateOverallMastery(empty) === 0, "empty overall mastery must be 0");
check(Object.keys(MORSE_MASTERY_SKILLS).length === 9, "expected 9 mastery skills");

let mastery = normalizeMastery(empty);
for (let index = 0; index < 5; index += 1) {
  mastery = applyMasteryEvent(
    mastery,
    buildMasteryEvent({
      mode: "recognition",
      correct: true,
      confidence: 90,
    })
  );
}

check(mastery.attempts === 5, "attempt count did not increase");
check(mastery.correct === 5, "correct count did not increase");
check(mastery.recognition > 0, "recognition mastery did not increase");
check(mastery.consecutiveCorrect === 5, "correct streak did not increase");
check(mastery.consecutiveIncorrect === 0, "incorrect streak should reset after correct responses");

mastery = applyMasteryEvent(
  mastery,
  buildMasteryEvent({
    mode: "sending",
    correct: true,
    responseMs: 120,
    timingQuality: 92,
    confidence: 95,
  })
);
check(mastery.sending > 0, "sending mastery did not increase");
check(mastery.timing > 0, "timing mastery did not increase");

for (let index = 0; index < 3; index += 1) {
  mastery = applyMasteryEvent(
    mastery,
    buildMasteryEvent({ mode: "audio-recognition", correct: false, confidence: 20 })
  );
}

check(mastery.consecutiveIncorrect === 3, "incorrect streak did not increase");
check(getWeakestSkills(mastery, 3).length === 3, "weakest skill list must respect limit");
check(Object.values(MORSE_MASTERY_STATES).includes(getMasteryState(mastery, { previouslyPracticed: true })), "invalid mastery state returned");

if (failures.length > 0) {
  console.error("Mastery validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Mastery engine validation passed.");
