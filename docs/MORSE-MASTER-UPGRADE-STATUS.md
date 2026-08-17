# TapMind Morse Master Product — Upgrade Status

## Branch

`upgrade/morse-master-product`

## Deployment rule

This branch is one large product upgrade. Do not merge to `main` until the complete 47-phase release scope is validated. Production deployment should occur from the final merge to `main`, not from intermediate development work.

Automatic Vercel deployment is disabled for this upgrade branch. `main` remains the production branch.

## Current phase

**Phase 9 — Spaced Repetition Scheduler — COMPLETE**

**Next phase:** Phase 10 — Daily Learning System.

Phases 2 through 9 are complete development phases. Browser/device QA, comprehensive automated testing, full local build verification and final end-to-end verification remain part of the final release QA scope.

## Phase 9 — Spaced Repetition Scheduler — COMPLETE

- [x] Added explicit review phases: new, learning, review and relearning.
- [x] Added review quality levels: fail, hard, good and easy.
- [x] Added first-exposure learning steps.
- [x] Added successful-review interval growth.
- [x] Added easy/hard interval and ease-factor adjustments.
- [x] Added lapse handling with rapid relearning intervals.
- [x] Added maximum review-interval cap.
- [x] Added due-date and overdue-age calculations.
- [x] Added deterministic due-review queue ranking.
- [x] Added review queue helpers and summary calculations.
- [x] Added persistent review state to `tapmind.progress.v4`.
- [x] Added v3/v2/v1 progress migration into the new review schema.
- [x] Connected review state to every recorded learning attempt.
- [x] Integrated due/overdue review priority into the exercise generator, including when mastery-aware ranking is active.
- [x] Added `validate:reviews` validation command.
- [x] Documented the scheduler contract and Phase-10 daily-review boundary.

## Earlier completed phases

### Phase 8 — Adaptive Learning — COMPLETE

- [x] Added mastery-aware candidate ranking without replacing the canonical exercise generator.
- [x] Added weak/underexposed/recent-practice weighting.
- [x] Added explicit adaptive session roles: weak, reinforce, retention and new/underexposed.
- [x] Added mastery-driven mode selection from weakest skills.
- [x] Added deterministic adaptive session planning with seeded selection.
- [x] Added adaptive ranking validation command.
- [x] Integrated mastery context from `useProgress` into the learner session.
- [x] Limited adaptive candidate eligibility to characters already introduced by the curriculum boundary.
- [x] Integrated adaptive candidate ranking into Phase-6 exercise generation.
- [x] Preserved deterministic generation and explicit exercise metadata.
- [x] Documented the adaptive-learning safety rules and Phase-9 scheduler boundary.

### Phase 7 — Mastery Engine — COMPLETE

- [x] Added multi-dimensional mastery for recognition, recall, audio recognition, audio recall, sending, timing, speed, retention and confidence.
- [x] Added explicit mastery states: new, introduced, learning, developing, strong, mastered, at-risk and relearning.
- [x] Added mastery event model independent of UI components.
- [x] Added gradual score updates rather than binary completion-to-mastery jumps.
- [x] Added stronger penalties for repeated incorrect responses.
- [x] Added timing-quality and response-time inputs when available.
- [x] Added retention and confidence inputs for future spaced/adaptive systems.
- [x] Added overall weighted mastery calculation.
- [x] Added weakest-skill extraction for adaptive exercise selection.
- [x] Added persistent mastery records in `tapmind.progress.v3`.
- [x] Preserved existing v1/v2 character accuracy data during migration.
- [x] Added learner-facing character mastery summary.
- [x] Added `validate:mastery` validation command.

### Phase 2 — Curriculum Architecture — COMPLETE

- [x] Expanded the original 10-level prototype into a staged 64-lesson Morse path.
- [x] Added foundation, letters, numbers, punctuation, prosigns, review, and mastery stages.
- [x] Added explicit learning objectives and skill metadata.
- [x] Added timing recommendations and mastery gates.
- [x] Added explicit review gateways.
- [x] Connected lesson characters to the canonical Morse catalog.
- [x] Added curriculum validation helpers.
- [x] Added a standalone `validate:curriculum` command.
- [x] Added progress-storage v2 migration so old numeric level meanings are not silently reused.
- [x] Preserved existing character statistics where possible during migration.
- [x] Added ambiguous Morse-pattern support for catalog lookups.

### Phase 3 — Audio + Timing Engine — COMPLETE

- [x] Added centralized Morse timing constants and calculations.
- [x] Added standard WPM support.
- [x] Added character-speed/effective-speed separation.
- [x] Added Farnsworth-ready spacing calculations.
- [x] Added character timeline generation for scheduled audio and future input analysis.
- [x] Added browser-safe Web Audio engine abstraction.
- [x] Added configurable tone frequency.
- [x] Added configurable volume.
- [x] Added configurable waveform.
- [x] Added attack/release envelope shaping.
- [x] Added scheduled dot/dash playback from Morse timelines.
- [x] Added named training audio profiles for beginner through expert use.
- [x] Added React audio hook with cleanup and playback-state handling.
- [x] Added learner-facing audio controls.
- [x] Added WPM selection and standard/Farnsworth selection to the UI.
- [x] Added tone-frequency control to the UI.
- [x] Integrated audio controls into the learner shell.

### Phase 4 — Input Engine — COMPLETE

- [x] Replaced the fixed 200 ms prototype threshold with a timing-model-derived classification boundary.
- [x] Added keyboard input adapter.
- [x] Added pointer/mouse input adapter.
- [x] Added touch-compatible pointer input.
- [x] Added normalized input device identifiers.
- [x] Added normalized raw press events with start/end timestamps and duration.
- [x] Added timing-quality scoring for each press.
- [x] Added sequence limits and press-duration safety bounds.
- [x] Added reset-safe input sessions.
- [x] Added learner-facing Morse input pad.
- [x] Added visual dit/dah feedback and timing diagnostics.
- [x] Added WPM-derived default calibration.
- [x] Added custom dit/dah calibration controls.
- [x] Added a recalculated classification boundary between dit and dah targets.
- [x] Kept calibration diagnostics separate from progression/mastery so Phase 4 does not prematurely bias learning outcomes.

### Phase 5 — Learning Modes — COMPLETE

- [x] Defined canonical learning modes: Learn, Recognition, Recall, Audio Recognition, Audio Recall, Sending, Mixed Practice.
- [x] Defined skill mappings for every learning mode.
- [x] Added reusable learning-mode descriptions and configuration.
- [x] Added canonical mode-aware exercise creation contract.
- [x] Added response validation and binary Phase-5 scoring rules.
- [x] Added mode eligibility/policy rules for future mastery-aware gating.
- [x] Added learner-facing training-mode selector.
- [x] Added executable learning session for non-Learn modes.
- [x] Added visible Morse recognition with controlled distractors.
- [x] Added character recall through the Phase-4 Morse input system.
- [x] Added audio recognition with explicit play/replay interaction.
- [x] Added audio recall with explicit play/replay interaction.
- [x] Added sending mode with raw timing feedback preserved.
- [x] Added mixed practice that rotates across previously built skill modes.
- [x] Added five-exercise session lifecycle with score summary and restart path.

### Phase 6 — Exercise Generation Engine — COMPLETE

- [x] Added reusable candidate-pool selection for letters, numbers, punctuation and prosigns.
- [x] Added baseline content-difficulty classification: introductory, standard, challenging, advanced.
- [x] Added learner-context weighting for due, weak, unseen and recently practiced items.
- [x] Added deterministic seeded candidate selection for reproducible sessions.
- [x] Added category-aware and difficulty-aware distractor generation.
- [x] Added target/exclusion guarantees so the target cannot be emitted as an independent distractor.
- [x] Added mode-aware exercise generation through the Phase-5 exercise contract.
- [x] Added generated-exercise metadata for source, seed, category and difficulty.
- [x] Added deterministic mixed-session generation across recognition, recall, audio recognition, audio recall and sending.
- [x] Added `validate:exercises` validation command.
- [x] Integrated generated exercises into the learner session.

## Not yet released

- [ ] Phase 10 daily learning system
- [ ] Word curriculum
- [ ] Sentence curriculum
- [ ] Reception/copying mode
- [ ] Speed challenges
- [ ] Realistic noise/signal simulation
- [ ] Advanced learner dashboard
- [ ] Automated test runner and full test suite
- [ ] Full local development-environment build verification
- [ ] Final end-to-end QA

## Validation notes

The local container cannot currently resolve `github.com`, so a local `npm install`/`npm run build` cannot be executed from this session. The GitHub repository state and branch-level source changes have been inspected directly. Browser/device QA and a full local build remain explicit final-release checks.

The upgrade branch is not deployed automatically to Vercel. No production deployment is intended until the complete large-scale upgrade is merged to `main`.
