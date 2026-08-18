import {
  buildChallengeSession,
  CHALLENGE_CATALOG,
  CHALLENGE_TYPES,
  getChallengeById,
  scoreChallenge,
} from "../src/modules/morse/challenges.js";

const ids = new Set();
for (const challenge of CHALLENGE_CATALOG) {
  if (ids.has(challenge.id)) throw new Error(`Duplicate challenge id: ${challenge.id}`);
  ids.add(challenge.id);
  if (!Object.values(CHALLENGE_TYPES).includes(challenge.type)) throw new Error(`Invalid challenge type: ${challenge.id}`);
  if (challenge.minAccuracy < 0 || challenge.minAccuracy > 100) throw new Error(`Invalid accuracy gate: ${challenge.id}`);
  if (challenge.durationSeconds <= 0) throw new Error(`Invalid duration: ${challenge.id}`);
}

const sessionA = buildChallengeSession({ count: 3, seed: 123, context: { introducedCharacterCount: 26, bestEffectiveWpm: 20, bestCharacterAccuracy: 95, receptionReady: true } });
const sessionB = buildChallengeSession({ count: 3, seed: 123, context: { introducedCharacterCount: 26, bestEffectiveWpm: 20, bestCharacterAccuracy: 95, receptionReady: true } });
if (JSON.stringify(sessionA) !== JSON.stringify(sessionB)) throw new Error("Challenge generation is not deterministic");
if (sessionA.length !== 3) throw new Error("Challenge session count mismatch");

const speed = getChallengeById("speed-10");
const failed = scoreChallenge({ challenge: speed, accuracy: 80, effectiveWpm: 12, completed: true, elapsedMs: 10_000 });
if (failed.passed) throw new Error("Challenge incorrectly passed below accuracy gate");

const passed = scoreChallenge({ challenge: speed, accuracy: 95, effectiveWpm: 12, completed: true, elapsedMs: 10_000 });
if (!passed.passed) throw new Error("Challenge did not pass qualified result");

console.log(`Challenge validation passed: ${CHALLENGE_CATALOG.length} definitions, deterministic sessions, scoring gates`);
