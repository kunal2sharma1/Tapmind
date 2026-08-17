# TapMind Morse Master Product — Upgrade Status

## Branch

`upgrade/morse-master-product`

## Deployment rule

This branch is one large product upgrade. Do not merge to `main` until the complete release scope is validated. Production deployment should occur from the final merge to `main`, not from intermediate development work.

## Current phase

**Phase 3 — COMPLETE**

**Next phase:** Phase 4 — Input Engine

Phase 2 curriculum architecture and Phase 3 audio/timing implementation are complete as development phases. Browser/device audio quality testing remains part of the final end-to-end QA phase and is intentionally not treated as a reason to block the phase transition.

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
- [x] Verified the latest branch commit builds successfully as a Vite deployment on Vercel.

## Not yet released

- [ ] Phase 4 input engine
- [ ] Touch input
- [ ] Input calibration
- [ ] Audio recognition exercises
- [ ] Timing-quality scoring
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

The local container cannot currently resolve `github.com`, so a local `npm install`/`npm run build` cannot be executed from this session. However, the latest branch commit has been built successfully by the connected Vercel Vite deployment and is in `READY` state.

The Vercel preview is a development preview only. It has not been promoted or merged to production. Production remains the final `main` merge for the single large release.
