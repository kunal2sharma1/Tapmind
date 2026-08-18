import { useMemo, useState } from "react";
import useMorseAudio from "../hooks/useMorseAudio";
import { buildSpeedSession } from "../modules/morse/speedSession";
import { applySpeedAttempt, evaluateSpeedAttempt, getSpeedTierLabel, normalizeSpeedProfile, SPEED_DEFAULTS } from "../modules/morse/speedEngine";
import "./MorseSpeedSession.css";

export default function MorseSpeedSession({ characters = [], profile = {}, onComplete }) {
  const initial = normalizeSpeedProfile(profile);
  const [characterWpm, setCharacterWpm] = useState(initial.characterWpm);
  const [effectiveWpm, setEffectiveWpm] = useState(Math.min(initial.effectiveWpm, initial.characterWpm));
  const [startedAt, setStartedAt] = useState(null);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [responseTimes, setResponseTimes] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const { isPlaying, play } = useMorseAudio();

  const session = useMemo(() => buildSpeedSession({
    characters,
    characterWpm,
    effectiveWpm,
    durationSeconds: SPEED_DEFAULTS.sessionSeconds,
    seed: characterWpm * 100 + effectiveWpm,
  }), [characters, characterWpm, effectiveWpm]);

  const current = session.exercises[index];

  function start() {
    setStartedAt(performance.now());
    setIndex(0);
    setCorrect(0);
    setAttempted(0);
    setResponseTimes([]);
    setResult(null);
    setCompleted(false);
  }

  function submit(symbol) {
    if (!startedAt || completed) return;
    const elapsed = performance.now() - startedAt;
    const responseMs = index === 0 ? elapsed : elapsed - responseTimes.reduce((a, b) => a + b, 0);
    const target = current?.character?.symbol ?? current?.target?.symbol;
    const nextCorrect = correct + (symbol === target ? 1 : 0);
    const nextAttempted = attempted + 1;
    const nextTimes = [...responseTimes, responseMs];
    setCorrect(nextCorrect);
    setAttempted(nextAttempted);
    setResponseTimes(nextTimes);

    if (index + 1 >= session.exercises.length) {
      const elapsedTotal = performance.now() - startedAt;
      const evaluated = evaluateSpeedAttempt({
        correct: nextCorrect,
        attempted: nextAttempted,
        elapsedMs: elapsedTotal,
        targetEffectiveWpm: effectiveWpm,
        responseTimes: nextTimes,
      });
      const updated = applySpeedAttempt(initial, evaluated);
      setResult({ ...evaluated, profile: updated });
      setCompleted(true);
      onComplete?.(updated, evaluated);
      return;
    }

    setIndex((value) => value + 1);
    play(session.exercises[index + 1]?.character?.morse ?? session.exercises[index + 1]?.target?.morse ?? "");
  }

  if (!startedAt) {
    return (
      <section className="speed-session card">
        <p className="card-label">Speed training</p>
        <h3>{characterWpm} WPM character speed · {effectiveWpm} WPM effective</h3>
        <p>Train recognition speed without changing the character's actual Morse rhythm.</p>
        <div className="speed-controls">
          <label>Character WPM <input type="range" min="5" max="60" step="1" value={characterWpm} onChange={(e) => { const value = Number(e.target.value); setCharacterWpm(value); setEffectiveWpm((currentValue) => Math.min(currentValue, value)); }} /></label>
          <label>Effective WPM <input type="range" min="5" max={characterWpm} step="1" value={effectiveWpm} onChange={(e) => setEffectiveWpm(Number(e.target.value))} /></label>
        </div>
        <p className="speed-tier">{getSpeedTierLabel(characterWpm)}</p>
        <button type="button" className="ctrl-btn btn-next" onClick={() => { start(); play(session.exercises[0]?.character?.morse ?? session.exercises[0]?.target?.morse ?? ""); }}>Start {SPEED_DEFAULTS.sessionSeconds}s Speed Test →</button>
      </section>
    );
  }

  if (completed && result) {
    return (
      <section className="speed-session card">
        <p className="card-label">Speed result</p>
        <div className="speed-result-grid">
          <strong>{result.accuracy}% accuracy</strong>
          <strong>{result.measuredEffectiveWpm} WPM measured</strong>
        </div>
        <p>{result.passed ? "Speed gate passed. Your next target has been advanced." : "Gate not passed yet. Repeat this speed to stabilize accuracy."}</p>
        <button type="button" className="ctrl-btn btn-next" onClick={() => setStartedAt(null)}>Try Again →</button>
      </section>
    );
  }

  return (
    <section className="speed-session card">
      <div className="speed-session-header"><span className="card-label">Timed reception</span><span>{attempted + 1} / {session.targetCharacters}</span></div>
      <p>Listen and identify the character as quickly and accurately as possible.</p>
      <button type="button" className="ctrl-btn btn-next" onClick={() => play(current?.character?.morse ?? current?.target?.morse ?? "")} disabled={isPlaying}>{isPlaying ? "Playing…" : "▶ Replay"}</button>
      <div className="speed-choice-grid">
        {(current?.choices ?? []).map((choice) => <button key={choice.id} type="button" className="speed-choice" onClick={() => submit(choice.symbol)}>{choice.symbol}</button>)}
      </div>
    </section>
  );
}
