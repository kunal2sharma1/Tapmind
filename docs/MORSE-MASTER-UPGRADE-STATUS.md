# TapMind Morse Master Product — Upgrade Status

## Branch

`upgrade/morse-master-product`

## Deployment rule

This branch is one large product upgrade. Do not merge to `main` until the complete 47-phase release scope is validated. Production deployment should occur from the final merge to `main`, not from intermediate development work.

Automatic Vercel deployment is disabled for this upgrade branch. `main` remains the production branch.

## Current phase

**Phase 16 — Challenge System — COMPLETE**

**Next phase:** Phase 17 — Progress System Expansion.

Phases 2 through 16 are complete development phases. Browser/device QA, comprehensive automated testing, full local build verification and final end-to-end verification remain part of the final release QA scope.

## Phase 16 — Challenge System — COMPLETE

- [x] Added reusable challenge definitions independent of individual UI modes.
- [x] Added challenge types: speed, accuracy, streak, reception, realism and mixed.
- [x] Added challenge modifiers for time limits, no-replay, Farnsworth and realistic signal conditions.
- [x] Added challenge eligibility rules based on learner readiness.
- [x] Added deterministic seeded challenge-session generation.
- [x] Added challenge scoring with accuracy, speed, streak and time components.
- [x] Added challenge pass gates.
- [x] Added persistent challenge attempts, wins, streaks, personal bests and history in `tapmind.challenges.v1`.
- [x] Added learner-facing Challenge hub and navigation.
- [x] Connected challenge context to actual speed/reception readiness.
- [x] Added `validate:challenges` validation command.
- [x] Added Phase-16 challenge specification/documentation.

## Phase 15 — Realistic Morse — COMPLETE

- [x] Added explicit signal realism profiles: clean, light, moderate, difficult and field.
- [x] Added deterministic timing jitter transforms with seeded replayability.
- [x] Added bounded signal dropouts at higher realism levels.
- [x] Added modeled noise floor, fading, interference and signal-volume reduction.
- [x] Added signal-quality scoring independent of transcription correctness.
- [x] Extended Web Audio message playback with realistic signal effects.
- [x] Preserved clean-signal behavior as a control condition.
- [x] Added learner-facing realism controls in Reception Training.
- [x] Kept target WPM independent from realism difficulty.
- [x] Added `validate:realistic-morse` validation command.
- [x] Added Phase-15 realistic-signal specification/documentation.

## Phase 14 — Reception Training — COMPLETE

- [x] Added continuous reception message corpus with foundation, basic, operational and advanced difficulty tiers.
- [x] Added canonical text-to-Morse encoding shared with word/sentence layers.
- [x] Added message-level Morse timing with explicit inter-character and inter-word gaps.
- [x] Added continuous Web Audio message playback.
- [x] Added five-message reception sessions.
- [x] Added target WPM selection, copy textarea, character/word accuracy, edit-distance scoring and effective WPM measurement.
- [x] Added persistent reception performance in `tapmind.reception.v1`.
- [x] Added learner-facing Reception navigation and `validate:reception`.

## Phase 13 — Speed Engine — COMPLETE

- [x] Added character/effective speed model, progressive WPM tiers, speed gates, qualified-speed progression, personal bests, timed trainer and `tapmind.speed.v1`.

## Phase 12 — Sentence Learning — COMPLETE

- [x] Added progressive sentence corpus, canonical sentence-to-Morse encoding, word-gap representation, sentence modes, deterministic selection, sentence difficulty gating, sentence session UI, sentence mastery and `validate:sentences`.

## Phase 11 — Word Learning — COMPLETE

- [x] Added curated word corpus, canonical encoding, word exercise modes, deterministic selection, word progress, Words navigation and `validate:words`.

## Earlier completed phases

### Phase 10 — Daily Learning System — COMPLETE
- [x] Added daily session planning based on due reviews, mastery weaknesses and introduced curriculum scope; persistent/resumable daily plan and `validate:daily`.

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

- [ ] Phase 17 progress system expansion
- [ ] Advanced learner dashboard and analytics
- [ ] Automated test runner and full test suite
- [ ] Full local development-environment build verification
- [ ] Final end-to-end QA

## Validation notes

The local container cannot currently resolve `github.com`, so a local `npm install`/`npm run build` cannot be executed from this session. The GitHub repository state and branch-level source changes have been inspected directly. Browser/device QA and a full local build remain explicit final-release checks.

The upgrade branch is not deployed automatically to Vercel. No production deployment is intended until the complete large-scale upgrade is merged to `main`.
