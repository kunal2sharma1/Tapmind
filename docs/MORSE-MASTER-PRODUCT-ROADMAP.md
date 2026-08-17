# Tapmind — Morse Master Product Roadmap

## Purpose

This document is the source of truth for the first major Tapmind upgrade. The goal is to turn the current Morse learning prototype into a complete, adaptive Morse-learning product while preserving a reusable learning-engine architecture for future subjects such as Python.

## Deployment rule

This roadmap is intentionally delivered as **one major production upgrade**.

- All 47 phases belong to the branch `upgrade/morse-master-product`.
- We may make many commits on the branch.
- We should avoid unnecessary Vercel preview deployments and should not treat intermediate commits as production releases.
- Do not merge to `main` until the complete roadmap is implemented and validated.
- The final merge from `upgrade/morse-master-product` to `main` is the production release point.
- Production deployment should happen only from the final `main` merge.

## Product north star

Take a learner from zero Morse knowledge to practical fluency through sound-first learning, progressive character acquisition, deliberate practice, adaptive mastery, spaced review, reception, sending, speed training, realistic scenarios, and measurable retention.

## Product principles

1. Teach automatic recognition, not conscious dot/dash counting.
2. Prefer retrieval and active practice over passive explanation.
3. Adapt practice to the learner's weaknesses.
4. Measure capability and mastery rather than course completion alone.
5. Track accuracy, speed, retention, recognition, reception, and sending separately.
6. Make the next recommended learning action obvious.
7. Progress from controlled exercises to realistic communication.
8. Keep Morse-specific content separate from the reusable learning engine.

# 47-Phase Roadmap

## Foundation

### Phase 0 — Baseline and product specification
- Freeze the current production baseline.
- Document architecture, progress schema, curriculum, and deployment workflow.
- Define the full Morse product specification.
- Preserve current user progress and establish migration/versioning rules.

### Phase 1 — Morse knowledge model
- Model letters, numbers, punctuation, symbols, prosigns, and operational signals.
- Represent Morse patterns, timing, difficulty, relationships, and learning metadata.
- Model related/confusable characters.

### Phase 2 — Curriculum architecture
- Replace the prototype level sequence with a complete progressive curriculum.
- Establish beginner, character, number, punctuation, operational, word, sentence, reception, speed, and advanced tracks.
- Use progressive character acquisition inspired by Koch-style learning.

## Audio and input

### Phase 3 — Morse timing engine
- Implement standardized Morse timing relationships.
- Separate character speed from spacing.
- Support configurable WPM and timing presets.

### Phase 4 — Audio generation engine
- Build Web Audio Morse tone generation.
- Support tone frequency, volume, playback control, and accurate timing.
- Add beginner-friendly and advanced presets.

### Phase 5 — Farnsworth and speed controls
- Support character speed independently from effective spacing.
- Add WPM progression and configurable spacing.
- Prepare speed calibration for adaptive training.

### Phase 6 — Input abstraction
- Generalize keyboard, touch, mouse, and future hardware inputs.
- Preserve keyboard input while removing Morse-specific assumptions from UI components.

### Phase 7 — Input calibration and timing feedback
- Calibrate dot/dash thresholds.
- Measure press duration and gaps.
- Provide useful timing feedback instead of only correct/incorrect output.

## Learning modes and exercises

### Phase 8 — Learn mode
- Build guided introduction for each new character/skill.
- Teach sound, rhythm, recognition, and reproduction.
- Make the first interaction intentionally low-friction.

### Phase 9 — Recognition and recall modes
- Morse-to-character recognition.
- Character-to-Morse recall.
- Visual and symbolic discrimination exercises.

### Phase 10 — Audio recognition and audio recall
- Hear a character and identify it.
- Hear a character and reproduce it.
- Gradually remove visual scaffolding.

### Phase 11 — Sending practice
- Character-to-Morse practice.
- Timing-aware sending.
- Accuracy and rhythm feedback.

### Phase 12 — Exercise generation engine
- Centralize exercise generation.
- Add difficulty, distractor, coverage, and skill metadata.
- Keep generation separate from UI.

### Phase 13 — Confusion-aware exercises
- Detect common character confusions.
- Generate targeted comparison and discrimination exercises.
- Prioritize errors that repeatedly occur.

## Mastery and adaptation

### Phase 14 — Multi-dimensional mastery model
- Track recognition, recall, audio recognition, sending, timing, speed, and retention.
- Replace binary completion with meaningful mastery states.

### Phase 15 — Mastery state machine
- NEW → INTRODUCED → LEARNING → DEVELOPING → STRONG → MASTERED.
- Support MASTERED → AT RISK → RELEARNING when retention declines.

### Phase 16 — Learner confidence and stability
- Separate single-answer correctness from consistent performance.
- Track performance stability across sessions.

### Phase 17 — Weakness detection
- Identify weak characters, weak skills, slow items, and repeated errors.
- Build a learner weakness map.

### Phase 18 — Strength detection
- Identify mastered skills and reduce unnecessary repetition.
- Use strengths to unlock appropriate new material and higher-speed practice.

### Phase 19 — Adaptive session generator
- Generate each practice session from the learner's current state.
- Balance weak skills, medium skills, retention, and new material.
- Make session length configurable.

## Retention and daily learning

### Phase 20 — Spaced review scheduler
- Schedule reviews based on performance.
- Increase intervals after easy success.
- Shorten intervals after difficulty or failure.

### Phase 21 — Daily review queue
- Surface due items automatically.
- Show the learner exactly what needs review today.

### Phase 22 — Long-term retention testing
- Re-test old material after meaningful delays.
- Detect forgotten or at-risk skills.
- Feed retention results back into mastery.

### Phase 23 — Daily learning session
- Warm-up → due reviews → weakness drill → new learning → mixed retrieval → challenge.
- Provide a recommended 5–10 minute path without requiring the learner to plan it.

## Words, sentences, and fluency

### Phase 24 — Character groups
- Introduce structured groups and mixed-character drills.
- Transition away from isolated characters.

### Phase 25 — Word learning
- Short words first.
- Common/frequency-based words later.
- Audio word recognition and reproduction.

### Phase 26 — Sentence learning
- Short phrases.
- Structured sentences.
- Random sentences.
- Progressive difficulty and length.

### Phase 27 — Reception training
- Continuous audio streams.
- Random groups.
- Words.
- Sentences.
- Timed copy tests.

### Phase 28 — Head-copy training
- Reduce dependence on visual transcription.
- Introduce direct audio-to-meaning exercises.
- Gradually increase phrase length and speed.

### Phase 29 — Speed progression
- Establish WPM progression.
- Track current and best speed.
- Unlock higher speeds through demonstrated accuracy and stability.

## Realistic and advanced Morse

### Phase 30 — Noise and signal simulation
- Clean tone first.
- Add background noise, fading, volume variation, and frequency variation.
- Allow controlled difficulty settings.

### Phase 31 — Operational Morse
- Prosigns.
- Common operational signals.
- QSO-style structures.
- Call signs and realistic message formats.

### Phase 32 — Scenario training
- Emergency scenarios.
- Radio communication scenarios.
- Navigation/technical scenarios.
- Short simulated exchanges.

### Phase 33 — Advanced challenge system
- 30/60-second decode.
- Speed challenges.
- Accuracy challenges.
- Weak-character challenges.
- Word blitz.
- Random character storms.

## Learner experience

### Phase 34 — Learner dashboard
- Overall mastery.
- Current WPM and best WPM.
- Recognition, reception, sending, retention, and speed breakdown.
- Character mastery map.
- Recommended next action.

### Phase 35 — Onboarding
- Explain Morse quickly.
- First listening interaction.
- First dot/dash interaction.
- First successful character.
- First guided session.

### Phase 36 — Progress and achievements
- Meaningful milestones.
- Personal records.
- Streaks and lightweight gamification.
- Avoid vanity metrics becoming the primary learning signal.

### Phase 37 — Mobile and responsive experience
- Phone, tablet, and desktop layouts.
- Touch-friendly controls.
- Responsive practice and audio interfaces.

### Phase 38 — Accessibility
- Keyboard accessibility.
- Focus states.
- ARIA semantics.
- Reduced motion.
- Contrast and readable typography.
- Visual alternatives for sound-dependent information where appropriate.

## Data, architecture, and analytics

### Phase 39 — Progress architecture and migration
- Version persisted progress.
- Migrate existing `tapmind.progress.v1` safely.
- Preserve existing learner progress.
- Support reset/export/import where appropriate.

### Phase 40 — Reusable learning engine boundary
- Separate generic curriculum, lesson, skill, exercise, attempt, mastery, review, session, and progress concepts from Morse content.
- Keep Morse as the first subject module.
- Avoid future Python-specific assumptions in the core engine.

### Phase 41 — Learning analytics
- Measure session behavior and learning outcomes separately.
- Track mastery improvement, WPM improvement, retention, accuracy, weak characters, and common confusions.

### Phase 42 — Experimentation foundation
- Make curriculum, practice allocation, and exercise strategies configurable.
- Prepare for future learning experiments without rewriting the engine.

## Quality and production readiness

### Phase 43 — Automated testing
- Unit tests for Morse conversion, timing, mastery, scheduling, and assessment generation.
- Integration tests for progression and persistence.
- End-to-end tests for onboarding and complete learner flows.

### Phase 44 — Performance and reliability
- Optimize audio latency and rendering.
- Prevent unnecessary UI rerenders.
- Test long sessions and larger exercise sets.

### Phase 45 — Security and observability
- Maintain security headers.
- Audit client-side data handling and dependencies.
- Add production error visibility and useful diagnostics.

### Phase 46 — Final QA, release candidate, and production merge
- Test the complete learner journey from zero to advanced practice.
- Test desktop/mobile/browser/input/audio combinations.
- Validate data migration and reset behavior.
- Validate learning progression and adaptive behavior.
- Complete UX polish.
- Freeze the branch as release candidate.
- Merge `upgrade/morse-master-product` into `main` only after all acceptance criteria pass.
- Treat the resulting `main` commit as the single production release for this roadmap.

# Explicitly out of scope for this deployment

The following are intentionally deferred until Morse proves the learning engine:

- Python learning module
- AI tutor/chatbot
- Social network/community
- Marketplace
- Payments
- Public leaderboard
- Native mobile applications
- Large SaaS administration system

# Release acceptance criteria

The upgrade is not ready to merge until:

- A zero-knowledge learner can complete onboarding and understand the first Morse concepts.
- The full alphabet is learnable through a progressive curriculum.
- Numbers and core punctuation are supported.
- Morse can be generated as correctly timed audio.
- Learners can practice both recognition and sending.
- Audio reception is a first-class learning mode.
- WPM and spacing are configurable.
- Learner mastery is multi-dimensional.
- Weaknesses influence exercise selection.
- Reviews are scheduled based on learner performance.
- The home experience recommends what to do next.
- Words and sentences can be practiced.
- Speed/reception tests provide meaningful metrics.
- Progress survives reload and is safely migrated from the existing schema.
- Existing Gen-1 functionality remains intact unless deliberately superseded.
- Automated tests cover critical learning logic.
- The production build passes.
- The complete learner flow has been manually verified.
- No production deployment is made before final merge to `main`.

# Long-term architecture principle

Morse is Subject Module #1. The learning engine created during this roadmap must be reusable for future Tapmind subjects such as Python without requiring a fundamental rewrite.
