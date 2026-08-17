# TapMind Morse Curriculum Specification

## Purpose

This document defines the curriculum architecture for the Morse Master Product upgrade. The curriculum is designed to move a learner from zero Morse knowledge to broad character mastery before word, sentence, reception, and fluency work is introduced.

## Product principle

TapMind should optimize for automatic recognition rather than conscious dot/dash counting. New characters are introduced one at a time, mixed immediately with previously learned material, and revisited through later review gates.

The curriculum therefore separates:

- knowledge acquisition
- recognition
- recall
- audio recognition
- sending
- timing
- retention
- speed

A lesson may expose several of these skills even when the current UI only renders the existing reproduction flow. The richer metadata is intentionally forward-compatible with future exercise generators.

## Curriculum stages

| Stage | Levels | Purpose |
| --- | ---: | --- |
| Foundation | 1 | Dot/dash and input fundamentals |
| Letters | 2–27 | Full alphabet acquisition |
| Numbers | 28–37 | Digits 0–9 |
| Punctuation | 38–53 | High-value written punctuation |
| Prosigns | 54–59 | Operational Morse signals |
| Review | 60–63 | Stage mastery and mixed retrieval |
| Mastery | 64 | Gateway into words, sentences and fluency |

## Letter progression

The initial alphabet path uses a Koch-style philosophy: introduce one character at a time, keep previously learned characters active, and require a high-accuracy gate before progressing. The exact sequence is treated as TapMind curriculum policy rather than a claim that one universal character order is optimal.

Current order:

K → M → R → S → U → A → P → T → L → O → W → I → N → J → B → X → D → F → H → V → G → Z → Q → C → Y → E

The sequence is designed to provide a varied mixture of short/long and dot/dash-balanced rhythms while creating useful contrast pairs early.

## Progression gates

Character and later symbol lessons use an initial default mastery gate of:

- minimum accuracy: 90%
- minimum attempts: 20 for mature lessons

Early lessons use smaller gates to avoid creating artificial friction while the engine is still teaching the fundamentals.

These are starting policy values. Once the adaptive learning system exists, gates should be expressed as reusable mastery policies rather than duplicated constants.

## Timing targets

Character speed and effective speed are stored separately.

The current curriculum recommends approximately 20 WPM character speed for the core acquisition path, with lower effective speed to leave processing room for beginners. These values are configuration, not hard-coded product limitations.

Future timing policy will support:

- character speed
- effective speed
- Farnsworth spacing
- standard spacing
- per-character calibration
- progression by demonstrated performance

## Exercise policy

Character, number, punctuation, and prosign lessons are modeled as supporting:

1. character reproduction
2. character recall
3. audio recognition
4. timing reproduction

The current UI does not yet expose all four exercise types. They are represented in the domain model now so the future exercise engine can activate them without changing the curriculum format.

## Review gates

The current curriculum contains explicit review checkpoints after major content groups:

- Letters Mastery Review
- Numbers Mastery Review
- Punctuation Mastery Review
- Operational Morse Review
- Morse Mastery Gateway

These are not intended to be simple pass/fail walls forever. Once formal mastery exists, the review engine should use the learner's weakness map, retention state, and speed profile to construct the actual review content.

## Backward compatibility

The current application still consumes the legacy lesson fields:

- `level`
- `label`
- `type`
- `letter`
- `morse`
- `practiceMode`
- `practiceRepeats`
- `assessment`

The new curriculum additionally carries:

- `id`
- `title`
- `stage`
- `skills`
- `objectives`
- `recommendedCharacterWpm`
- `recommendedEffectiveWpm`
- `masteryGate`
- optional `prerequisites`

This allows the curriculum to become richer without forcing an all-at-once UI rewrite.

## Future expansion

The same curriculum contract is intended to support the next Morse layers without changing the learning engine:

1. characters
2. code groups
3. words
4. callsigns
5. sentences
6. plain-text reception
7. head copy
8. realistic/noisy reception
9. operational scenarios
10. advanced speed training

## Quality requirement

Any future curriculum change must pass catalog validation, preserve contiguous level IDs, avoid duplicate lesson IDs, and retain canonical Morse mappings. Curriculum data is product logic and should be reviewed with the same care as application code.
