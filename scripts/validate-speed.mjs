import {
  calculateAccuracy,
  calculateEffectiveWpm,
  evaluateSpeedAttempt,
  getNextSpeedTarget,
  normalizeSpeedProfile,
  SPEED_TIERS,
} from "../src/modules/morse/speedEngine.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(SPEED_TIERS.length >= 8, "Speed tiers are incomplete");
assert(calculateAccuracy(9, 10) === 90, "Accuracy calculation failed");
assert(calculateEffectiveWpm({ characters: 10, elapsedMs: 60_000 }) === 2, "Effective WPM calculation failed");

const profile = normalizeSpeedProfile({ characterWpm: 15, effectiveWpm: 10 });
assert(profile.characterWpm === 15 && profile.effectiveWpm === 10, "Profile normalization failed");

const passed = evaluateSpeedAttempt({
  correct: 10,
  attempted: 10,
  elapsedMs: 30_000,
  targetEffectiveWpm: 3,
  responseTimes: Array(10).fill(500),
});
assert(passed.passed, "A clearly passing speed attempt should pass");

const failed = evaluateSpeedAttempt({
  correct: 4,
  attempted: 10,
  elapsedMs: 30_000,
  targetEffectiveWpm: 3,
  responseTimes: Array(10).fill(500),
});
assert(!failed.passed, "A low-accuracy speed attempt should fail");

const next = getNextSpeedTarget({ characterWpm: 15, effectiveWpm: 10, passed: true });
assert(next.characterWpm > 15, "Passing should advance character speed");
assert(next.effectiveWpm > 10, "Passing should advance effective speed");

console.log("Speed engine validation passed.");
