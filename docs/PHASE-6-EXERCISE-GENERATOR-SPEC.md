# TapMind Morse — Phase 6 Exercise Generation Engine

## Objective

Generate deterministic, structured Morse exercises from canonical content while keeping candidate selection, difficulty, distractors, mode selection, and session planning independently replaceable by the future mastery engine.

## Engine layers

1. Candidate pool — letters, numbers, punctuation, prosigns, or all supported content.
2. Difficulty model — introductory, standard, challenging, advanced.
3. Learner-context weighting — due, weak, unseen, and recently practiced signals.
4. Target selection — deterministic seeded selection for reproducible sessions and tests.
5. Distractor construction — category and difficulty-aware alternatives that exclude the target.
6. Exercise construction — existing Phase-5 mode/exercise contract.
7. Session generation — fixed-length deterministic plans with mixed-mode rotation.

## Phase-6 principle

The generator may use learner context, but it must not invent mastery scores. It consumes context supplied by a later mastery layer. Phase 7 will own the formal mastery model and can pass richer signals without changing this engine's public contract.

## Determinism

Every generated exercise can carry a seed. The same content, context and seed must produce the same candidate and session sequence. This makes regression testing and bug reproduction possible.

## Difficulty

Difficulty is currently a content heuristic based on Morse length, symbol transitions, repeated-symbol patterns and category. It is intentionally a baseline; Phase 7 can override difficulty using learner mastery without changing exercise schema.

## Distractors

Recognition exercises receive distractors from the same content category and, when possible, the same difficulty band. The target can never appear as an independent distractor.

## Session behavior

A mixed session rotates across recognition, recall, audio recognition, audio recall and sending. It is not a random bag of modes and does not introduce skills outside the declared session contract.

## Future mastery integration

The next layer may provide:

- weakness scores
- mastery state
- review due status
- recently practiced IDs
- confusion pairs
- target speed
- retention risk

The generator should use those signals for weighting rather than embedding mastery rules itself.
