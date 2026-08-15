import { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import levelsData from "./modules/morse/levels.json";
import useProgress from "./hooks/useProgress";
import "./styles/global.css";

export default function App() {
  const { progress, recordAttempt, completeLevel, setCurrentLevel, isLevelUnlocked } = useProgress();
  const [activeNav, setActiveNav] = useState("Learning");
  const [selectedLevel, setSelectedLevel] = useState(progress.currentLevel || 1);

  const levels = levelsData;
  const currentLevel = levels.find((level) => level.level === selectedLevel) || levels[0];

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
        <MainContent
          selectedLevel={selectedLevel}
          activeNav={activeNav}
          currentLevel={currentLevel}
          levels={levels}
          onLevelSelect={handleLevelSelect}
          recordAttempt={recordAttempt}
          completeLevel={completeLevel}
        />
      </div>
    </div>
  );
}
