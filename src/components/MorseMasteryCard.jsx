import { getWeakestSkills, calculateOverallMastery, getMasteryState } from "../modules/morse/mastery";
import "./MorseMasteryCard.css";

const LABELS = {
  recognition: "Recognition",
  recall: "Recall",
  audioRecognition: "Audio recognition",
  audioRecall: "Audio recall",
  sending: "Sending",
  timing: "Timing",
  speed: "Speed",
  retention: "Retention",
  confidence: "Confidence",
};

export default function MorseMasteryCard({ symbol, mastery }) {
  if (!symbol || !mastery) return null;

  const overall = calculateOverallMastery(mastery);
  const state = getMasteryState(mastery, { previouslyPracticed: mastery.attempts > 0 });
  const weakest = getWeakestSkills(mastery, 3).filter((item) => item.score < 75);

  return (
    <section className="morse-mastery-card" aria-label={`${symbol} mastery`}>
      <div className="morse-mastery-heading">
        <div>
          <p className="card-label">Character mastery</p>
          <h3>{symbol}</h3>
        </div>
        <div className="morse-mastery-overall">
          <strong>{overall}%</strong>
          <span>{state.replaceAll("-", " ")}</span>
        </div>
      </div>

      <div className="morse-mastery-grid">
        {Object.entries(LABELS).map(([skill, label]) => (
          <div className="morse-mastery-skill" key={skill}>
            <div className="morse-mastery-skill-label">
              <span>{label}</span>
              <strong>{Math.round(mastery[skill] ?? 0)}%</strong>
            </div>
            <div className="morse-mastery-bar">
              <span style={{ width: `${Math.round(mastery[skill] ?? 0)}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="morse-mastery-meta">
        <span>{mastery.attempts ?? 0} attempts</span>
        <span>{mastery.correct ?? 0} correct</span>
        {weakest.length > 0 && (
          <span>Focus: {weakest.map((item) => LABELS[item.skill]).join(", ")}</span>
        )}
      </div>
    </section>
  );
}
