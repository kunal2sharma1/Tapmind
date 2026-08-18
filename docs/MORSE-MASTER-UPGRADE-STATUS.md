# TapMind Morse Master Product — Upgrade Status

## Branch

`upgrade/morse-master-product`

## Deployment rule

This branch is one large product upgrade. Do not merge to `main` until the complete 47-phase release scope is validated. Production deployment should occur from the final merge to `main`, not from intermediate development work.

Automatic Vercel deployment is disabled for this upgrade branch. `main` remains the production branch.

## Current phase

**Phase 13 — Speed Engine — COMPLETE**

**Next phase:** Phase 14 — Reception Training.

Phases 2 through 13 are complete development phases. Browser/device QA, comprehensive automated testing, full local build verification and final end-to-end verification remain part of the final release QA scope.

## Phase 13 — Speed Engine — COMPLETE

- [x] Added explicit character-speed and effective-speed profile model.
- [x] Added standard and Farnsworth-ready speed timing through the existing timing engine.
- [x] Added progressive WPM tiers from beginner through fast-reception targets.
- [x] Added accuracy, measured effective WPM and response-time evaluation.
- [x] Added speed pass gates requiring both accuracy and minimum correct-count thresholds.
- [x] Added speed-target advancement after a qualified pass.
- [x] Added personal best and qualified-speed tracking.
- [x] Added deterministic timed speed-session generation using only introduced characters.
- [x] Added learner-facing timed speed trainer with WPM controls and replay.
- [x] Added isolated persistent speed progress via `tapmind.speed.v1` to avoid destabilizing the shared progress schema.
- [x] Added `validate:speed` validation command.
- [x] Added Phase-13 speed-engine specification/documentation.

## Phase 12 — Sentence Learning — COMPLETE

- [x] Added progressive sentence corpus with foundation, basic, operational and advanced stages.
- [x] Added stable sentence IDs, difficulty metadata, tags, word counts and character counts.
- [x] Added canonical sentence-to-Morse encoding through the character catalog.
- [x] Added explicit word-gap representation in sentence Morse strings.
- [x] Added sentence modes: recognition, audio recognition, recall and audio recall.
- [x] Added deterministic sentence selection and controlled recognition distractors.
- [x] Added sentence difficulty gating.
- [x] Added learner-facing sentence session with five-exercise lifecycle.
- [x] Added Morse audio playback for complete messages.
- [x] Added Morse input for sentence recall and audio recall.
- [x] Added sentence-level progress tracking independent of character mastery.
- [x] Added Sentences navigation in the learner shell.
- [x] Added `validate:sentences` validation command.
- [x] Added Phase-12 specification documentation.

## Phase 11 — Word Learning — COMPLETE

- [x] Added curated word corpus with foundation, basic, common and radio-oriented stages.
- [x] Added stable word IDs and explicit difficulty metadata.
- [x] Added canonical word-to-Morse encoding through the character catalog.
- [x] Added word target objects with text, Morse, stage and difficulty.
- [x] Added word corpus validation for duplicate IDs/text and unsupported characters.
- [x] Added word exercise modes: audio recognition, Morse recognition, word recall, Morse recall and mixed practice.
- [x] Added difficulty-aware and mastery-aware word selection.
- [x] Added controlled word distractor generation.
- [x] Added deterministic seeded word-session generation.
- [x] Added word exercise scoring.
- [x] Added learner-facing Words navigation and dedicated word-learning session.
- [x] Added word-level progress tracking separate from character mastery.
- [x] Added `tapmind.progress.v5` with persisted `wordMastery` and migrations from earlier progress versions.
- [x] Added `validate:words` validation command.
- [x] Added Phase-11 specification documentation.

## Earlier completed phases

### Phase 10 — Daily Learning System — COMPLETE

- [x] Added daily session planning based on due reviews, mastery weaknesses and introduced curriculum scope.
- [x] Added configurable daily session duration and exercise-count bounds.
- [x] Added review-first session composition when reviews are due.
- [x] Added adaptive-practice allocation after due reviews.
- [x] Added controlled new-material allocation rather than unrestricted content expansion.
- [x] Added weakest-skill summary to the daily plan.
- [x] Added deterministic date-based daily session IDs.
- [x] Added resumable daily-session persistence through `tapmind.daily.v1`.
- [x] Added learner-facing daily plan card.
- [x] Added `validate:daily` validation command.

### Phase 9 — Spaced Repetition Scheduler — COMPLETE
- [x] Added review phases, quality levels, interval growth, lapse handling, due ranking, persistence and `validate:reviews`.

### Phase 8 — Adaptive Learning — COMPLETE
- [x] Added mastery-aware ranking, weak-skill roles, deterministic adaptive sessions, curriculum-bounded selection and `validate:adaptive`.

### Phase 7 — Mastery Engine — COMPLETE
- [x] Added multi-dimensional mastery, mastery states, persistence, weighted overall mastery, weakest-skill extraction and `validate:mastery`.

### Phase 6 — Exercise Generation Engine — COMPLETE
- [x] Added candidate pools, difficulty classification, learner-context weighting, deterministic generation, distractors, mixed sessions and `validate:exercises`.

### Phase 5 — Learning Modes — COMPLETE
- [x] Added Learn, Recognition, Recall, Audio Recognition, Audio Recall, Sending and Mixed Practice modes.

### Phase 4 — Input Engine — COMPLETE
- [x] Added keyboard, pointer/mouse, touch-compatible input, timing capture, calibration and timing quality.

### Phase 3 — Audio + Timing Engine — COMPLETE
- [x] Added centralized Morse timing, WPM/Farnsworth scheduling, Web Audio generation and learner-facing controls.

### Phase 2 — Curriculum Architecture — COMPLETE
- [x] Expanded the original 10-level prototype into a staged 64-lesson Morse path and connected it to the canonical catalog.

## Not yet released

- [ ] Phase 14 reception training
- [ ] Phase 15 realistic Morse
- [ ] Phase 16 challenge system
- [ ] Phase 17 progress system expansion
- [ ] Advanced learner dashboard and analytics
- [ ] Automated test runner and full test suite
- [ ] Full local development-environment build verification
- [ ] Final end-to-end QA

## Validation notes

The local container cannot currently resolve `github.com`, so a local `npm install`/`npm run build` cannot be executed from this session. The GitHub repository state and branch-level source changes have been inspected directly. Browser/device QA and a full local build remain explicit final-release checks.

The upgrade branch is not deployed automatically to Vercel. No production deployment is intended until the complete large-scale upgrade is merged to `main`.
