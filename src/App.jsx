import { useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import MorseAudioControls from "./components/MorseAudioControls";
import MorseLearningModeSelector from "./components/MorseLearningModeSelector";
import MorseLearningSession from "./components/MorseLearningSession";
import MorseMasteryCard from "./components/MorseMasteryCard";
import levelsData from "./modules/morse/levels.json";
import useProgress from "./hooks/useProgress";
import { MORSE_LEARNING_MODES } from "./modules/morse/learningModes";
import { buildCurriculum, getLessonByLevel } from "./domain/curriculum";
import "./styles/global.css";
import "./styles/learning-column.css";

export default function App() {
  const { progress, recordAttempt, completeLevel, setCurrentLevel, isLevelUnlocked, getMastery } = useProgress();
  const [activeNav, setActiveNav] = useState("Learning");
  const [selectedLevel, setSelectedLevel] = useState(progress.currentLevel || 1);
  const [learningMode, setLearningMode] = useState(MORSE_LEARNING_MODES.LEARN);

  const curriculum = useMemo(() => buildCurriculum(levelsData), []);
  const levels = curriculum.map((item) => item.raw);
  const currentItem = getLessonByLevel(curriculum, selectedLevel) || curriculum[0];
  const currentLevel = currentItem.raw;
  const currentLesson = currentItem.lesson;
  const currentCharacter = currentItem.character;
  const currentMastery = getMastery(currentCharacter?.letter ?? currentCharacter?.symbol ?? "");

  const availableCharacters = useMemo(() => {
    const introduced = curriculum
      .filter((item) => item.raw.level <= selectedLevel)
      .map((item) => item.character)
      .filter(Boolean)
      .map((character) => ({
        id: character.id,
        symbol: character.symbol,
        morse: character.morse,
        category: character.category,
      }));
    return [...new Map(introduced.map((character) => [character.id, character])).values()];
  }, [curriculum, selectedLevel]);

  function handleLevelSelect(levelNumber) {
    if (!isLevelUnlocked(levelNumber)) return;
    setSelectedLevel(levelNumber);
    setCurrentLevel(levelNumber);
  }

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
            <MorseLearningSession
              mode={learningMode}
              currentCharacter={currentCharacter}
              currentLevel={currentLevel}
              availableCharacters={availableCharacters}
              characterMastery={progress.mastery}
              recordAttempt={recordAttempt}
            />
          )}

          {learningMode === MORSE_LEARNING_MODES.LEARN && currentCharacter?.morse && (
            <MorseAudioControls
              morse={currentCharacter.morse}
              label={`Listen to ${currentCharacter.letter}`}
            />
          )}

          <MorseMasteryCard
            symbol={currentCharacter?.letter ?? currentCharacter?.symbol}
            mastery={currentMastery}
          />
        </div>
      </div>
    </div>
  );
}
