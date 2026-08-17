import {
  REVIEW_PHASES,
  REVIEW_QUALITY,
  createInitialReviewState,
  scheduleReview,
  isReviewDue,
  buildReviewQueue,
} from "../src/modules/morse/reviewScheduler.js";

const fail = (message) => {
  console.error(`Review scheduler validation failed: ${message}`);
  process.exit(1);
};

const now = new Date("2026-08-18T00:00:00.000Z");
const initial = createInitialReviewState(now);

if (initial.phase !== REVIEW_PHASES.NEW) fail("initial state should be NEW");
if (!isReviewDue(initial, now)) fail("new item should be immediately due");

const firstCorrect = scheduleReview(initial, {
  correct: true,
  confidence: 90,
  now,
});

if (firstCorrect.phase !== REVIEW_PHASES.LEARNING) fail("first correct answer should enter learning phase");
if (Date.parse(firstCorrect.dueAt) <= now.getTime()) fail("learning review must be scheduled in the future");

const failed = scheduleReview(firstCorrect, {
  correct: false,
  confidence: 20,
  now: new Date("2026-08-18T00:02:00.000Z"),
});

if (failed.phase !== REVIEW_PHASES.RELEARNING) fail("failed review should enter relearning");
if (failed.lapses < 1) fail("failed review should record a lapse");
if (failed.lastQuality !== REVIEW_QUALITY.FAIL) fail("failed review quality should be FAIL");

const recovered = scheduleReview(failed, {
  correct: true,
  confidence: 90,
  timingQuality: 95,
  now: new Date("2026-08-18T00:10:00.000Z"),
});

if (recovered.phase !== REVIEW_PHASES.REVIEW) fail("successful relearning should graduate to review");
if (recovered.repetitions < 1) fail("graduation should increment repetitions");

const due = {
  id: "letter-a",
  mastery: { overall: 45 },
  review: { ...recovered, dueAt: now.toISOString() },
};
const queue = buildReviewQueue([due], { now, limit: 10 });
if (queue.length !== 1 || queue[0].id !== "letter-a") fail("due review should enter queue");

console.log("Review scheduler validation passed.");
