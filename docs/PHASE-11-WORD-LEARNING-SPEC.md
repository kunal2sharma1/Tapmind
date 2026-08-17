# TapMind Morse — Phase 11 Word Learning

## Objective

Move the learner from individual-character recognition to complete-word recognition and reproduction without replacing the character-level engine.

## Word layers

1. Character foundation — every word is encoded from the canonical Morse character catalog.
2. Word corpus — curated words grouped by foundation, basic, common and radio-oriented stages.
3. Word target — stable id, text, Morse representation, stage and difficulty.
4. Word exercise — audio recognition, Morse recognition, word recall, Morse recall and mixed rotation.
5. Word progress — attempts, accuracy, recognition, recall, audio and overall word strength.

## Product rules

- A word cannot enter the learning system if any character cannot be encoded.
- Word difficulty is independent of character difficulty, but word length and Morse length are available to the generator.
- Word distractors are selected at similar difficulty before falling back to the broader corpus.
- Character mastery remains the foundation; word mastery is a separate learning layer.
- Word sessions use the same deterministic generation principles as character sessions.
- The word layer must not silently unlock future sentence content.

## Session modes

### Audio Recognition
Hear the complete word in Morse and identify the written word.

### Morse Recognition
See the complete Morse word sequence and identify the written word.

### Word Recall
See the written word and reproduce its full Morse sequence.

### Morse Recall
See the written word and reproduce the full sequence with deliberate input timing.

### Mixed
Rotate across the four word skills.

## Persistence

Word progress is persisted separately in `tapmind.progress.v5.wordMastery` and migrated from previous progress versions with no loss of character or review data.

## Future integration

Phase 12 will add sentence composition and comprehension on top of word-level skill. Phase 13+ can add speed, reception and realistic conditions without changing the word contract.
