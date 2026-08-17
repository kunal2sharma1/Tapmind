import { rankAdaptiveCandidates, buildAdaptiveSessionPlan, summarizeAdaptiveDecision } from "../src/modules/morse/adaptive.js";

const candidates = [
  { id: "a", symbol: "A", difficulty: "introductory" },
  { id: "b", symbol: "B", difficulty: "standard" },
  { id: "c", symbol: "C", difficulty: "standard" },
  { id: "d", symbol: "D", difficulty: "challenging" },
  { id: "e", symbol: "E", difficulty: "advanced" },
];

const mastery = {
  a: { overall: 95, accuracy: 96, attempts: 20, lastPracticed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  b: { overall: 35, accuracy: 50, attempts: 8, consecutiveIncorrect: 3, lastPracticed: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString() },
  c: { overall: 70, accuracy: 75, attempts: 12, lastPracticed: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
};

const ranked = rankAdaptiveCandidates(candidates, { characterMastery: mastery, now: Date.now() });
if (!ranked[0] || ranked[0].candidate.id !== "b") {
  throw new Error("Adaptive ranking failed to prioritize the weak character.");
}

const plan = buildAdaptiveSessionPlan({
  candidates,
  characterMastery: mastery,
  sessionLength: 8,
  mastery: { recognition: 35, recall: 55, audioRecognition: 42, audioRecall: 48, sending: 60, timing: 50, speed: 40, retention: 45, confidence: 50 },
  seed: 17,
});

if (plan.sessionLength !== 5) {
  throw new Error(`Expected unique adaptive plan to contain 5 available items, received ${plan.sessionLength}.`);
}
if (!plan.items.some((item) => item.characterId === "b" && item.role === "weak")) {
  throw new Error("Adaptive session did not include the weak character as a weak-role item.");
}

const summary = summarizeAdaptiveDecision(plan);
if (!summary.breakdown.weak) throw new Error("Adaptive summary is missing weak-role count.");

console.log("Adaptive planner validation passed.");
console.log(JSON.stringify(summary, null, 2));
