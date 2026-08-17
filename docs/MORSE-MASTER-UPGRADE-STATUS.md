# TapMind Morse Master Product — Upgrade Status

## Branch

`upgrade/morse-master-product`

## Deployment rule

This branch is one large product upgrade. Do not merge to `main` until the complete 47-phase release scope is validated. Production deployment should occur from the final merge to `main`, not from intermediate development work.

Automatic Vercel deployment is disabled for this upgrade branch. `main` remains the production branch.

## Current phase

**Phase 5 — Learning Modes — IN PROGRESS**

**Phase status:** approximately 55% complete.

**Next phase:** Phase 6 — Exercise Generation Engine.

Phases 2, 3 and 4 are complete development phases. Phase 5 currently has the canonical mode engine, mode policies, learning-mode exercise contract, learner-facing mode selector, and validation tooling. Full replacement of the legacy lesson flow with mode-specific exercise execution remains before Phase 5 can be marked complete.

## Phase 2 — Curriculum Architecture — COMPLETE

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

## Phase 3 — Audio + Timing Engine — COMPLETE

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
- [x] Verified an earlier branch commit built successfully on Vercel before automatic branch deployments were disabled.

## Phase 4 — Input Engine — COMPLETE

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
- [x] Documented the normalized input contract and future hardware adapter boundary.

## Phase 5 — Learning Modes — IN PROGRESS

- [x] Defined canonical learning modes: Learn, Recognition, Recall, Audio Recognition, Audio Recall, Sending, Mixed Practice.
- [x] Defined skill mappings for every learning mode.
- [x] Added reusable learning-mode descriptions and configuration.
- [x] Added canonical mode-aware exercise creation contract.
- [x] Added response validation and binary Phase-5 scoring rules.
- [x] Added mode eligibility/policy rules for future mastery-aware gating.
- [x] Added learner-facing training-mode selector.
- [x] Added learning-mode specification documentation.
- [x] Added learning-mode validation command.
- [ ] Replace the legacy practice/test flow with mode-specific exercise execution.
- [ ] Add audio recognition choice flow.
- [ ] Add audio recall flow.
- [ ] Add dedicated recognition/recall UI states.
- [ ] Integrate mode selection into session records and progression.
- [ ] Add mode-specific feedback without prematurely coupling to mastery.

## Not yet released

- [ ] Phase 6 exercise generation engine
- [ ] Formal mastery calculation
- [ ] Spaced repetition scheduler
- [ ] Adaptive exercise selection
- [ ] Daily review system
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
