import { useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import MorseAudioControls from "./components/MorseAudioControls";
import MorseLearningModeSelector from "./components/MorseLearningModeSelector";
import MorseLearningSession from "./components/MorseLearningSession";
import MorseMasteryCard from "./components/MorseMasteryCard";
import MorseDailyPlan from "./components/MorseDailyPlan";
import MorseWordSession from "./components/MorseWordSession";
import levelsData from "./modules/morse/levels.json";
import useProgress from "./hooks/useProgress";
import useDailyLearning from "./hooks/useDailyLearning";
import { MORSE_LEARNING_MODES } from "./modules/morse/learningModes";
import { buildCurriculum, getLessonByLevel } from "./domain/curriculum";
import "./styles/global.css";
import "./styles/learning-column.css";

export default function App() {
  const { progress, recordAttempt, recordWordAttempt, completeLevel, setCurrentLevel, isLevelUnlocked, getMastery } = useProgress();
  const [activeNav, setActiveNav] = useState("Learning");
  const [selectedLevel, setSelectedLevel] = useState(progress.currentLevel || 1);
  const [learningMode, setLearningMode] = useState(MORSE_LEARNING_MODES.LEARN);

  const curriculum = buildCurriculum(levelsData);
  const levels = curriculum.map((item) => item.raw);
  const currentItem = getLessonByLevel(curriculum, selectedLevel) || curriculum[0];
  const currentLevel = currentItem.raw;
  const currentLesson = currentItem.lesson;
  const currentCharacter = currentItem.character;
  const currentMastery = getMastery(currentCharacter?.letter ?? currentCharacter?.symbol ?? "");

  const introducedCharacters = useMemo(
    () => curriculum
      .slice(0, Math.max(1, selectedLevel))
      .map((item) => item.character)
      .filter(Boolean),
    [curriculum, selectedLevel]
  );

  const { summary, startOrRefresh } = useDailyLearning({ progress, introducedCharacters });

  function handleLevelSelect(levelNumber) {
    if (!isLevelUnlocked(levelNumber)) return;
    setSelectedLevel(levelNumber);
    setCurrentLevel(levelNumber);
  }

  function startDailySession() {
    startOrRefresh();
    setActiveNav("Learning");
    setLearningMode(MORSE_LEARNING_MODES.MIXED);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const sessionProps = { mode: learningMode, currentCharacter, currentLevel, recordAttempt };

  return (
    <div className="app-shell">
      <Navbar activeNav={activeNav} onNavChange={setActiveNav} />
      <div className="app-body">
        {activeNav !== "Words" && (
          <Sidebar
            levels={levels}
            selectedLevel={selectedLevel}
            onLevelSelect={handleLevelSelect}
            progress={progress}
            isLevelUnlocked={isLevelUnlocked}
          />
        )}
        <div className="learning-column">
          {activeNav === "Words" ? (
            <MorseWordSession
              wordMastery={progress.wordMastery}
              onRecordWordAttempt={(word, correct, metadata) => recordWordAttempt(word, correct, { ...metadata, mode: metadata?.mode ?? "word-recall" })}
            />
          ) : (
            <>
              <MorseDailyPlan summary={summary} onStart={startDailySession} />

              <MorseLearningModeSelector value={learningMode} onChange={setLearningMode} />

              {learningMode === MORSE_LEARNING_MODES.LEARN ? (
                <MainContent
                  selectedLevel={selectedLevel}
                  activeNav={activeNav}
                  currentLevel={currentLevel}
                  currentLesson={currentLesson}
                  currentCharacter={currentCharacter}
                  levels={levels}
                  learningMode={learningMode}
                  onLevelSelect={handleLevelSelect}
                  recordAttempt={recordAttempt}
                  completeLevel={completeLevel}
                />
              ) : (
                <MorseLearningSession {...sessionProps} />
              )}

              {learningMode === MORSE_LEARNING_MODES.LEARN && currentCharacter?.morse && (
                <MorseAudioControls morse={currentCharacter.morse} label={`Listen to ${currentCharacter.letter}`} />
              )}

              <MorseMasteryCard symbol={currentCharacter?.letter ?? currentCharacter?.symbol} mastery={currentMastery} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
