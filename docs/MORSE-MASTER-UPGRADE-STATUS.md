# TapMind Morse Master Product — Upgrade Status

## Branch

`upgrade/morse-master-product`

## Deployment rule

This branch is one large product upgrade. Do not merge to `main` until the complete 47-phase release scope is validated. Production deployment should occur from the final merge to `main`, not from intermediate development work.

Automatic Vercel deployment is disabled for this upgrade branch. `main` remains the production branch.

## Current phase

**Phase 10 — Daily Learning System — COMPLETE**

**Next phase:** Phase 11 — Word Learning.

Phases 2 through 10 are complete development phases. Browser/device QA, comprehensive automated testing, full local build verification and final end-to-end verification remain part of the final release QA scope.

## Phase 10 — Daily Learning System — COMPLETE

- [x] Added daily session planning based on due reviews, mastery weaknesses and introduced curriculum scope.
- [x] Added configurable daily session duration and exercise-count bounds.
- [x] Added review-first session composition when reviews are due.
- [x] Added adaptive-practice allocation after due reviews.
- [x] Added controlled new-material allocation rather than unrestricted content expansion.
- [x] Added weakest-skill summary to the daily plan.
- [x] Added deterministic date-based daily session IDs.
- [x] Added resumable daily-session persistence through `tapmind.daily.v1`.
- [x] Added learner-facing daily plan card with duration, exercise count, review count and weak-skill summary.
- [x] Added daily-session start/refresh behavior from the main learning surface.
- [x] Added `validate:daily` validation command for daily mix/session invariants.
- [x] Added daily-learning specification and status documentation.

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
- [x] Documented the scheduler contract and daily-review boundary.

## Phase 8 — Adaptive Learning — COMPLETE

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
- [x] Documented the adaptive-learning safety rules.

## Phase 7 — Mastery Engine — COMPLETE

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

## Phase 6 — Exercise Generation Engine — COMPLETE

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

## Phase 5 — Learning Modes — COMPLETE

- [x] Defined canonical learning modes: Learn, Recognition, Recall, Audio Recognition, Audio Recall, Sending, Mixed Practice.
- [x] Added reusable learning-mode descriptions and configuration.
- [x] Added mode-aware exercise contract and response scoring.
- [x] Added executable non-Learn learning sessions and mode-specific UI.

## Phase 4 — Input Engine — COMPLETE

- [x] Added keyboard, pointer/mouse and touch-compatible input adapters.
- [x] Added timing capture, calibration, device identification and timing quality.
- [x] Added learner-facing Morse input pad and diagnostics.

## Phase 3 — Audio + Timing Engine — COMPLETE

- [x] Added centralized Morse timing, WPM and Farnsworth-ready scheduling.
- [x] Added browser-safe Web Audio generation with tone controls.
- [x] Added learner-facing audio controls and audio hook.

## Phase 2 — Curriculum Architecture — COMPLETE

- [x] Expanded the original 10-level prototype into a staged 64-lesson Morse path.
- [x] Added foundation, letters, numbers, punctuation, prosigns, review and mastery stages.
- [x] Connected lessons to the canonical Morse catalog.
- [x] Added curriculum validation and progress migration.

## Not yet released

- [ ] Phase 11 word learning
- [ ] Phase 12 sentence learning
- [ ] Phase 13 speed engine
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
