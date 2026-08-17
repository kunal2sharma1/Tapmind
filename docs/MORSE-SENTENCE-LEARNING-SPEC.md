# TapMind Morse Sentence Learning Specification

## Purpose

Sentence learning is the message-comprehension layer above character and word learning. It trains learners to interpret complete Morse messages while preserving the same canonical Morse encoder and audio/input systems.

## Modes

- Sentence Recognition: Morse message -> text
- Sentence Audio Recognition: audio message -> text
- Sentence Recall: text -> Morse
- Sentence Audio Recall: heard message -> Morse

## Content progression

Foundation -> Basic -> Operational -> Advanced.

Each sentence has a stable ID, normalized text, canonical Morse encoding, difficulty, level, tags, word count and character count.

## Encoding rules

- Each character is encoded through the canonical Morse catalog.
- Elements inside a word use canonical Morse element spacing.
- Words are separated in the sentence representation by ` / `.
- Unsupported characters fail validation rather than being silently dropped.

## Exercise guarantees

- Deterministic seeded selection.
- Controlled sentence distractors for recognition modes.
- Target cannot appear twice in a choice set.
- Difficulty gates prevent advanced sentences from being exposed before the configured level.

## Persistence

Sentence performance is stored independently from character and word mastery under `sentenceMastery` in `tapmind.progress.v5`.

Each record stores attempts, correct count, accuracy, overall score and last-practiced timestamp.

## Future integration

Phase 13+ can add sentence WPM, reception/copying, noise simulation, partial-copy scoring, retention scheduling and head-copy metrics without changing the canonical sentence model.
