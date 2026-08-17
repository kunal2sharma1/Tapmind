import { useMemo, useState } from "react";
import useMorseAudio from "../hooks/useMorseAudio";
import useMorseInput from "../hooks/useMorseInput";
import { generateWordExercise, scoreWordExercise, WORD_EXERCISE_MODES } from "../modules/morse/wordGenerator";
import { encodeWordText } from "../modules/morse/words";
import "./MorseWordSession.css";

const SESSION_LENGTH = 5;

function buildWordChoices(exercise) {
  return exercise.choices.map((choice) => choice.text);
}

export default function MorseWordSession({ wordMastery = {}, onRecordWordAttempt }) {
  const { inputSequence, isPressed, events, handlePointerDown, handlePointerUp, handlePointerCancel, resetInput } = useMorseInput();
  const { isPlaying, play, stop } = useMorseAudio();
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [selectedWord, setSelectedWord] = useState("");

  const exercise = useMemo(() => generateWordExercise({
    mode: WORD_EXERCISE_MODES.MIXED,
    context: { wordMastery },
    seed: step + 41,
    source: "phase-11-session",
  }), [step, wordMastery]);

  const choices = useMemo(() => buildWordChoices(exercise), [exercise]);
  const latestEvent = events.at(-1);

  function begin() {
    setStarted(true);
    setCompleted(false);
    setStep(0);
    setScore(0);
    setFeedback(null);
    setSelectedWord("");
    resetInput();
  }

  function submit(response) {
    if (!started || completed || feedback) return;
    const result = scoreWordExercise(exercise, response);
    setFeedback(result.correct ? "correct" : "wrong");
    if (result.correct) setScore((value) => value + 1);
    onRecordWordAttempt?.(exercise.target, result.correct, {
      responseMs: latestEvent?.durationMs ?? null,
      timingQuality: latestEvent?.timingQuality?.score ?? null,
    });
  }

  function next() {
    stop();
    if (step + 1 >= SESSION_LENGTH) {
      setCompleted(true);
      return;
    }
    setStep((value) => value + 1);
    setFeedback(null);
    setSelectedWord("");
    resetInput();
  }

  function restart() {
    stop();
    setStarted(false);
    setCompleted(false);
    setStep(0);
    setScore(0);
    setFeedback(null);
    setSelectedWord("");
    resetInput();
  }

  const recognitionMode = [
    WORD_EXERCISE_MODES.LISTEN_RECOGNITION,
    WORD_EXERCISE_MODES.MORSE_RECOGNITION,
  ].includes(exercise.mode);

  if (!started) {
    return (
      <section className="morse-word-session card">
        <p className="card-label">Word training</p>
        <h3>Move from characters to real words</h3>
        <p className="morse-word-intro">Decode and reproduce complete Morse words. Five focused exercises build word-level fluency on top of your character skills.</p>
        <button type="button" className="ctrl-btn btn-next" onClick={begin}>Start Word Session →</button>
      </section>
    );
  }

  if (completed) {
    return (
      <section className="morse-word-session card">
        <p className="card-label">Word session complete</p>
        <div className="morse-word-score">{score} / {SESSION_LENGTH}</div>
        <p className="morse-word-feedback">{score === SESSION_LENGTH ? "Excellent word-level accuracy." : "Good work. Keep building automatic word recognition."}</p>
        <button type="button" className="ctrl-btn btn-next" onClick={restart}>Practice Again →</button>
      </section>
    );
  }

  return (
    <section className="morse-word-session card">
      <div className="morse-word-header">
        <div>
          <p className="card-label">{exercise.mode.replaceAll("-", " ")}</p>
          <h3>Word {step + 1} / {SESSION_LENGTH}</h3>
        </div>
        <span className="morse-word-score-badge">{score} correct</span>
      </div>

      {exercise.mode === WORD_EXERCISE_MODES.LISTEN_RECOGNITION && (
        <div className="morse-word-prompt">
          <strong>Listen and identify the word.</strong>
          <button type="button" className="ctrl-btn btn-next" onClick={() => play(encodeWordText(exercise.target.text).replaceAll(" ", ""))} disabled={isPlaying}>
            {isPlaying ? "Playing…" : "▶ Play Word"}
          </button>
        </div>
      )}

      {exercise.mode === WORD_EXERCISE_MODES.MORSE_RECOGNITION && (
        <div className="morse-word-visible-prompt">
          <span className="instruction-morse word-morse">{exercise.target.morse}</span>
          <p>Which word does this Morse sequence represent?</p>
        </div>
      )}

      {recognitionMode && (
        <div className="morse-word-choice-grid">
          {choices.map((choice) => (
            <button key={choice} type="button" className={`morse-word-choice ${selectedWord === choice ? "is-selected" : ""}`} disabled={Boolean(feedback)} onClick={() => { setSelectedWord(choice); submit({ text: choice }); }}>
              {choice}
            </button>
          ))}
        </div>
      )}

      {exercise.mode === WORD_EXERCISE_MODES.WORD_RECALL && (
        <div className="morse-word-prompt">
          <div className="instruction-letter word-target">{exercise.target.text}</div>
          <p>Send the complete word in Morse.</p>
        </div>
      )}

      {exercise.mode === WORD_EXERCISE_MODES.MORSE_RECALL && (
        <div className="morse-word-prompt">
          <div className="instruction-letter word-target">{exercise.target.text}</div>
          <p>Reproduce the full Morse sequence.</p>
        </div>
      )}

      {[WORD_EXERCISE_MODES.WORD_RECALL, WORD_EXERCISE_MODES.MORSE_RECALL].includes(exercise.mode) && (
        <>
          <div className="morse-session-input">{inputSequence || "Tap or hold to send the word"}</div>
          <button type="button" className={`morse-input-pad ${isPressed ? "is-pressed" : ""}`} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerCancel={handlePointerCancel} onPointerLeave={handlePointerCancel} aria-label="Morse word input pad">
            <span>{isPressed ? "RELEASE" : "PRESS & HOLD"}</span>
            <small>{latestEvent ? `${latestEvent.symbol === "." ? "DIT" : "DAH"} · ${Math.round(latestEvent.durationMs)} ms` : "Keyboard or touch"}</small>
          </button>
          <button type="button" className="ctrl-btn btn-check" disabled={!inputSequence || Boolean(feedback)} onClick={() => submit({ morse: inputSequence })}>Check Word</button>
        </>
      )}

      {feedback && (
        <div className={`morse-answer-feedback ${feedback}`} role="status">
          <strong>{feedback === "correct" ? "Correct" : "Not quite"}</strong>
          <span>Expected: {exercise.target.text}</span>
          {latestEvent?.timingQuality && <span>Timing quality: {latestEvent.timingQuality.score}/100</span>}
        </div>
      )}

      {feedback && <button type="button" className="ctrl-btn btn-next" onClick={next}>{step + 1 >= SESSION_LENGTH ? "Finish Session" : "Next Word →"}</button>}
    </section>
  );
}
