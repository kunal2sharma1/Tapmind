import { useMemo, useState } from "react";
import useMorseAudio from "../hooks/useMorseAudio";
import useMorseInput from "../hooks/useMorseInput";
import {
  MORSE_LEARNING_MODES,
  scoreLearningResponse,
} from "../modules/morse/learningModes";
import { generateExercise } from "../modules/morse/exerciseGenerator";
import "./MorseLearningSession.css";

const SESSION_LENGTH = 5;
const MIXED_MODES = [
  MORSE_LEARNING_MODES.RECOGNITION,
  MORSE_LEARNING_MODES.RECALL,
  MORSE_LEARNING_MODES.AUDIO_RECOGNITION,
  MORSE_LEARNING_MODES.AUDIO_RECALL,
  MORSE_LEARNING_MODES.SENDING,
];

function normalizeCandidate(character) {
  return {
    id: character?.id ?? `legacy-${character?.letter ?? "unknown"}`,
    symbol: character?.letter ?? character?.symbol ?? "",
    morse: character?.morse ?? "",
    category: character?.category ?? "letter",
  };
}

function buildChoices(exercise) {
  return exercise.choices || [];
}

export default function MorseLearningSession({
  mode,
  currentCharacter,
  currentLevel,
  availableCharacters = [],
  characterMastery = {},
  recordAttempt,
}) {
  const { inputSequence, isPressed, events, handlePointerDown, handlePointerUp, handlePointerCancel, resetInput } = useMorseInput();
  const { isPlaying, play, stop } = useMorseAudio();
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [reveal, setReveal] = useState(false);

  const curriculumTarget = useMemo(() => normalizeCandidate(currentCharacter), [currentCharacter]);
  const candidates = useMemo(() => {
    const normalized = availableCharacters.map(normalizeCandidate).filter((item) => item.symbol && item.morse);
    const unique = new Map(normalized.map((item) => [item.id, item]));
    unique.set(curriculumTarget.id, curriculumTarget);
    return [...unique.values()];
  }, [availableCharacters, curriculumTarget]);

  const exerciseMode = useMemo(() => {
    if (mode !== MORSE_LEARNING_MODES.MIXED) return mode;
    return MIXED_MODES[step % MIXED_MODES.length];
  }, [mode, step]);

  const exercise = useMemo(() => {
    try {
      const generated = generateExercise({
        mode: exerciseMode,
        category: "letters",
        difficulty: "standard",
        target: step === 0 ? curriculumTarget : null,
        candidates,
        context: {
          characterMastery,
          now: Date.now(),
        },
        seed: step + curriculumTarget.symbol.charCodeAt(0),
        distractorCount: 3,
        source: "adaptive-session-generator",
      });
      return generated;
    } catch {
      return generateExercise({
        mode: exerciseMode,
        target: curriculumTarget,
        category: "letters",
        seed: curriculumTarget.symbol.charCodeAt(0),
        source: "curriculum-fallback",
      });
    }
  }, [exerciseMode, curriculumTarget, candidates, characterMastery, step]);

  const target = exercise.target;
  const choices = useMemo(() => buildChoices(exercise), [exercise]);
  const latestEvent = events.at(-1);

  function begin() {
    setStarted(true);
    setCompleted(false);
    setStep(0);
    setScore(0);
    setFeedback(null);
    setSelectedSymbol("");
    setReveal(false);
    resetInput();
  }

  function submit(response) {
    if (feedback || !started || completed) return;
    const result = scoreLearningResponse(exercise, response);
    setFeedback(result.correct ? "correct" : "wrong");
    setReveal(true);
    if (result.correct) setScore((value) => value + 1);

    recordAttempt(target, result.correct, exercise, {
      responseMs: latestEvent?.durationMs ?? null,
      timingQuality: latestEvent?.timingQuality?.score ?? null,
      confidence: result.correct ? 90 : 35,
    });
  }

  function submitChoice(symbol) {
    setSelectedSymbol(symbol);
    submit({ symbol });
  }

  function submitMorse() {
    if (!inputSequence) return;
    submit({ morse: inputSequence });
  }

  function next() {
    if (step + 1 >= SESSION_LENGTH) {
      setCompleted(true);
      stop();
      return;
    }

    setStep((value) => value + 1);
    setFeedback(null);
    setSelectedSymbol("");
    setReveal(false);
    resetInput();
    stop();
  }

  function restart() {
    setCompleted(false);
    setStarted(false);
    setStep(0);
    setScore(0);
    setFeedback(null);
    setSelectedSymbol("");
    setReveal(false);
    resetInput();
    stop();
  }

  const needsInput = [
    MORSE_LEARNING_MODES.RECALL,
    MORSE_LEARNING_MODES.AUDIO_RECALL,
    MORSE_LEARNING_MODES.SENDING,
  ].includes(exerciseMode);
  const isChoiceMode = [
    MORSE_LEARNING_MODES.RECOGNITION,
    MORSE_LEARNING_MODES.AUDIO_RECOGNITION,
  ].includes(exerciseMode);

  if (!started) {
    return (
      <section className="morse-session card">
        <p className="card-label">Adaptive training session</p>
        <h3>Practice what needs the most work</h3>
        <p className="morse-session-intro">
          Tapmind uses your character mastery profile to prioritize the skills and characters that need attention, while respecting the curriculum boundary.
        </p>
        <button type="button" className="ctrl-btn btn-next" onClick={begin}>
          Start {mode === MORSE_LEARNING_MODES.MIXED ? "Adaptive Mixed" : "Adaptive Session"} →
        </button>
      </section>
    );
  }

  if (completed) {
    return (
      <section className="morse-session card">
        <p className="card-label">Session complete</p>
        <div className="morse-session-score">{score} / {SESSION_LENGTH}</div>
        <p className="morse-session-feedback">
          {score === SESSION_LENGTH ? "Excellent consistency." : "Good practice. Your mastery profile has been updated and will shape the next session."}
        </p>
        <button type="button" className="ctrl-btn btn-next" onClick={restart}>
          Choose Another Session →
        </button>
        <button type="button" className="ctrl-btn btn-retry" onClick={begin}>
          Practice Again
        </button>
      </section>
    );
  }

  return (
    <section className="morse-session card">
      <div className="morse-session-header">
        <div>
          <p className="card-label">{exerciseMode.replaceAll("-", " ")}</p>
          <h3>Exercise {step + 1} / {SESSION_LENGTH}</h3>
        </div>
        <span className="morse-session-score-badge">{score} correct</span>
      </div>

      {isChoiceMode && (
        <div className="morse-choice-content">
          {exerciseMode === MORSE_LEARNING_MODES.AUDIO_RECOGNITION ? (
            <div className="morse-audio-prompt">
              <strong>Listen, then identify the character.</strong>
              <button type="button" className="ctrl-btn btn-next" onClick={() => play(target.morse)} disabled={isPlaying}>
                {isPlaying ? "Playing…" : "▶ Play Morse"}
              </button>
            </div>
          ) : (
            <div className="morse-visible-prompt">
              <span className="instruction-morse">{target.morse}</span>
              <p>Which character does this pattern represent?</p>
            </div>
          )}

          <div className="morse-choice-grid">
            {choices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                className={`morse-choice ${selectedSymbol === choice.symbol ? "is-selected" : ""}`}
                disabled={Boolean(feedback)}
                onClick={() => submitChoice(choice.symbol)}
              >
                {choice.symbol}
              </button>
            ))}
          </div>
        </div>
      )}

      {exerciseMode === MORSE_LEARNING_MODES.RECALL && (
        <div className="morse-recall-content">
          <div className="instruction-letter">{target.symbol}</div>
          <p>Send this character in Morse.</p>
        </div>
      )}

      {exerciseMode === MORSE_LEARNING_MODES.AUDIO_RECALL && (
        <div className="morse-recall-content">
          <p>Listen to the target, then reproduce its Morse pattern.</p>
          <button type="button" className="ctrl-btn btn-next" onClick={() => play(target.morse)} disabled={isPlaying}>
            {isPlaying ? "Playing…" : "▶ Hear Character"}
          </button>
        </div>
      )}

      {exerciseMode === MORSE_LEARNING_MODES.SENDING && (
        <div className="morse-recall-content">
          <div className="instruction-letter">{target.symbol}</div>
          <p>Send it with deliberate timing.</p>
        </div>
      )}

      {needsInput && (
        <>
          <div className="morse-session-input">
            {inputSequence ? inputSequence : "Tap or hold to send Morse"}
          </div>
          <button
            type="button"
            className={`morse-input-pad ${isPressed ? "is-pressed" : ""}`}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onPointerLeave={handlePointerCancel}
            aria-label="Morse input pad"
          >
            <span>{isPressed ? "RELEASE" : "PRESS & HOLD"}</span>
            <small>{latestEvent ? `${latestEvent.symbol === "." ? "DIT" : "DAH"} · ${Math.round(latestEvent.durationMs)} ms` : "Keyboard or touch"}</small>
          </button>
          <button type="button" className="ctrl-btn btn-check" disabled={!inputSequence || Boolean(feedback)} onClick={submitMorse}>
            Check Answer
          </button>
        </>
      )}

      {feedback && (
        <div className={`morse-answer-feedback ${feedback}`} role="status">
          <strong>{feedback === "correct" ? "Correct" : "Not quite"}</strong>
          {reveal && <span>Expected: {target.symbol} = {target.morse}</span>}
          {exerciseMode === MORSE_LEARNING_MODES.SENDING && latestEvent?.timingQuality && (
            <span>Timing quality: {latestEvent.timingQuality.score}/100</span>
          )}
        </div>
      )}

      {feedback && (
        <button type="button" className="ctrl-btn btn-next" onClick={next}>
          {step + 1 >= SESSION_LENGTH ? "Finish Session" : "Next Exercise →"}
        </button>
      )}
    </section>
  );
}
