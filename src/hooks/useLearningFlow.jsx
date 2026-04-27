import { useState, useEffect, useRef } from "react";
import generateTestQuestions from "../utils/testGenerator";

export default function useLearningFlow({
  currentLevel,
  levels,
  inputSequence,
  resetInput,
  applyCorrect,
  applyWrong,
  streak,
  onLevelSelect
}) {
  const [mode, setMode] = useState("learn");
  const [practiceCount, setPracticeCount] = useState(0);
  const [testIndex, setTestIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");

  const testQuestions = useRef([]);

  // 🚀 Enter Test Mode
  function enterTestMode() {
    testQuestions.current = generateTestQuestions(levels, currentLevel);

    setTestIndex(0);
    setScore(0);
    setFeedback("");
    setCorrectAnswer("");
    setMode("test");
    resetInput();
  }

  // ✅ MUST BE ABOVE useEffects
  const currentQuestion = testQuestions.current[testIndex] || null;

  // 🔁 Reset on level change
  useEffect(() => {
    setMode("learn");
    setPracticeCount(0);
    setTestIndex(0);
    setScore(0);
    setPassed(false);
    setFeedback("");
    setCorrectAnswer("");
    testQuestions.current = [];
    resetInput();
  }, [currentLevel?.level]);

  // 🔥 AUTO CHECK (PRACTICE)
  useEffect(() => {
    if (mode !== "practice") return;
    if (!currentLevel) return;

    if (currentLevel.level === 1) return;
    if (currentLevel.level === 10) return;

    if (
      currentLevel.morse &&
      inputSequence.length === currentLevel.morse.length
    ) {
      const timer = setTimeout(() => {
        handleCheck();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [inputSequence, mode, currentLevel]);

  // 🔥 AUTO CHECK (TEST)
  useEffect(() => {
    if (mode !== "test") return;
    if (!currentQuestion) return;

    if (inputSequence.length === currentQuestion.morse.length) {
      const timer = setTimeout(() => {
        handleCheck();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [inputSequence, mode, currentQuestion]);

  function handleCheck() {
    // ================= PRACTICE =================
    if (mode === "practice") {
      if (!currentLevel) return;

      // LEVEL 10 → skip
      if (currentLevel.level === 10) {
        enterTestMode();
        return;
      }

      // LEVEL 1 → free pass
      if (currentLevel.level === 1) {
        applyCorrect(streak);
        setFeedback("correct");

        setTimeout(() => {
          setFeedback("");

          const next = practiceCount + 1;
          setPracticeCount(next);
          resetInput();

          if (next >= 3) {
            enterTestMode();
          }
        }, 300);

        return;
      }

      if (!currentLevel.morse) return;

      const correct = inputSequence === currentLevel.morse;

      if (correct) {
        applyCorrect(streak);
        setFeedback("correct");
        setCorrectAnswer("");

        setTimeout(() => {
          setFeedback("");

          const next = practiceCount + 1;
          setPracticeCount(next);
          resetInput();

          if (next >= 3) {
            enterTestMode();
          }
        }, 300);
      } else {
        applyWrong();
        setFeedback("wrong");
        setCorrectAnswer(currentLevel.morse);

        setTimeout(() => {
          resetInput();
        }, 600);
      }
    }

    // ================= TEST =================
else if (mode === "test") {
  if (!currentQuestion) return;

  const totalQuestions = testQuestions.current.length;

  const correct = inputSequence === currentQuestion.morse;

  if (correct) {
    applyCorrect(streak);
    setFeedback("correct");
    setCorrectAnswer("");

    const nextScore = score + 1;
    setScore(nextScore);

    const nextIndex = testIndex + 1;
    resetInput();

    if (nextIndex >= totalQuestions) {
      const passThreshold = Math.ceil(totalQuestions * 0.8); // 80% rule
      const didPass = nextScore >= passThreshold;

      setPassed(didPass);
      setMode("result");
    } else {
      setTestIndex(nextIndex);
    }

  } else {
    applyWrong();
    setFeedback("wrong");
    setCorrectAnswer(currentQuestion.morse);

    const nextIndex = testIndex + 1;
    resetInput();

    if (nextIndex >= totalQuestions) {
      const passThreshold = Math.ceil(totalQuestions * 0.8);
      const didPass = score >= passThreshold;

      setPassed(didPass);
      setMode("result");
    } else {
      setTestIndex(nextIndex);
    }
  }
}
  }

  function handleRetry() {
    setFeedback("");
    setCorrectAnswer("");
    resetInput();
  }

  function handleNext() {
    if (!passed) return;

    const nextLevel = levels.find(
      (l) => l.level === currentLevel.level + 1
    );

    if (nextLevel) {
      onLevelSelect(nextLevel.level);
    }
  }

  function handleTryAgain() {
    setPracticeCount(0);
    setFeedback("");
    setCorrectAnswer("");
    resetInput();
    setMode("practice");
  }

  function startPractice() {
    if (currentLevel?.level === 10) {
      enterTestMode();
      return;
    }

    resetInput();
    setMode("practice");
  }

  return {
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
  };
}