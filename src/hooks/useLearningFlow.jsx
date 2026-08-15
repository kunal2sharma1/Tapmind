import { useEffect, useRef, useState } from "react";
import { createExercise, createLesson } from "../domain/model";
import { generateAssessment, calculatePass } from "../utils/learningEngine";

export default function useLearningFlow({
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
}) {
  const [mode, setMode] = useState("learn");
  const [practiceCount, setPracticeCount] = useState(0);
  const [testIndex, setTestIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");

  const testQuestions = useRef([]);
  const lesson = currentLesson ?? createLesson(currentLevel ?? {});

  function enterTestMode() {
    if (!lesson.assessment.enabled) {
      completeLevel(currentLevel.level);
      setPassed(true);
      setMode("result");
      return;
    }

    testQuestions.current = generateAssessment(levels, currentLevel);
    setTestIndex(0);
    setScore(0);
    setPassed(false);
    setFeedback("");
    setCorrectAnswer("");
    setMode("test");
    resetInput();
  }

  const currentQuestion = testQuestions.current[testIndex] || null;
  const testTotal = testQuestions.current.length;

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
  }, [currentLevel?.level, resetInput]);

  useEffect(() => {
    if (mode !== "practice" || !currentLevel) return;
    if (lesson.practice.mode !== "match") return;
    if (!currentLevel.morse) return;

    if (inputSequence.length === currentLevel.morse.length) {
      const timer = setTimeout(() => handleCheck(), 100);
      return () => clearTimeout(timer);
    }
  }, [inputSequence, mode, currentLevel, lesson.practice.mode]);

  useEffect(() => {
    if (mode !== "test" || !currentQuestion) return;

    if (inputSequence.length === currentQuestion.morse.length) {
      const timer = setTimeout(() => handleCheck(), 100);
      return () => clearTimeout(timer);
    }
  }, [inputSequence, mode, currentQuestion]);

  function advancePractice() {
    const target = lesson.practice.repeats;
    const next = practiceCount + 1;

    setFeedback("");
    setCorrectAnswer("");
    setPracticeCount(next);
    resetInput();

    if (next < target) return;
    enterTestMode();
  }

  function handleCheck() {
    if (mode === "practice") {
      if (!currentLevel) return;

      if (lesson.practice.mode === "none") {
        enterTestMode();
        return;
      }

      if (lesson.practice.mode === "binary") {
        if (!inputSequence || ![".", "-"].includes(inputSequence)) return;
        applyCorrect();
        setFeedback("correct");
        setTimeout(advancePractice, 300);
        return;
      }

      if (!currentLevel.morse || !inputSequence) return;

      const correct = inputSequence === currentLevel.morse;
      const exercise = createExercise(currentLevel, "character-reproduction");
      recordAttempt(currentLevel, correct, exercise);

      if (correct) {
        applyCorrect();
        setFeedback("correct");
        setCorrectAnswer("");
        setTimeout(advancePractice, 300);
      } else {
        applyWrong();
        setFeedback("wrong");
        setCorrectAnswer(currentLevel.morse);
        setTimeout(resetInput, 600);
      }
      return;
    }

    if (mode === "test") {
      if (!currentQuestion || !inputSequence) return;

      const correct = inputSequence === currentQuestion.morse;
      const exercise = createExercise(currentLevel, "mixed-assessment");
      recordAttempt(currentQuestion, correct, exercise);

      if (correct) {
        applyCorrect();
        setFeedback("correct");
        setCorrectAnswer("");

        const nextScore = score + 1;
        setScore(nextScore);
        finishOrAdvanceTest(nextScore);
      } else {
        applyWrong();
        setFeedback("wrong");
        setCorrectAnswer(currentQuestion.morse);
        finishOrAdvanceTest(score);
      }
    }
  }

  function finishOrAdvanceTest(nextScore) {
    const nextIndex = testIndex + 1;
    resetInput();

    if (nextIndex >= testTotal) {
      const didPass = calculatePass(
        nextScore,
        testTotal,
        lesson.assessment.passPercent
      );

      setPassed(didPass);
      setMode("result");

      if (didPass) completeLevel(currentLevel.level);
      return;
    }

    setTestIndex(nextIndex);
  }

  function handleRetry() {
    setFeedback("");
    setCorrectAnswer("");
    resetInput();
  }

  function handleNext() {
    if (!passed) return;

    const nextLevel = levels.find(
      (level) => level.level === currentLevel.level + 1
    );

    if (nextLevel) onLevelSelect(nextLevel.level);
  }

  function handleTryAgain() {
    setPracticeCount(0);
    setFeedback("");
    setCorrectAnswer("");
    resetInput();
    setMode(lesson.practice.mode === "none" ? "learn" : "practice");
  }

  function startPractice() {
    setPracticeCount(0);
    resetInput();

    if (lesson.practice.mode === "none") {
      enterTestMode();
      return;
    }

    setMode("practice");
  }

  return {
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
  };
}
