import { describeLearningMode, MORSE_LEARNING_MODES } from "../modules/morse/learningModes";
import "./MorseLearningModeSelector.css";

const MODE_ORDER = [
  MORSE_LEARNING_MODES.LEARN,
  MORSE_LEARNING_MODES.RECOGNITION,
  MORSE_LEARNING_MODES.RECALL,
  MORSE_LEARNING_MODES.AUDIO_RECOGNITION,
  MORSE_LEARNING_MODES.AUDIO_RECALL,
  MORSE_LEARNING_MODES.SENDING,
  MORSE_LEARNING_MODES.MIXED
];

export default function MorseLearningModeSelector({ value, onChange, disabled = false }) {
  const selected = describeLearningMode(value);

  return (
    <section className="morse-mode-selector" aria-label="Morse learning mode">
      <div className="morse-mode-heading">
        <div>
          <p className="card-label">Training mode</p>
          <h3>Choose how you want to learn</h3>
        </div>
        {selected && <span className="morse-mode-skill-count">{selected.skills.length} skill{selected.skills.length === 1 ? "" : "s"}</span>}
      </div>

      <div className="morse-mode-grid">
        {MODE_ORDER.map((mode) => {
          const option = describeLearningMode(mode);
          const active = value === mode;

          return (
            <button
              key={mode}
              type="button"
              className={`morse-mode-option ${active ? "is-active" : ""}`}
              onClick={() => onChange?.(mode)}
              disabled={disabled}
              aria-pressed={active}
            >
              <span className="morse-mode-option-title">{option.label}</span>
              <span className="morse-mode-option-description">{option.description}</span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="morse-mode-detail">
          <span>Focus:</span>
          {selected.skills.map((skill) => (
            <span key={skill} className="morse-mode-chip">{skill.replaceAll("-", " ")}</span>
          ))}
        </div>
      )}
    </section>
  );
}
