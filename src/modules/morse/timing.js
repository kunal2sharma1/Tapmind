export const MORSE_TIMING = Object.freeze({
  DOT_UNITS: 1,
  DASH_UNITS: 3,
  ELEMENT_GAP_UNITS: 1,
  CHARACTER_GAP_UNITS: 3,
  WORD_GAP_UNITS: 7,
  PARIS_UNITS: 50,
  PARIS_ELEMENT_UNITS: 31,
  PARIS_SPACING_UNITS: 19,
  DEFAULT_TONE_HZ: 600,
  DEFAULT_WPM: 15,
  DEFAULT_CHARACTER_WPM: 15
});

const MIN_WPM = 1;
const MAX_WPM = 200;

function assertWpm(value, name) {
  if (!Number.isFinite(value) || value < MIN_WPM || value > MAX_WPM) {
    throw new RangeError(`${name} must be between ${MIN_WPM} and ${MAX_WPM} WPM`);
  }
  return value;
}

/**
 * Standard Morse unit duration derived from the PARIS 50-unit convention.
 * At 1 WPM, one unit is 1.2 seconds; at 20 WPM it is 60 ms.
 */
export function unitDurationMs(wpm) {
  assertWpm(wpm, "WPM");
  return (60_000 * 1.2) / (wpm * 50);
}

/**
 * Resolve standard timing for a single character.
 */
export function getStandardTiming(wpm) {
  const unitMs = unitDurationMs(wpm);

  return {
    wpm,
    characterWpm: wpm,
    unitMs,
    dotMs: unitMs * MORSE_TIMING.DOT_UNITS,
    dashMs: unitMs * MORSE_TIMING.DASH_UNITS,
    elementGapMs: unitMs * MORSE_TIMING.ELEMENT_GAP_UNITS,
    characterGapMs: unitMs * MORSE_TIMING.CHARACTER_GAP_UNITS,
    wordGapMs: unitMs * MORSE_TIMING.WORD_GAP_UNITS
  };
}

/**
 * Resolve Farnsworth timing.
 *
 * Signal elements are sent at characterWpm. Additional spacing is distributed
 * between the four inter-character gaps and one inter-word gap in the standard
 * 31/19 PARIS decomposition. When overallWpm >= characterWpm, standard timing
 * is returned because no extra spacing is necessary.
 */
export function getFarnsworthTiming(overallWpm, characterWpm = overallWpm) {
  assertWpm(overallWpm, "Overall WPM");
  assertWpm(characterWpm, "Character WPM");

  if (overallWpm >= characterWpm) {
    return getStandardTiming(characterWpm);
  }

  const characterUnitMs = unitDurationMs(characterWpm);
  const overallUnitMs = unitDurationMs(overallWpm);
  const baseCharacterGapMs = characterUnitMs * MORSE_TIMING.CHARACTER_GAP_UNITS;
  const baseWordGapMs = characterUnitMs * MORSE_TIMING.WORD_GAP_UNITS;

  // A PARIS word contains 31 element/intra-element units and 19 spacing units.
  const targetWordMs = overallUnitMs * MORSE_TIMING.PARIS_UNITS;
  const characterContentMs = characterUnitMs * MORSE_TIMING.PARIS_ELEMENT_UNITS;
  const additionalSpacingMs = Math.max(0, targetWordMs - characterContentMs);
  const addedPerSpacingUnit = additionalSpacingMs / MORSE_TIMING.PARIS_SPACING_UNITS;

  return {
    wpm: overallWpm,
    characterWpm,
    unitMs: overallUnitMs,
    characterUnitMs,
    dotMs: characterUnitMs * MORSE_TIMING.DOT_UNITS,
    dashMs: characterUnitMs * MORSE_TIMING.DASH_UNITS,
    elementGapMs: characterUnitMs * MORSE_TIMING.ELEMENT_GAP_UNITS,
    characterGapMs: baseCharacterGapMs + addedPerSpacingUnit * MORSE_TIMING.CHARACTER_GAP_UNITS,
    wordGapMs: baseWordGapMs + addedPerSpacingUnit * MORSE_TIMING.WORD_GAP_UNITS
  };
}

/**
 * Resolve the timing profile used by audio generation and input validation.
 */
export function resolveTiming({
  wpm = MORSE_TIMING.DEFAULT_WPM,
  characterWpm = wpm,
  mode = "standard"
} = {}) {
  if (mode === "farnsworth") {
    return getFarnsworthTiming(wpm, characterWpm);
  }

  return getStandardTiming(wpm);
}

/**
 * Convert a Morse pattern into timed audio/input events.
 * Events use an absolute offset from the beginning of the pattern and are
 * suitable for either Web Audio scheduling or input/timing analysis.
 */
export function buildCharacterTimeline(morse, timing = getStandardTiming()) {
  if (typeof morse !== "string" || morse.length === 0) return [];
  if (!/^[.-]+$/.test(morse)) {
    throw new Error("A Morse character must contain only '.' and '-' symbols");
  }

  const events = [];
  let offsetMs = 0;

  morse.split("").forEach((symbol, index) => {
    const durationMs = symbol === "." ? timing.dotMs : timing.dashMs;

    events.push({
      type: symbol === "." ? "dot" : "dash",
      symbol,
      offsetMs,
      durationMs
    });

    offsetMs += durationMs;

    if (index < morse.length - 1) {
      offsetMs += timing.elementGapMs;
    }
  });

  return events;
}

/**
 * Calculate the duration occupied by a single Morse character, excluding
 * the inter-character gap that follows it.
 */
export function characterDurationMs(morse, timing = getStandardTiming()) {
  return buildCharacterTimeline(morse, timing).reduce(
    (total, event) => total + event.durationMs,
    0
  ) + Math.max(0, morse.length - 1) * timing.elementGapMs;
}

export function isValidWpm(wpm) {
  return Number.isFinite(wpm) && wpm >= MIN_WPM && wpm <= MAX_WPM;
}
