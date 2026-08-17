import { getStandardTiming, resolveTiming } from "./timing";

export const MORSE_INPUT_DEVICES = Object.freeze({
  KEYBOARD: "keyboard",
  TOUCH: "touch",
  MOUSE: "mouse",
  POINTER: "pointer"
});

export const MORSE_INPUT_DEFAULTS = Object.freeze({
  wpm: 15,
  characterWpm: 15,
  timingMode: "standard",
  maxSequenceLength: 10,
  minimumPressMs: 20,
  maximumPressMs: 3_000
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function finiteOr(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

/**
 * Resolve the classification boundary between a dit and dah from the
 * configured character speed. A midpoint between the one-unit and three-unit
 * element durations leaves room for natural timing variation while preserving
 * a clear separation.
 */
export function getPressCalibration({
  wpm = MORSE_INPUT_DEFAULTS.wpm,
  characterWpm = wpm
} = {}) {
  const timing = getStandardTiming(characterWpm);
  const dotDurationMs = timing.dotMs;
  const dashDurationMs = timing.dashMs;
  const thresholdMs = (dotDurationMs + dashDurationMs) / 2;

  return Object.freeze({
    dotDurationMs,
    dashDurationMs,
    thresholdMs,
    recommendedDotMaxMs: Math.round(thresholdMs),
    recommendedDashMinMs: Math.round(thresholdMs)
  });
}

export function classifyPressDuration(durationMs, calibration = getPressCalibration()) {
  if (!Number.isFinite(durationMs) || durationMs <= 0) return null;
  return durationMs < calibration.thresholdMs ? "." : "-";
}

export function measureTimingQuality(durationMs, symbol, timing = getStandardTiming()) {
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return { score: 0, label: "invalid", errorRatio: 1 };
  }

  const expectedMs = symbol === "." ? timing.dotMs : timing.dashMs;
  const errorRatio = Math.abs(durationMs - expectedMs) / expectedMs;
  const score = clamp(Math.round((1 - errorRatio) * 100), 0, 100);

  let label = "excellent";
  if (score < 90) label = "good";
  if (score < 70) label = "loose";
  if (score < 45) label = "poor";

  return { score, label, errorRatio, expectedMs, durationMs };
}

export function createMorseInputSession(options = {}) {
  const config = {
    ...MORSE_INPUT_DEFAULTS,
    ...options
  };
  const timing = resolveTiming({
    wpm: config.wpm,
    characterWpm: config.characterWpm,
    mode: config.timingMode
  });
  const calibration = getPressCalibration(config);

  let sequence = "";
  let pressStartedAt = null;
  let activeDevice = null;
  let events = [];

  function startPress({ device = MORSE_INPUT_DEVICES.KEYBOARD, timestamp = performance.now() } = {}) {
    if (pressStartedAt !== null) return false;
    activeDevice = device;
    pressStartedAt = timestamp;
    return true;
  }

  function endPress({ timestamp = performance.now() } = {}) {
    if (pressStartedAt === null) return null;

    const durationMs = timestamp - pressStartedAt;
    const symbol = classifyPressDuration(durationMs, calibration);
    const timingQuality = symbol ? measureTimingQuality(durationMs, symbol, timing) : null;

    if (symbol && durationMs >= config.minimumPressMs && durationMs <= config.maximumPressMs) {
      if (sequence.length < config.maxSequenceLength) {
        sequence += symbol;
      }

      const event = Object.freeze({
        device: activeDevice,
        symbol,
        durationMs,
        startTimestamp: pressStartedAt,
        endTimestamp: timestamp,
        timingQuality
      });

      events.push(event);
      pressStartedAt = null;
      activeDevice = null;
      return event;
    }

    pressStartedAt = null;
    activeDevice = null;
    return null;
  }

  function reset() {
    sequence = "";
    pressStartedAt = null;
    activeDevice = null;
    events = [];
  }

  function snapshot() {
    return Object.freeze({
      sequence,
      isPressed: pressStartedAt !== null,
      activeDevice,
      events: [...events],
      timing,
      calibration
    });
  }

  return Object.freeze({ startPress, endPress, reset, snapshot });
}

export function isSupportedInputDevice(device) {
  return Object.values(MORSE_INPUT_DEVICES).includes(device);
}

export function normalizePressDuration(durationMs) {
  return clamp(Math.round(finiteOr(durationMs, 0)), 0, MORSE_INPUT_DEFAULTS.maximumPressMs);
}
