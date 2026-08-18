import "./Navbar.css";

const NAV_ITEMS = ["Learning", "Words", "Sentences", "Speed", "Morse"];

export default function Navbar({ activeNav, onNavChange }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-logo">
          <span className="logo-dot" />
          TapMind
        </div>
        <nav className="navbar-links">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
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
