# TapMind Morse Reception Specification

## Purpose

Reception trains continuous Morse copying rather than isolated character recognition. The learner hears complete messages and transcribes what was received.

## Training progression

- Foundation: short, high-familiarity messages.
- Basic: ordinary conversational messages.
- Operational: instructions and radio-style messages.
- Advanced: longer operational/weather messages.

## Session contract

A reception session contains five messages. Each message has:

- stable ID
- normalized text
- difficulty
- tags
- canonical Morse representation
- WPM/timing configuration

## Playback

Reception uses the shared timing engine and Web Audio engine. Message timelines preserve intra-character, inter-character, and inter-word spacing. Farnsworth timing remains available through the shared timing resolver.

## Scoring

Each copied message records:

- character accuracy
- word accuracy
- edit distance
- elapsed copy time
- effective WPM
- pass/fail result

A message passes at 90% character accuracy and 75% word accuracy or better.

## Progress

Reception progress is independent from character, word, and sentence mastery and is persisted in `tapmind.reception.v1`.

The persistent profile tracks attempts, completed sessions, best character accuracy, best word accuracy, best effective WPM, and the last session timestamp.

## Safety boundaries

- Difficulty is bounded by the learner's current curriculum stage in the app.
- Reception does not alter character mastery directly.
- Speed measurements are descriptive until later mastery/progress integration phases.
- Browser/device validation remains part of final release QA.
