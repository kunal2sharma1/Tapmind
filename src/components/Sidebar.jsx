import "./Sidebar.css";

export default function Sidebar({
  levels,
  selectedLevel,
  onLevelSelect,
  progress,
  isLevelUnlocked,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">Levels</div>
      <ul className="level-list">
        {levels.map((level) => {
          const unlocked = isLevelUnlocked(level.level);
          const completed = progress.completedLevels.includes(level.level);

          return (
            <li key={level.level}>
              <button
                className={`level-item ${selectedLevel === level.level ? "selected" : ""}`}
                onClick={() => onLevelSelect(level.level)}
                disabled={!unlocked}
                aria-disabled={!unlocked}
                title={
                  unlocked
                    ? completed
                      ? "Completed — revisit anytime"
                      : "Start this level"
                    : "Complete the previous level to unlock"
                }
              >
                <span className="level-number">{level.level}</span>
                <span className="level-label">{level.label}</span>
                {completed && (
                  <span className="level-status" aria-label="Completed">
                    ✓
                  </span>
                )}
                {!unlocked && (
                  <span className="level-status" aria-label="Locked">
                    🔒
                  </span>
                )}
                {selectedLevel === level.level && (
                  <span className="level-indicator" aria-hidden="true" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
