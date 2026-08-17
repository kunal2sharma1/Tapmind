# TapMind Morse — Phase 8 Adaptive Learning

## Objective

Turn learner mastery into concrete next-exercise decisions without allowing adaptation to bypass curriculum boundaries.

## Adaptive inputs

- Per-character mastery
- Per-skill mastery
- Accuracy and attempt history
- Consecutive failures
- Time since last practice
- Current curriculum boundary
- Content difficulty
- Recently practiced items

## Session balance

Default planning target:

- 50% weak skills/items
- 20% reinforcement
- 20% retention-oriented review
- 10% new/underexposed practice

The planner may compress these roles when the eligible candidate pool is smaller than the requested session size.

## Safety rules

- Never select a character outside the learner's introduced curriculum boundary.
- Never use adaptation to unlock future curriculum content.
- Do not let repeated short-term success completely eliminate retention/reinforcement exposure.
- Keep exercise generation separate from mastery calculation.
- Keep timing quality as a skill signal rather than silently converting it into binary correctness.

## Determinism

Seeded selection is supported so sessions can be reproduced in tests and debugging.

## Future integration

Phase 9 adds explicit review scheduling. Phase 8 may identify an item as needing attention, but the scheduler will own the next-review timestamp and interval logic.
