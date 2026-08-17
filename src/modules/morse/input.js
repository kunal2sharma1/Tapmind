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
    recommendedDashMinMs: Math.round(thresholdMs),
    source: "timing-model"
  });
}

export function normalizeCalibration({ dotDurationMs, dashDurationMs, thresholdMs } = {}, fallback) {
  const base = fallback ?? getPressCalibration();
  const dot = clamp(finiteOr(dotDurationMs, base.dotDurationMs), 20, 2_000);
  const dash = clamp(finiteOr(dashDurationMs, base.dashDurationMs), dot + 10, 4_000);
  const threshold = clamp(
    finiteOr(thresholdMs, (dot + dash) / 2),
    dot + 1,
    dash - 1
  );

  return Object.freeze({
    dotDurationMs: dot,
    dashDurationMs: dash,
    thresholdMs: threshold,
    recommendedDotMaxMs: Math.round(threshold),
    recommendedDashMinMs: Math.round(threshold),
    source: "custom"
  });
}

export function classifyPressDuration(durationMs, calibration = getPressCalibration()) {
  if (!Number.isFinite(durationMs) || durationMs <= 0) return null;
  return durationMs < calibration.thresholdMs ? "." : "-";
}

export function measureTimingQuality(durationMs, symbol, timing = getStandardTiming(), calibration) {
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return { score: 0, label: "invalid", errorRatio: 1 };
  }

  const expectedMs = calibration
    ? symbol === "." ? calibration.dotDurationMs : calibration.dashDurationMs
    : symbol === "." ? timing.dotMs : timing.dashMs;
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
  let calibration = config.calibration
    ? normalizeCalibration(config.calibration, getPressCalibration(config))
    : getPressCalibration(config);

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
    const timingQuality = symbol
      ? measureTimingQuality(durationMs, symbol, timing, calibration)
      : null;

    if (symbol && durationMs >= config.minimumPressMs && durationMs <= config.maximumPressMs) {
      if (sequence.length < config.maxSequenceLength) sequence += symbol;

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

  function setCalibration(nextCalibration) {
    calibration = normalizeCalibration(nextCalibration, calibration);
    return calibration;
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

  return Object.freeze({ startPress, endPress, setCalibration, reset, snapshot });
}

export function isSupportedInputDevice(device) {
  return Object.values(MORSE_INPUT_DEVICES).includes(device);
}

export function normalizePressDuration(durationMs) {
  return clamp(Math.round(finiteOr(durationMs, 0)), 0, MORSE_INPUT_DEFAULTS.maximumPressMs);
}
