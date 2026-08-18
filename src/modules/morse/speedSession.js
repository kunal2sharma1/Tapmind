import { getMorseCharacter } from "./characters";
import { buildCharacterTimeline } from "./timing";
import { generateExercise } from "./exerciseGenerator";
import { MORSE_LEARNING_MODES } from "./learningModes";
import { SPEED_DEFAULTS, speedTiming } from "./speedEngine";

function deterministicPick(items, index, seed) {
  if (!items.length) return null;
  return items[Math.abs(Math.floor(seed) + index * 11) % items.length];
}

export function buildSpeedCharacterStream({ characters = [], count = 20, seed = 0 } = {}) {
  const pool = characters.filter(Boolean);
  return Array.from({ length: Math.max(0, Math.floor(count)) }, (_, index) => deterministicPick(pool, index, seed)).filter(Boolean);
}

export function buildSpeedSession({
  characters = [],
  characterWpm = SPEED_DEFAULTS.startingCharacterWpm,
  effectiveWpm = SPEED_DEFAULTS.startingEffectiveWpm,
  durationSeconds = SPEED_DEFAULTS.sessionSeconds,
  seed = 0,
} = {}) {
  if (!characters.length) throw new Error("Speed session requires at least one introduced character.");
  const timing = speedTiming({ characterWpm, effectiveWpm, mode: effectiveWpm < characterWpm ? "farnsworth" : "standard" });
  const estimatedCharacters = Math.min(SPEED_DEFAULTS.maxCharacters, Math.max(5, Math.round((effectiveWpm * durationSeconds) / 12)));
  const stream = buildSpeedCharacterStream({ characters, count: estimatedCharacters, seed });

  const exercises = stream.map((character, index) => ({
    ...generateExercise({
      mode: MORSE_LEARNING_MODES.AUDIO_RECOGNITION,
      target: character,
      context: {},
      seed: seed + index,
      source: "speed-session",
      distractorCount: 3,
    }),
    speed: {
      index,
      characterWpm,
      effectiveWpm,
      durationSeconds,
      morseTimeline: buildCharacterTimeline(character.morse, timing),
    },
  }));

  return Object.freeze({
    id: `speed:${characterWpm}:${effectiveWpm}:${seed}`,
    characterWpm,
    effectiveWpm,
    durationSeconds,
    targetCharacters: estimatedCharacters,
    exercises: Object.freeze(exercises),
  });
}
