import "./Navbar.css";

const NAV_ITEMS = ["Learning", "Morse", "Words"];

export default function Navbar({ activeNav, onNavChange }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-logo">
          <span className="logo-dot" />
          TapMind
        </div>
        <nav className="navbar-links" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              type="button"
              className={`nav-btn ${activeNav === item ? "active" : ""}`}
              onClick={() => onNavChange(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
