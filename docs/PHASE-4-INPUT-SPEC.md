# TapMind Morse Input Engine — Phase 4

## Purpose

Provide a device-neutral Morse input layer that can capture press timing, classify dit/dah symbols, preserve raw timing events, and support keyboard, touch, mouse, and future hardware adapters.

## Principles

- Input devices are adapters; the learning engine consumes normalized press events.
- Classification is derived from Morse timing configuration, not a fixed global 200 ms threshold.
- Raw duration and timing quality are preserved for future mastery and analytics.
- Pointer input is scoped to an explicit input surface rather than globally capturing ordinary clicks.
- Input sessions must be resettable and safe when a pointer or keyboard event is cancelled.

## Normalized event

```text
{
  device,
  symbol,
  durationMs,
  startTimestamp,
  endTimestamp,
  timingQuality
}
```

## Supported devices

- keyboard
- touch
- mouse
- pointer

## Calibration

The initial calibration derives the classification boundary from the configured character speed by placing the boundary between the nominal one-unit dot and three-unit dash durations. A later calibration UI can tune this boundary from observed learner input without changing the event contract.

## Timing quality

Each recognized press receives a 0–100 quality score based on deviation from the configured nominal dot or dash duration. This metric is diagnostic only in Phase 4 and must not yet affect progression or mastery.

## Future adapters

The event contract is intentionally suitable for microphone, USB key, Bluetooth key, and other physical Morse-input sources.
