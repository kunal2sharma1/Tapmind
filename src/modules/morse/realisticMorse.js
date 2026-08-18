export const REALISM_LEVELS = Object.freeze({
  CLEAN: "clean",
  LIGHT: "light",
  MODERATE: "moderate",
  DIFFICULT: "difficult",
  FIELD: "field",
});

const BASE_PROFILES = Object.freeze({
  [REALISM_LEVELS.CLEAN]: {
    noiseLevel: 0,
    fadeDepth: 0,
    fadeRateHz: 0,
    interferenceLevel: 0,
    timingJitter: 0,
    dropRate: 0,
    volumeScale: 1,
  },
  [REALISM_LEVELS.LIGHT]: {
    noiseLevel: 0.008,
    fadeDepth: 0.05,
    fadeRateHz: 0.7,
    interferenceLevel: 0.01,
    timingJitter: 0.015,
    dropRate: 0,
    volumeScale: 0.92,
  },
  [REALISM_LEVELS.MODERATE]: {
    noiseLevel: 0.02,
    fadeDepth: 0.16,
    fadeRateHz: 1.1,
    interferenceLevel: 0.025,
    timingJitter: 0.035,
    dropRate: 0.01,
    volumeScale: 0.82,
  },
  [REALISM_LEVELS.DIFFICULT]: {
    noiseLevel: 0.04,
    fadeDepth: 0.28,
    fadeRateHz: 1.8,
    interferenceLevel: 0.05,
    timingJitter: 0.06,
    dropRate: 0.03,
    volumeScale: 0.7,
  },
  [REALISM_LEVELS.FIELD]: {
    noiseLevel: 0.065,
    fadeDepth: 0.38,
    fadeRateHz: 2.4,
    interferenceLevel: 0.08,
    timingJitter: 0.085,
    dropRate: 0.05,
    volumeScale: 0.58,
  },
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function seededRandom(seed) {
  let state = Math.abs(Math.floor(seed)) || 1;
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) % 2 ** 32;
    return state / 2 ** 32;
  };
}

export function getRealismProfile(level = REALISM_LEVELS.CLEAN, overrides = {}) {
  const base = BASE_PROFILES[level] ?? BASE_PROFILES[REALISM_LEVELS.CLEAN];
  return Object.freeze({
    level,
    noiseLevel: clamp(Number(overrides.noiseLevel ?? base.noiseLevel), 0, 0.25),
    fadeDepth: clamp(Number(overrides.fadeDepth ?? base.fadeDepth), 0, 0.9),
    fadeRateHz: clamp(Number(overrides.fadeRateHz ?? base.fadeRateHz), 0, 8),
    interferenceLevel: clamp(Number(overrides.interferenceLevel ?? base.interferenceLevel), 0, 0.3),
    timingJitter: clamp(Number(overrides.timingJitter ?? base.timingJitter), 0, 0.25),
    dropRate: clamp(Number(overrides.dropRate ?? base.dropRate), 0, 0.2),
    volumeScale: clamp(Number(overrides.volumeScale ?? base.volumeScale), 0.1, 1),
  });
}

export function transformTimelineForRealism(timeline, profile, seed = 0) {
  const realism = getRealismProfile(profile?.level ?? REALISM_LEVELS.CLEAN, profile);
  const random = seededRandom(seed);
  let offset = 0;

  return timeline.map((event) => {
    const jitter = realism.timingJitter === 0
      ? 0
      : (random() * 2 - 1) * realism.timingJitter;
    const durationMultiplier = clamp(1 + jitter, 0.65, 1.35);
    const durationMs = event.durationMs * durationMultiplier;
    const dropped = realism.dropRate > 0 && random() < realism.dropRate;
    const transformed = {
      ...event,
      offsetMs: offset,
      durationMs,
      realism: Object.freeze({
        dropped,
        jitter,
      }),
    };
    offset += durationMs;
    return transformed;
  });
}

export function calculateSignalQuality(profile = REALISM_LEVELS.CLEAN) {
  const realism = getRealismProfile(profile);
  const noisePenalty = realism.noiseLevel * 90;
  const fadePenalty = realism.fadeDepth * 45;
  const interferencePenalty = realism.interferenceLevel * 55;
  const timingPenalty = realism.timingJitter * 35;
  const dropPenalty = realism.dropRate * 80;
  return Math.round(clamp(100 - noisePenalty - fadePenalty - interferencePenalty - timingPenalty - dropPenalty, 0, 100));
}

export const REALISM_PROFILES = BASE_PROFILES;
