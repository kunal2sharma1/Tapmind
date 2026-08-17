import { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import MorseAudioControls from "./components/MorseAudioControls";
import MorseLearningModeSelector from "./components/MorseLearningModeSelector";
import MorseLearningSession from "./components/MorseLearningSession";
import levelsData from "./modules/morse/levels.json";
import useProgress from "./hooks/useProgress";
import { MORSE_LEARNING_MODES } from "./modules/morse/learningModes";
import { buildCurriculum, getLessonByLevel } from "./domain/curriculum";
import "./styles/global.css";
import "./styles/learning-column.css";

export default function App() {
  const { progress, recordAttempt, completeLevel, setCurrentLevel, isLevelUnlocked } = useProgress();
  const [activeNav, setActiveNav] = useState("Learning");
  const [selectedLevel, setSelectedLevel] = useState(progress.currentLevel || 1);
  const [learningMode, setLearningMode] = useState(MORSE_LEARNING_MODES.LEARN);

  const curriculum = buildCurriculum(levelsData);
  const levels = curriculum.map((item) => item.raw);
  const currentItem = getLessonByLevel(curriculum, selectedLevel) || curriculum[0];
  const currentLevel = currentItem.raw;
  const currentLesson = currentItem.lesson;
  const currentCharacter = currentItem.character;

  function handleLevelSelect(levelNumber) {
    if (!isLevelUnlocked(levelNumber)) return;
    setSelectedLevel(levelNumber);
    setCurrentLevel(levelNumber);
  }

  const sessionProps = {
    mode: learningMode,
    currentCharacter,
    currentLevel,
    recordAttempt,
  };

  return (
    <div className="app-shell">
      <Navbar activeNav={activeNav} onNavChange={setActiveNav} />
      <div className="app-body">
        <Sidebar
          levels={levels}
          selectedLevel={selectedLevel}
          onLevelSelect={handleLevelSelect}
          progress={progress}
          isLevelUnlocked={isLevelUnlocked}
        />
        <div className="learning-column">
          <MorseLearningModeSelector
            value={learningMode}
            onChange={setLearningMode}
          />

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
            <MorseAudioControls
              morse={currentCharacter.morse}
              label={`Listen to ${currentCharacter.letter}`}
            />
          )}
        </div>
      </div>
    </div>
  );
}
