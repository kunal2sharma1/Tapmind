import { useEffect } from "react";
import useMorseInput from "../hooks/useMorseInput";
import useScoring from "../hooks/useScoring";
import useLearningFlow from "../hooks/useLearningFlow";
import "./MainContent.css";

export default function MainContent({ selectedLevel, activeNav, currentLevel, levels, onLevelSelect }) {
  const { inputSequence, isPressed, resetInput } = useMorseInput();
  const { totalScore, streak, applyCorrect, applyWrong } = useScoring();

  const {
    mode,
    practiceCount,
    testIndex,
    score,
    passed,
    feedback,
    correctAnswer,
    currentQuestion,
    handleCheck,
    handleRetry,
    handleNext,
    handleTryAgain,
    startPractice
  } = useLearningFlow({
    currentLevel,
    levels,
    inputSequence,
    resetInput,
    applyCorrect,
    applyWrong,
    streak,
    onLevelSelect,
  });

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Enter") {
        if (mode === "practice" || mode === "test") {
          handleCheck();
        } else if (mode === "result" && passed) {
          handleNext();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, passed, handleCheck, handleNext]);

  function renderSymbols(sequence) {
    if (!sequence) return null;
    return sequence.split("").map((sym, i) => (
      <span key={i} className={`morse-symbol ${sym === "-" ? "sym-dash" : "sym-dot"}`}>
        {sym}
      </span>
    ));
  }

  function renderFeedback() {
    if (!feedback) return null;
    return (
      <div className={`feedback-line feedback-${feedback}`}>
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
          <div className="instruction-display">
            <span className="instruction-letter">{currentLevel.letter}</span>
            <span className="instruction-morse">{currentLevel.morse}</span>
          </div>
          <p className="instruction-hint">Memorize this pattern</p>
          <div className="controls-section" style={{ marginTop: 16 }}>
            <button className="ctrl-btn btn-next" onClick={startPractice}>
              Start Practice →
            </button>
          </div>
        </section>
      );
    }

    if (mode === "practice") {
      return (
        <section className="card instruction-card">
          <p className="card-label">Practice</p>
          <p className="instruction-hint">
            Tap the Morse code ({practiceCount} / 3)
          </p>
        </section>
      );
    }

    if (mode === "test") {
      return (
        <section className="card instruction-card">
          <p className="card-label">Test {testIndex + 1} / 6</p>
          <span className="instruction-letter">{currentQuestion?.letter}</span>
        </section>
      );
    }

    if (mode === "result") {
      return (
        <section className="card instruction-card">
          <p className="card-label">Result</p>
          <div>{score} / 6</div>
          <p>{passed ? "Level Complete" : "Try Again"}</p>
        </section>
      );
    }

    return null;
  }

  const showInput = mode === "practice" || mode === "test";

  return (
    <main className="main-content">
      <h2>Level {selectedLevel}</h2>

      {renderInstruction()}

      {showInput && (
        <div className="input-display">
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

      <div>Score: {totalScore} | 🔥 {streak}</div>
    </main>
  );
}