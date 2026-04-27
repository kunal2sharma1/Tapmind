import { useState } from "react";

export default function useScoring() {
  const [totalScore, setTotalScore] = useState(0);
  const [streak, setStreak] = useState(0);

  function applyCorrect(currentStreak) {
    const newStreak = currentStreak + 1;
    setStreak(newStreak);

    let points = 10;
    if (newStreak % 3 === 0) points += 5;

    setTotalScore(prev => prev + points);
    return newStreak;
  }

  function applyWrong() {
    setStreak(0);
    setTotalScore(prev => Math.max(0, prev - 5));
  }

  return { totalScore, streak, applyCorrect, applyWrong };
}
