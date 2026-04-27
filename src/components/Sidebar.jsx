import "./Sidebar.css";

export default function Sidebar({ levels, selectedLevel, onLevelSelect }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">Levels</div>
      <ul className="level-list">
        {levels.map((lvl) => (
          <li key={lvl.level}>
            <button
              className={`level-item ${selectedLevel === lvl.level ? "selected" : ""}`}
              onClick={() => onLevelSelect(lvl.level)}
            >
              <span className="level-number">{lvl.level}</span>
              <span className="level-label">{lvl.label}</span>
              {selectedLevel === lvl.level && (
                <span className="level-indicator" aria-hidden="true" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
