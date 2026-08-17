# TapMind Morse — Phase 5 Learning Modes

## Objective

Build a reusable learning-mode layer that separates *what skill is being trained* from the UI and from the future exercise-generation/mastery systems.

## Modes

1. Learn — guided introduction to a character using visual representation, audio and guided reproduction.
2. Recognition — visible Morse pattern → character.
3. Recall — character → Morse pattern.
4. Audio Recognition — Morse audio → character.
5. Audio Recall — audio cue → Morse reproduction.
6. Sending — character → deliberate timed Morse input.
7. Mixed Practice — combines previously trained skills.

## Shared exercise contract

Every generated exercise must carry:

- stable exercise ID
- mode
- canonical target character snapshot
- skills being trained
- attempt budget
- audio requirement
- input requirement
- reveal policy
- source/difficulty metadata

This allows the future exercise generator and mastery engine to consume exercises without knowing how the learner UI renders them.

## Response contract

Recognition-oriented modes return a symbol response. Reproduction-oriented modes return a Morse response. Learn mode returns a completion state. Sending responses may additionally carry raw timing events from the Phase 4 input engine.

## Scoring rule

Phase 5 uses binary correctness only. Timing-quality data is preserved but does not yet affect score or progression. Formal mastery weighting belongs to Phase 7.

## UX principles

- A learner should always know what skill they are training.
- Visual cues should be progressively removable as audio competence grows.
- Audio recognition must not reveal the visual Morse pattern before the answer.
- Sending feedback should distinguish pattern correctness from timing quality.
- Mixed practice should not become random noise; it must draw from skills already introduced by the curriculum.

## Future compatibility

The mode engine is deliberately independent of Morse-specific React components. A future Python module can implement a separate content adapter while reusing the same learning-mode/exercise architecture.