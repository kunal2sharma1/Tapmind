# TapMind Morse — Phase 7 Mastery Engine

## Objective

Measure what the learner can actually do, not merely whether a lesson was completed.

## Mastery dimensions

Each character tracks independent strengths for:

- recognition
- recall
- audio recognition
- audio recall
- sending
- timing
- speed
- retention
- confidence

Overall mastery is a weighted composite. The dimensions remain separately addressable so later adaptive learning can target the weakest skill rather than treating a character as simply known/unknown.

## Mastery states

`new → introduced → learning → developing → strong → mastered`

A strong or mastered item can move to `at-risk` when retention weakens, and repeated weak performance can move an item into `relearning`.

## Event model

Every eligible exercise response can produce a mastery event containing:

- mode
- skills trained
- correctness
- response timing when available
- timing quality when available
- retention outcome when available
- learner confidence when available
- timestamp

## Scoring philosophy

Phase 7 deliberately separates:

1. raw correctness,
2. skill strength,
3. overall mastery state.

A correct answer increases the relevant skill gradually instead of jumping directly to mastery. An incorrect answer is penalized more strongly and resets the consecutive-correct streak.

## Persistence

Progress storage is now `tapmind.progress.v3`. Existing v1/v2 progress is migrated without discarding prior character accuracy data. Mastery starts neutral for migrated characters and is learned from new interactions.

## Future compatibility

Phase 8 will consume these mastery records to select exercises adaptively. The mastery engine must remain independent of UI and subject-specific curriculum logic so the same architecture can eventually support other Tapmind subjects.
