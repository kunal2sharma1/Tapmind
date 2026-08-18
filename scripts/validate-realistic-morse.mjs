import {
  REALISM_LEVELS,
  getRealismProfile,
  transformTimelineForRealism,
  calculateSignalQuality,
} from "../src/modules/morse/realisticMorse.js";

const levels = Object.values(REALISM_LEVELS);
const clean = getRealismProfile(REALISM_LEVELS.CLEAN);

if (clean.noiseLevel !== 0 || clean.fadeDepth !== 0 || clean.interferenceLevel !== 0 || clean.timingJitter !== 0 || clean.dropRate !== 0 || clean.volumeScale !== 1) {
  throw new Error("Clean realism profile must not alter the signal.");
}

const qualities = levels.map((level) => calculateSignalQuality(level));
for (let index = 1; index < qualities.length; index += 1) {
  if (qualities[index] > qualities[index - 1]) {
    throw new Error("Realism signal quality must not improve at a harder profile.");
  }
}

const timeline = [
  { symbol: ".", type: "dot", offsetMs: 0, durationMs: 80 },
  { symbol: "-", type: "dash", offsetMs: 160, durationMs: 240 },
];

const first = transformTimelineForRealism(timeline, getRealismProfile(REALISM_LEVELS.MODERATE), 42);
const second = transformTimelineForRealism(timeline, getRealismProfile(REALISM_LEVELS.MODERATE), 42);
if (JSON.stringify(first) !== JSON.stringify(second)) {
  throw new Error("Realism transforms must be deterministic for the same seed.");
}

console.log(`Realistic Morse validation passed for ${levels.length} signal profiles.`);
