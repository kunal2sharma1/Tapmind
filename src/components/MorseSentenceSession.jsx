import { useMemo, useState } from "react";
import useMorseAudio from "../hooks/useMorseAudio";
import useMorseInput from "../hooks/useMorseInput";
import {
  createSentenceExercise,
  MORSE_SENTENCE_MODES,
  scoreSentenceResponse,
} from "../modules/morse/sentenceExercises";
import { getSentences } from "../modules/morse/sentences";
import "./MorseSentenceSession.css";

const SESSION_LENGTH = 5;

const MODES = [
  MORSE_SENTENCE_MODES.RECOGNITION,
  MORSE_SENTENCE_MODES.AUDIO_RECOGNITION,
  MORSE_SENTENCE_MODES.RECALL,
  MORSE_SENTENCE_MODES.AUDIO_RECALL,
];

export default function MorseSentenceSession({
  sentenceMastery = {},
  maxDifficulty = 1,
  onAttempt,
}) {
  const { inputSequence, isPressed, events, handlePointerDown, handlePointerUp, handlePointerCancel, resetInput } = useMorseInput();
  const { isPlaying, play, stop } = useMorseAudio();
  const [step, setStep] = useState(0);
  const [modeIndex, setModeIndex] = useState(0);
  const [selectedText, setSelectedText] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const pool = useMemo(() => getSentences({ maxDifficulty }), [maxDifficulty]);
  const target = useMemo(() => {
    if (!pool.length) return null;
    return pool[step % pool.length];
  }, [pool, step]);

  const mode = MODES[modeIndex % MODES.length];
  const exercise = useMemo(() => target
    ? createSentenceExercise({
        mode,
        target,
        sentenceMastery,
        seed: step + target.id.length,
      })
    : null, [mode, target, sentenceMastery, step]);

  const latestEvent = events.at(-1);
  const needsInput = mode === MORSE_SENTENCE_MODES.RECALL || mode === MORSE_SENTENCE_MODES.AUDIO_RECALL;
  const isChoice = mode === MORSE_SENTENCE_MODES.RECOGNITION || mode === MORSE_SENTENCE_MODES.AUDIO_RECOGNITION;

  function begin() {
    setStarted(true);
    setCompleted(false);
    setStep(0);
    setModeIndex(0);
    setSelectedText("");
    setFeedback(null);
    setScore(0);
    resetInput();
  }

  function submit(response) {
    if (!exercise || feedback || completed) return;
    const result = scoreSentenceResponse(exercise, response);
    setFeedback(result.correct ? "correct" : "wrong");
    if (result.correct) setScore((value) => value + 1);
    onAttempt?.(exercise, result, {
      responseMs: latestEvent?.durationMs ?? null,
      timingQuality: latestEvent?.timingQuality?.score ?? null,
    });
  }

  function next() {
    if (step + 1 >= SESSION_LENGTH) {
      setCompleted(true);
      stop();
      return;
    }
    setStep((value) => value + 1);
    setModeIndex((value) => value + 1);
    setSelectedText("");
    setFeedback(null);
    resetInput();
    stop();
  }

  if (!started) {
    return (
      <section className="morse-sentence-session card">
        <p className="card-label">Sentence training</p>
        <h3>Turn Morse into meaning</h3>
        <p>Five progressive message exercises using recognition, listening and reproduction.</p>
        <button type="button" className="ctrl-btn btn-next" onClick={begin}>Start Sentence Session →</button>
      </section>
    );
  }

  if (completed) {
    return (
      <section className="morse-sentence-session card">
        <p className="card-label">Sentence session complete</p>
        <div className="morse-session-score">{score} / {SESSION_LENGTH}</div>
        <p>{score === SESSION_LENGTH ? "Excellent message comprehension." : "Good work. Continue building fluency."}</p>
        <button type="button" className="ctrl-btn btn-next" onClick={begin}>Practice Again →</button>
      </section>
    );
  }

  if (!exercise) return null;

  return (
    <section className="morse-sentence-session card">
      <div className="morse-session-header">
        <div>
          <p className="card-label">{mode.replaceAll("-", " ")}</p>
          <h3>Message {step + 1} / {SESSION_LENGTH}</h3>
        </div>
        <span className="morse-session-score-badge">{score} correct</span>
      </div>

      {mode === MORSE_SENTENCE_MODES.RECOGNITION && (
        <>
          <div className="sentence-morse-prompt">{target.morse}</div>
          <p>Which message does this represent?</p>
        </>
      )}

      {mode === MORSE_SENTENCE_MODES.AUDIO_RECOGNITION && (
        <>
          <p>Listen to the complete message before choosing an answer.</p>
          <button type="button" className="ctrl-btn btn-next" onClick={() => play(target.morse)} disabled={isPlaying}>
            {isPlaying ? "Playing…" : "▶ Play Message"}
          </button>
        </>
      )}

      {mode === MORSE_SENTENCE_MODES.RECALL && (
        <>
          <div className="sentence-text-prompt">{target.text}</div>
          <p>Reproduce the complete Morse message.</p>
        </>
      )}

      {mode === MORSE_SENTENCE_MODES.AUDIO_RECALL && (
        <>
          <p>Listen to the message, then reproduce it in Morse.</p>
          <button type="button" className="ctrl-btn btn-next" onClick={() => play(target.morse)} disabled={isPlaying}>
            {isPlaying ? "Playing…" : "▶ Hear Message"}
          </button>
        </>
      )}

      {isChoice && (
        <div className="sentence-choice-grid">
          {exercise.choices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              className="sentence-choice"
              disabled={Boolean(feedback)}
              onClick={() => {
                setSelectedText(choice.text);
                submit({ text: choice.text });
              }}
            >
              {choice.text}
            </button>
          ))}
        </div>
      )}

      {needsInput && (
        <>
          <div className="morse-session-input">{inputSequence || "Tap or hold to send Morse"}</div>
          <button
            type="button"
            className={`morse-input-pad ${isPressed ? "is-pressed" : ""}`}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onPointerLeave={handlePointerCancel}
            aria-label="Sentence Morse input pad"
          >
            <span>{isPressed ? "RELEASE" : "PRESS & HOLD"}</span>
            <small>{latestEvent ? `${latestEvent.symbol === "." ? "DIT" : "DAH"} · ${Math.round(latestEvent.durationMs)} ms` : "Keyboard or touch"}</small>
          </button>
          <button type="button" className="ctrl-btn btn-check" disabled={!inputSequence || Boolean(feedback)} onClick={() => submit({ morse: inputSequence })}>
            Check Message
          </button>
        </>
      )}

      {feedback && (
        <div className={`morse-answer-feedback ${feedback}`} role="status">
          <strong>{feedback === "correct" ? "Correct message" : "Not quite"}</strong>
          {feedback === "wrong" && <span>Expected: {target.text}</span>}
          {mode === MORSE_SENTENCE_MODES.RECALL || mode === MORSE_SENTENCE_MODES.AUDIO_RECALL ? (
            <span>Expected Morse: {target.morse}</span>
          ) : null}
        </div>
      )}

      {feedback && (
        <button type="button" className="ctrl-btn btn-next" onClick={next}>
          {step + 1 >= SESSION_LENGTH ? "Finish Session" : "Next Message →"}
        </button>
      )}
    </section>
  );
}
