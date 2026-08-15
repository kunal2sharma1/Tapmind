import { useEffect } from "react";
import useMorseInput from "../hooks/useMorseInput";
import useScoring from "../hooks/useScoring";
import useLearningFlow from "../hooks/useLearningFlow";
import "./MainContent.css";

export default function MainContent({
  selectedLevel,
  activeNav,
  currentLevel,
  levels,
  onLevelSelect,
  recordAttempt,
  completeLevel,
}) {
  const { inputSequence, isPressed, resetInput } = useMorseInput();
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
                <span className="instruction-letter">{currentLevel.letter}</span>
                <span className="instruction-morse">{currentLevel.morse}</span>
              </div>
              <p className="instruction-hint">Memorize this pattern</p>
            </>
          )}
          <div className="controls-section" style={{ marginTop: 16 }}>
            <button className="ctrl-btn btn-next" onClick={startPractice}>
              {currentLevel.practiceMode === "none" ? "Start Review →" : "Start Practice →"}
            </button>
          </div>
        </section>
      );
    }

    if (mode === "practice") {
      const target = currentLevel.practiceRepeats ?? 3;

      return (
        <section className="card instruction-card">
          <p className="card-label">Practice</p>
          <p className="instruction-hint">
            Tap the Morse code ({practiceCount + 1} / {target})
          </p>
          <p className="instruction-hint">Press Enter to check early.</p>
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
      const isAssessment = currentLevel.assessment?.enabled !== false;
      return (
        <section className="card instruction-card">
          <p className="card-label">Result</p>
          {isAssessment ? (
            <div>{score} / {testTotal}</div>
          ) : (
            <div>{practiceCount} / {currentLevel.practiceRepeats}</div>
          )}
          <p>{passed ? "Level Complete" : "Try Again"}</p>
        </section>
      );
    }

    return null;
  }

  const showInput = mode === "practice" || mode === "test";

  return (
    <main className="main-content">
      <h2>{currentLevel.label}</h2>

      {renderInstruction()}

      {showInput && (
        <div className="input-display" aria-live="polite">
          <div className="symbol-row">
            {inputSequence.length === 0 ? (
              <span className="input-placeholder-text">
                Press spacebar to start
              </span>
            ) : (
              <>
                {renderSymbols(inputSequence)}
                {isPressed && <span className="press-cursor" />}
              </>
            )}
          </div>
        </div>
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
        <p className="instruction-hint">Morse input is currently keyboard-first.</p>
      )}
    </main>
  );
}
