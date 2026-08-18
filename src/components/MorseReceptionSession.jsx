import { useMemo, useState } from "react";
import useMorseReceptionAudio from "../hooks/useMorseReceptionAudio";
import useReceptionProgress from "../hooks/useReceptionProgress";
import { buildReceptionSession, RECEPTION_DIFFICULTIES, scoreReceptionCopy } from "../modules/morse/reception";
import { REALISM_LEVELS, calculateSignalQuality } from "../modules/morse/realisticMorse";
import "./MorseReceptionSession.css";

const SESSION_LENGTH = 5;

function formatTime(ms) {
  return `${(ms / 1000).toFixed(1)}s`;
}

const REALISM_LABELS = Object.freeze({
  [REALISM_LEVELS.CLEAN]: "Clean signal",
  [REALISM_LEVELS.LIGHT]: "Light conditions",
  [REALISM_LEVELS.MODERATE]: "Moderate noise",
  [REALISM_LEVELS.DIFFICULT]: "Difficult band",
  [REALISM_LEVELS.FIELD]: "Field conditions",
});

export default function MorseReceptionSession({ maxDifficulty = RECEPTION_DIFFICULTIES.ADVANCED }) {
  const [wpm, setWpm] = useState(10);
  const [realismLevel, setRealismLevel] = useState(REALISM_LEVELS.CLEAN);
  const [playStartedAt, setPlayStartedAt] = useState(null);
  const [step, setStep] = useState(0);
  const [copy, setCopy] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState([]);
  const { isPlaying, playMessage, stop, updateSetting } = useMorseReceptionAudio();
  const { profile, recordAttempt, recordSessionComplete } = useReceptionProgress();

  const session = useMemo(
    () => buildReceptionSession({ count: SESSION_LENGTH, maxDifficulty, seed: 17, wpm, characterWpm: wpm }),
    [maxDifficulty, wpm],
  );

  const message = session.messages[step];
  const progressText = `${step + 1} / ${SESSION_LENGTH}`;
  const signalQuality = calculateSignalQuality(realismLevel);
  const isSetup = playStartedAt === null && !completed && step === 0 && results.length === 0 && copy === "" && !feedback;

  function begin() {
    setPlayStartedAt(null);
    setStep(0);
    setCopy("");
    setFeedback(null);
    setCompleted(false);
    setResults([]);
    updateSetting("wpm", wpm);
    updateSetting("characterWpm", wpm);
    updateSetting("realismLevel", realismLevel);
    stop();
  }

  async function play() {
    if (playStartedAt === null) setPlayStartedAt(performance.now());
    await playMessage(message.encoded.morse, {
      wpm,
      characterWpm: wpm,
      realismLevel,
      seed: 17 + step,
    });
  }

  function submit() {
    if (playStartedAt === null || feedback) return;
    const elapsedMs = performance.now() - playStartedAt;
    const result = { ...scoreReceptionCopy(message.text, copy, elapsedMs), signalQuality, realismLevel };
    setFeedback(result);
    setResults((previous) => [...previous, result]);
    recordAttempt(result);
  }

  function next() {
    if (step + 1 >= SESSION_LENGTH) {
      setCompleted(true);
      recordSessionComplete();
      stop();
      return;
    }
    setStep((value) => value + 1);
    setPlayStartedAt(null);
    setCopy("");
    setFeedback(null);
    stop();
  }

  function restart() {
    setPlayStartedAt(null);
    setCompleted(false);
    setStep(0);
    setCopy("");
    setFeedback(null);
    setResults([]);
    stop();
  }

  if (!message) return null;

  if (isSetup) {
    return (
      <section className="morse-reception card">
        <p className="card-label">Reception training</p>
        <h2>Copy continuous Morse</h2>
        <p className="morse-reception-intro">
          Start clean, then progressively add signal degradation. The Morse content and target WPM stay unchanged while the signal becomes harder to copy.
        </p>
        <label className="reception-setting">
          <span>Target speed: {wpm} WPM</span>
          <input type="range" min="5" max="40" step="1" value={wpm} onChange={(event) => setWpm(Number(event.target.value))} />
        </label>
        <label className="reception-setting">
          <span>Signal conditions: {REALISM_LABELS[realismLevel]}</span>
          <select value={realismLevel} onChange={(event) => setRealismLevel(event.target.value)}>
            {Object.values(REALISM_LEVELS).map((level) => <option key={level} value={level}>{REALISM_LABELS[level]}</option>)}
          </select>
        </label>
        <div className="reception-signal-quality">Signal quality model: <strong>{signalQuality}/100</strong></div>
        <div className="reception-profile">
          <span>Best character accuracy: {profile.bestCharacterAccuracy}%</span>
          <span>Best word accuracy: {profile.bestWordAccuracy}%</span>
          <span>Best effective WPM: {profile.bestEffectiveWpm}</span>
        </div>
        <button type="button" className="ctrl-btn btn-next" onClick={begin}>Start Reception Session →</button>
      </section>
    );
  }

  if (completed) {
    const characterAccuracy = results.length ? Math.round(results.reduce((sum, item) => sum + item.characterAccuracy, 0) / results.length) : 0;
    const wordAccuracy = results.length ? Math.round(results.reduce((sum, item) => sum + item.wordAccuracy, 0) / results.length) : 0;
    const effectiveWpm = results.length ? Number((results.reduce((sum, item) => sum + item.effectiveWpm, 0) / results.length).toFixed(1)) : 0;
    const averageSignalQuality = results.length ? Math.round(results.reduce((sum, item) => sum + item.signalQuality, 0) / results.length) : signalQuality;

    return (
      <section className="morse-reception card">
        <p className="card-label">Reception complete</p>
        <div className="reception-metrics">
          <strong>{characterAccuracy}%</strong><span>character accuracy</span>
          <strong>{wordAccuracy}%</strong><span>word accuracy</span>
          <strong>{effectiveWpm}</strong><span>effective WPM</span>
          <strong>{averageSignalQuality}</strong><span>signal quality</span>
        </div>
        <button type="button" className="ctrl-btn btn-next" onClick={restart}>Practice Again →</button>
      </section>
    );
  }

  if (playStartedAt === null) {
    return (
      <section className="morse-reception card">
        <p className="card-label">Reception ready · {REALISM_LABELS[realismLevel]}</p>
        <h2>Message {progressText}</h2>
        <p className="instruction-hint">Press play when you are ready. The copy timer starts with the first playback.</p>
        <button type="button" className="ctrl-btn btn-next" onClick={play} disabled={isPlaying}>{isPlaying ? "Playing…" : "▶ Play Message"}</button>
        <button type="button" className="ctrl-btn btn-retry" onClick={begin}>Reset</button>
      </section>
    );
  }

  return (
    <section className="morse-reception card">
      <div className="morse-reception-header">
        <div>
          <p className="card-label">Continuous reception · {REALISM_LABELS[realismLevel]}</p>
          <h2>Message {progressText}</h2>
        </div>
        <span className="reception-speed-badge">{wpm} WPM</span>
      </div>

      <div className="reception-controls">
        <button type="button" className="ctrl-btn btn-next" onClick={play} disabled={isPlaying}>{isPlaying ? "Playing…" : "▶ Play Message"}</button>
        {isPlaying && <button type="button" className="ctrl-btn btn-retry" onClick={stop}>Stop</button>}
      </div>
      <div className="reception-signal-quality">Signal quality model: <strong>{signalQuality}/100</strong></div>

      <textarea className="reception-copy-box" value={copy} onChange={(event) => setCopy(event.target.value)} placeholder="Type the message you hear…" autoComplete="off" spellCheck="false" disabled={Boolean(feedback)} />
      <div className="reception-meta"><span>Type exactly what you hear</span><span>{copy.length} characters</span></div>

      {!feedback ? (
        <button type="button" className="ctrl-btn btn-check" onClick={submit} disabled={!copy.trim() || playStartedAt === null}>Check Copy</button>
      ) : (
        <>
          <div className={`reception-feedback ${feedback.passed ? "correct" : "wrong"}`} role="status">
            <strong>{feedback.passed ? "Good copy" : "Keep practicing"}</strong>
            <span>Character accuracy: {feedback.characterAccuracy}%</span>
            <span>Word accuracy: {feedback.wordAccuracy}%</span>
            <span>Effective WPM: {feedback.effectiveWpm}</span>
            <span>Signal quality: {feedback.signalQuality}/100</span>
            <span>Time: {formatTime(feedback.elapsedMs)}</span>
            <em>Expected: {feedback.expected}</em>
          </div>
          <button type="button" className="ctrl-btn btn-next" onClick={next}>{step + 1 >= SESSION_LENGTH ? "Finish Session" : "Next Message →"}</button>
        </>
      )}
    </section>
  );
}
