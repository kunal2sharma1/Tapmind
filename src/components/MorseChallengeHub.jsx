import { useMemo, useState } from "react";
import { buildChallengeSession, CHALLENGE_TYPES, scoreChallenge } from "../modules/morse/challenges";
import "./MorseChallengeHub.css";

function labelType(type) {
  return {
    [CHALLENGE_TYPES.SPEED]: "Speed",
    [CHALLENGE_TYPES.ACCURACY]: "Accuracy",
    [CHALLENGE_TYPES.STREAK]: "Streak",
    [CHALLENGE_TYPES.RECEPTION]: "Reception",
    [CHALLENGE_TYPES.REALISM]: "Realism",
    [CHALLENGE_TYPES.MIXED]: "Mixed",
  }[type] ?? "Challenge";
}

export default function MorseChallengeHub({ context = {}, progress, onResult }) {
  const [seed, setSeed] = useState(1);
  const [activeIndex, setActiveIndex] = useState(null);
  const [accuracy, setAccuracy] = useState(100);
  const [effectiveWpm, setEffectiveWpm] = useState(10);
  const [streak, setStreak] = useState(0);
  const session = useMemo(() => buildChallengeSession({ count: 3, seed, context }), [seed, context]);

  function finishChallenge(challenge) {
    const result = scoreChallenge({
      challenge,
      accuracy,
      effectiveWpm,
      streak,
      elapsedMs: challenge.durationSeconds * 1000 - 1,
      completed: true,
    });
    onResult?.(challenge, result);
    setActiveIndex(null);
    setSeed((value) => value + 1);
  }

  return (
    <section className="morse-challenges card">
      <div className="challenge-header">
        <div>
          <p className="card-label">Challenge system</p>
          <h2>Prove your Morse</h2>
        </div>
        <div className="challenge-records">
          <span>Wins {progress?.wins ?? 0}</span>
          <span>Streak {progress?.currentStreak ?? 0}</span>
          <span>Best {progress?.bestScore ?? 0}</span>
        </div>
      </div>

      <div className="challenge-list">
        {session.map((challenge, index) => (
          <article key={challenge.id} className="challenge-item">
            <div>
              <span className="challenge-type">{labelType(challenge.type)}</span>
              <h3>{challenge.title}</h3>
              <p>{challenge.minAccuracy}% minimum accuracy · {challenge.durationSeconds}s</p>
              {challenge.modifiers.length > 0 && <small>{challenge.modifiers.join(" · ")}</small>}
            </div>
            {activeIndex === index ? (
              <div className="challenge-active">
                <label>Accuracy {accuracy}% <input type="range" min="0" max="100" value={accuracy} onChange={(e) => setAccuracy(Number(e.target.value))} /></label>
                <label>Effective WPM {effectiveWpm} <input type="range" min="1" max="60" value={effectiveWpm} onChange={(e) => setEffectiveWpm(Number(e.target.value))} /></label>
                <label>Streak {streak} <input type="range" min="0" max={challenge.target || 20} value={streak} onChange={(e) => setStreak(Number(e.target.value))} /></label>
                <button type="button" className="ctrl-btn btn-next" onClick={() => finishChallenge(challenge)}>Submit Result</button>
              </div>
            ) : (
              <button type="button" className="ctrl-btn btn-next" onClick={() => setActiveIndex(index)}>Start →</button>
            )}
          </article>
        ))}
      </div>

      <div className="challenge-footer">
        <button type="button" className="ctrl-btn btn-retry" onClick={() => setSeed((value) => value + 1)}>New Challenge Set</button>
      </div>
    </section>
  );
}
