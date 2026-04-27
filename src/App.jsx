import { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import levelsData from "./modules/morse/levels.json";
import "./styles/global.css";

export default function App() {
  const [activeNav, setActiveNav] = useState("Learning");
  const [selectedLevel, setSelectedLevel] = useState(1);

  const modules = { morse: levelsData };
  const levels = modules.morse;
  const currentLevel = levels.find(l => l.level === selectedLevel);

  return (
    <div className="app-shell">
      <Navbar activeNav={activeNav} onNavChange={setActiveNav} />
      <div className="app-body">
        <Sidebar
          levels={levels}
          selectedLevel={selectedLevel}
          onLevelSelect={setSelectedLevel}
        />
        <MainContent selectedLevel={selectedLevel} activeNav={activeNav} currentLevel={currentLevel} levels={levels} onLevelSelect={setSelectedLevel} />
      </div>
    </div>
  );
}
