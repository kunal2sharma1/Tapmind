import { buildReviewQueue } from "./reviewScheduler";

export function buildCharacterReviewItems({ characters = [], mastery = {}, reviews = {} } = {}) {
  return characters.map((character) => ({
    id: character.id,
    symbol: character.symbol,
    category: character.category,
    mastery: mastery[character.symbol] ?? { overall: 0 },
    review: reviews[character.symbol] ?? null,
  }));
}

export function getDueCharacterIds({ characters = [], mastery = {}, reviews = {}, now = new Date(), limit = 50 } = {}) {
  const items = buildCharacterReviewItems({ characters, mastery, reviews });
  return buildReviewQueue(items, { now, limit }).map((item) => item.id);
}

export function getReviewSummary({ characters = [], mastery = {}, reviews = {}, now = new Date() } = {}) {
  const items = buildCharacterReviewItems({ characters, mastery, reviews });
  const queue = buildReviewQueue(items, { now, limit: items.length });
  const overdue = queue.filter((item) => item.review?.dueAt && Date.parse(item.review.dueAt) < now.getTime());
  const dueNow = queue.length - overdue.length;

  return Object.freeze({
    due: queue.length,
    overdue: overdue.length,
    dueNow,
    totalScheduled: items.filter((item) => item.review).length,
    next: queue[0]?.id ?? null,
  });
}
