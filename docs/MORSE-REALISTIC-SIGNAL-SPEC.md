# TapMind Realistic Morse — Phase 15 Specification

## Purpose

Train reception under controlled signal degradation without changing the underlying Morse message or target WPM.

## Signal profiles

- `clean`: no degradation.
- `light`: low noise, light fading, mild timing variation.
- `moderate`: noticeable noise/fading, mild interference and occasional dropouts.
- `difficult`: strong degradation with larger timing variation and lower signal strength.
- `field`: severe but bounded degradation representing difficult field conditions.

## Simulation dimensions

1. Noise floor
2. Signal fading
3. Interference tone
4. Signal-volume reduction
5. Timing jitter
6. Bounded symbol dropouts

## Product rules

- The Morse source content remains canonical.
- Target WPM is independent of realism level.
- Clean mode is a control condition.
- Every harder profile must have equal or lower modeled signal quality.
- The same seed must produce the same timing/dropout transform.
- Realism must never alter the correctness of the underlying answer.
- Reception scoring continues to measure transcription separately from signal difficulty.

## Validation

`npm run validate:realistic-morse`

Browser/device audio QA remains part of final release QA.
