import { useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import MorseAudioControls from "./components/MorseAudioControls";
import MorseLearningModeSelector from "./components/MorseLearningModeSelector";
import MorseLearningSession from "./components/MorseLearningSession";
import MorseSentenceSession from "./components/MorseSentenceSession";
import MorseSpeedSession from "./components/MorseSpeedSession";
import MorseReceptionSession from "./components/MorseReceptionSession";
import MorseMasteryCard from "./components/MorseMasteryCard";
import MorseDailyPlan from "./components/MorseDailyPlan";
import levelsData from "./modules/morse/levels.json";
import useProgress from "./hooks/useProgress";
import useSpeedProgress from "./hooks/useSpeedProgress";
import useDailyLearning from "./hooks/useDailyLearning";
import { MORSE_LEARNING_MODES } from "./modules/morse/learningModes";
import { buildCurriculum, getLessonByLevel } from "./domain/curriculum";
import { RECEPTION_DIFFICULTIES } from "./modules/morse/reception";
import "./styles/global.css";
import "./styles/learning-column.css";

export default function App() {
  const {
    progress,
    recordAttempt,
    recordSentenceAttempt,
    completeLevel,
    setCurrentLevel,
    isLevelUnlocked,
    getMastery,
  } = useProgress();
  const { profile: speedProfile, recordSpeedAttempt } = useSpeedProgress();
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
    () => curriculum.slice(0, Math.max(1, selectedLevel)).map((item) => item.character).filter(Boolean),
    [curriculum, selectedLevel]
  );

  const { summary, startOrRefresh } = useDailyLearning({ progress, introducedCharacters });
  const sentenceMastery = progress.sentenceMastery ?? {};
  const sentenceDifficulty = selectedLevel >= 55 ? 4 : selectedLevel >= 45 ? 3 : selectedLevel >= 35 ? 2 : 1;
  const receptionDifficulty = selectedLevel >= 50
    ? RECEPTION_DIFFICULTIES.ADVANCED
    : selectedLevel >= 38
      ? RECEPTION_DIFFICULTIES.OPERATIONAL
      : selectedLevel >= 25
        ? RECEPTION_DIFFICULTIES.BASIC
        : RECEPTION_DIFFICULTIES.FOUNDATION;

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

  function handleNavigation(item) {
    setActiveNav(item);
    if (item === "Learning" || item === "Morse") setLearningMode(MORSE_LEARNING_MODES.LEARN);
  }

  const sessionProps = { mode: learningMode, currentCharacter, currentLevel, recordAttempt };
  const showCharacters = activeNav === "Learning" || activeNav === "Morse";
  const showWords = activeNav === "Words";
  const showSentences = activeNav === "Sentences";
  const showSpeed = activeNav === "Speed";
  const showReception = activeNav === "Reception";

  return (
    <div className="app-shell">
      <Navbar activeNav={activeNav} onNavChange={handleNavigation} />
      <div className="app-body">
        {showCharacters && (
          <Sidebar levels={levels} selectedLevel={selectedLevel} onLevelSelect={handleLevelSelect} progress={progress} isLevelUnlocked={isLevelUnlocked} />
        )}
        <div className="learning-column">
          {showCharacters && <MorseDailyPlan summary={summary} onStart={startDailySession} />}
          {showCharacters && <MorseLearningModeSelector value={learningMode} onChange={setLearningMode} />}

          {showCharacters && (
            learningMode === MORSE_LEARNING_MODES.LEARN ? (
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
            ) : <MorseLearningSession {...sessionProps} />
          )}

          {showCharacters && learningMode === MORSE_LEARNING_MODES.LEARN && currentCharacter?.morse && (
            <MorseAudioControls morse={currentCharacter.morse} label={`Listen to ${currentCharacter.letter}`} />
          )}

          {showCharacters && <MorseMasteryCard symbol={currentCharacter?.letter ?? currentCharacter?.symbol} mastery={currentMastery} />}

          {showWords && (
            <section className="card">
              <p className="card-label">Words</p>
              <h2>Word learning</h2>
              <p>Build automatic recognition by moving from individual characters to complete Morse words.</p>
              <p className="instruction-hint">Use the Words navigation from the top bar to begin the dedicated word session.</p>
            </section>
          )}

          {showSentences && (
            <MorseSentenceSession
              sentenceMastery={sentenceMastery}
              maxDifficulty={sentenceDifficulty}
              onAttempt={(exercise, result) => recordSentenceAttempt(exercise.target.id, result.correct)}
            />
          )}

          {showSpeed && (
            <MorseSpeedSession
              characters={introducedCharacters}
              profile={speedProfile}
              onComplete={(nextProfile) => recordSpeedAttempt(nextProfile)}
            />
          )}

          {showReception && (
            <MorseReceptionSession
              maxDifficulty={receptionDifficulty}
              introducedCharacters={introducedCharacters}
            />
          )}
        </div>
      </div>
    </div>
  );
}
