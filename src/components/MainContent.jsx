import { useEffect } from "react";
import useMorseInput from "../hooks/useMorseInput";
import useScoring from "../hooks/useScoring";
import useLearningFlow from "../hooks/useLearningFlow";
import "./MainContent.css";

export default function MainContent({
  selectedLevel,
  activeNav,
  currentLevel,
  currentLesson,
  currentCharacter,
  levels,
  onLevelSelect,
  recordAttempt,
  completeLevel,
}) {
  const {
    inputSequence,
    isPressed,
    activeDevice,
    events,
    timing,
    calibration,
    handlePointerDown,
    handlePointerUp,
    handlePointerCancel,
    resetInput,
    setCalibration,
  } = useMorseInput();

  const {
    totalScore,
    streak,
    attempts,
    accuracy,
    applyCorrect,
    applyWrong,
  } = useScoring();

  const {
    mode,
    practiceCount,
    testIndex,
    testTotal,
    score,
    passed,
    feedback,
    correctAnswer,
    currentQuestion,
    handleCheck,
    handleRetry,
    handleNext,
    handleTryAgain,
    startPractice,
  } = useLearningFlow({
    currentLevel,
    currentLesson,
    levels,
    inputSequence,
    resetInput,
    applyCorrect,
    applyWrong,
    recordAttempt,
    completeLevel,
    onLevelSelect,
  });

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key !== "Enter") return;

      if (mode === "practice" || mode === "test") {
        handleCheck();
      } else if (mode === "result" && passed) {
        handleNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, passed, handleCheck, handleNext]);

  function renderSymbols(sequence) {
    if (!sequence) return null;

    return sequence.split("").map((symbol, index) => (
      <span
        key={index}
        className={`morse-symbol ${symbol === "-" ? "sym-dash" : "sym-dot"}`}
      >
        {symbol}
      </span>
    ));
  }

  function renderFeedback() {
    if (!feedback) return null;

    return (
      <div className={`feedback-line feedback-${feedback}`} role="status">
        {feedback === "correct" && "Correct"}
        {feedback === "wrong" && (
          <>Wrong{correctAnswer ? ` — Correct answer: ${correctAnswer}` : ""}</>
        )}
      </div>
    );
  }

  function renderInstruction() {
    if (mode === "learn") {
      return (
        <section className="card instruction-card">
          <p className="card-label">Learn</p>
          {currentLevel.type === "foundation" ? (
            <>
              <div className="instruction-display">
                <span className="instruction-letter">.</span>
                <span className="instruction-morse">Dot</span>
                <span className="instruction-letter">−</span>
                <span className="instruction-morse">Dash</span>
              </div>
              <p className="instruction-hint">
                Short spacebar press = dot. Longer press = dash.
              </p>
            </>
          ) : currentLevel.type === "review" ? (
            <>
              <div className="instruction-display">
                <span className="instruction-letter">Mixed Review</span>
              </div>
              <p className="instruction-hint">
                Your assessment covers the Morse characters you have learned so far.
              </p>
            </>
          ) : (
            <>
              <div className="instruction-display">
                <span className="instruction-letter">{currentCharacter?.letter}</span>
                <span className="instruction-morse">{currentCharacter?.morse}</span>
              </div>
              <p className="instruction-hint">Memorize this pattern</p>
            </>
          )}
          <div className="controls-section" style={{ marginTop: 16 }}>
            <button className="ctrl-btn btn-next" onClick={startPractice}>
              {currentLesson?.practice.mode === "none" ? "Start Review →" : "Start Practice →"}
            </button>
          </div>
        </section>
      );
    }

    if (mode === "practice") {
      const target = currentLesson?.practice.repeats ?? 3;

      return (
        <section className="card instruction-card">
          <p className="card-label">Practice</p>
          <p className="instruction-hint">
            Send the Morse code ({practiceCount + 1} / {target})
          </p>
          <p className="instruction-hint">
            Use the spacebar, or press and hold the input pad below.
          </p>
        </section>
      );
    }

    if (mode === "test") {
      return (
        <section className="card instruction-card">
          <p className="card-label">Test {testIndex + 1} / {testTotal}</p>
          <span className="instruction-letter">{currentQuestion?.letter}</span>
        </section>
      );
    }

    if (mode === "result") {
      const isAssessment = currentLesson?.assessment.enabled;
      return (
        <section className="card instruction-card">
          <p className="card-label">Result</p>
          {isAssessment ? (
            <div>{score} / {testTotal}</div>
          ) : (
            <div>{practiceCount} / {currentLesson?.practice.repeats}</div>
          )}
          <p>{passed ? "Level Complete" : "Try Again"}</p>
        </section>
      );
    }

    return null;
  }

  const showInput = mode === "practice" || mode === "test";
  const latestEvent = events.at(-1);

  function updateDotDuration(value) {
    const dotDurationMs = Number(value);
    const dashDurationMs = Math.max(dotDurationMs + 10, calibration.dashDurationMs);
    setCalibration({ dotDurationMs, dashDurationMs });
  }

  function updateDashDuration(value) {
    const dashDurationMs = Number(value);
    const dotDurationMs = Math.min(dashDurationMs - 10, calibration.dotDurationMs);
    setCalibration({ dotDurationMs, dashDurationMs });
  }

  return (
    <main className="main-content">
      <h2>{currentLevel.label}</h2>

      {renderInstruction()}

      {showInput && (
        <>
          <div className="input-display" aria-live="polite">
            <div className="symbol-row">
              {inputSequence.length === 0 ? (
                <span className="input-placeholder-text">
                  Press spacebar or hold the input pad
                </span>
              ) : (
                <>
                  {renderSymbols(inputSequence)}
                  {isPressed && <span className="press-cursor" />}
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            className={`morse-input-pad ${isPressed ? "is-pressed" : ""}`}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onPointerLeave={handlePointerCancel}
            aria-label="Morse input pad. Press and hold for dot or dash."
          >
            <span>{isPressed ? "RELEASE" : "PRESS & HOLD"}</span>
            <small>{activeDevice ? `Input: ${activeDevice}` : "Keyboard or touch"}</small>
          </button>

          {latestEvent && (
            <div className="morse-input-meta" aria-live="polite">
              <span>{latestEvent.symbol === "." ? "DIT" : "DAH"}</span>
              <span>{Math.round(latestEvent.durationMs)} ms</span>
              <span>Timing {latestEvent.timingQuality.score}/100</span>
            </div>
          )}

          {calibration && timing && (
            <section className="morse-calibration-card" aria-label="Morse input calibration">
              <div className="morse-calibration-header">
                <div>
                  <strong>Input calibration</strong>
                  <p>Adjust your press targets without changing Morse timing standards.</p>
                </div>
                <span>{Math.round(calibration.thresholdMs)} ms boundary</span>
              </div>

              <label>
                <span>Dit target: {Math.round(calibration.dotDurationMs)} ms</span>
                <input
                  type="range"
                  min="40"
                  max="800"
                  step="10"
                  value={Math.round(calibration.dotDurationMs)}
                  onChange={(event) => updateDotDuration(event.target.value)}
                />
              </label>

              <label>
                <span>Dah target: {Math.round(calibration.dashDurationMs)} ms</span>
                <input
                  type="range"
                  min="80"
                  max="1800"
                  step="10"
                  value={Math.round(calibration.dashDurationMs)}
                  onChange={(event) => updateDashDuration(event.target.value)}
                />
              </label>

              <div className="morse-calibration-reference">
                Standard at {Math.round(timing.wpm)} WPM: dit {Math.round(timing.dotMs)} ms · dah {Math.round(timing.dashMs)} ms
              </div>
            </section>
          )}
        </>
      )}

      {renderFeedback()}

      {(mode === "practice" || mode === "test" || mode === "result") && (
        <div className="controls-section">
          {mode !== "result" && (
            <>
              <button
                className="ctrl-btn btn-check"
                onClick={handleCheck}
                disabled={!inputSequence}
              >
                Check
              </button>
              <button className="ctrl-btn btn-retry" onClick={handleRetry}>
                Retry
              </button>
            </>
          )}

          {mode === "result" && !passed && (
            <button className="ctrl-btn btn-retry" onClick={handleTryAgain}>
              Try Again
            </button>
          )}

          {mode === "result" && passed && (
            <button className="ctrl-btn btn-next" onClick={handleNext}>
              Next →
            </button>
          )}
        </div>
      )}

      <div className="session-stats">
        <span>Score: {totalScore}</span>
        <span>Accuracy: {accuracy}%</span>
        <span>Attempts: {attempts}</span>
        <span>🔥 {streak}</span>
      </div>

      {activeNav === "Morse" && (
        <p className="instruction-hint">Morse input supports keyboard, touch, and mouse.</p>
      )}
    </main>
  );
}
