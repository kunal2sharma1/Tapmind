import { useCallback, useState } from "react";

export default function useScoring() {
  const [totalScore, setTotalScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const applyCorrect = useCallback(() => {
    setAttempts((previous) => previous + 1);
    setCorrectAnswers((previous) => previous + 1);

    setStreak((previous) => {
      const nextStreak = previous + 1;
      const points = nextStreak % 3 === 0 ? 15 : 10;
      setTotalScore((score) => score + points);
      return nextStreak;
    });
  }, []);

  const applyWrong = useCallback(() => {
    setAttempts((previous) => previous + 1);
    setStreak(0);
    setTotalScore((previous) => Math.max(0, previous - 5));
  }, []);

  const accuracy = attempts
    ? Math.round((correctAnswers / attempts) * 100)
    : 0;

  const resetSession = useCallback(() => {
    setTotalScore(0);
    setStreak(0);
    setAttempts(0);
    setCorrectAnswers(0);
  }, []);

  return {
    totalScore,
    streak,
    attempts,
    correctAnswers,
    accuracy,
    applyCorrect,
    applyWrong,
    resetSession,
  };
}
