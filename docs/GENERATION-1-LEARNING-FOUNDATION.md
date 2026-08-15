# Generation 1 — Learning Foundation

## Goal
Turn the current Tapmind prototype into a reliable, data-driven learning engine that can support mastery and adaptive learning later without a rewrite.

## Phase status

### Phase 1.1 — Architecture foundation
- [x] Curriculum behaviour moved into level metadata.
- [x] Learning rules moved into reusable utilities.
- [x] Morse input reset handler stabilized.

### Phase 1.2 — Learning-domain foundation
- [x] Level types defined.
- [x] Practice modes defined.
- [x] Assessment metadata defined.
- [ ] Full lesson/exercise domain model — planned for the next Gen 1 slice.

### Phase 1.3 — Exercise engine
- [x] Controlled assessment generation.
- [x] Current-level coverage in assessments.
- [x] Configurable question counts.
- [x] Configurable pass thresholds.
- [ ] Additional exercise types beyond reproduction/test.

### Phase 1.4 — Input engine
- [x] Spacebar timing remains configurable through a named threshold.
- [x] Held-key auto-repeat protection.
- [x] Input length limit.
- [x] Stable reset behaviour.
- [ ] Touch input abstraction.
- [ ] Input calibration/feedback.

### Phase 1.5 — Assessment engine
- [x] Removed uncontrolled test generation from the UI layer.
- [x] Assessment selection is now centralized.
- [x] Passing threshold comes from curriculum data.
- [ ] Weakness-weighted assessment selection — Generation 3.
- [ ] Spaced review scheduling — Generation 3.

### Phase 1.6 — Learning metrics
- [x] Score separated from attempts and accuracy.
- [x] Session streak retained as a motivational metric.
- [x] Character attempt data recorded.
- [ ] Formal mastery calculation — Generation 3.

### Phase 1.7 — Persistence
- [x] Learner progress persisted in localStorage.
- [x] Completed levels persisted.
- [x] Character attempts/accuracy persisted.
- [x] Current level persisted.

### Phase 1.8 — Progression control
- [x] Levels lock until the previous level is completed.
- [x] Completed levels remain revisitable.
- [x] Foundation lessons can complete without a meaningless assessment.
- [ ] Full progression rules for future curriculum types.

## Current implementation principle
Tapmind should not confuse game score with learning mastery. Score/streak are motivational signals; accuracy, attempts, completion and eventually mastery are learning signals.

## Validation limitation
The current environment could not clone the public repository or run `npm install`/`npm run build` because external GitHub DNS/network access was unavailable. Code consistency has therefore been checked from the repository state, but a local production build still needs to be run in a normal development environment before declaring this generation release-ready.

## Next work
1. Define the full lesson/exercise domain model.
2. Improve progression semantics.
3. Add automated tests once the test runner is introduced.
4. Validate the whole learner flow locally.
5. Only then move toward Generation 2 UX work.
