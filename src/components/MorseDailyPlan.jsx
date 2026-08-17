import "./MorseDailyPlan.css";

export default function MorseDailyPlan({ summary, onStart }) {
  if (!summary) return null;

  const hasWork = summary.totalExercises > 0;
  const dueLabel = summary.dueCount === 1 ? "1 review due" : `${summary.dueCount} reviews due`;

  return (
    <section className="morse-daily-plan card" aria-label="Daily Morse plan">
      <div className="morse-daily-plan-header">
        <div>
          <p className="card-label">Today</p>
          <h3>{hasWork ? "Your Morse session is ready" : "No session yet"}</h3>
        </div>
        <span className="morse-daily-duration">{summary.durationMinutes} min</span>
      </div>

      <div className="morse-daily-plan-grid">
        <div><strong>{summary.totalExercises}</strong><span>exercises</span></div>
        <div><strong>{dueLabel}</strong><span>retention first</span></div>
        <div><strong>{summary.weakestSkills.length}</strong><span>weak skill areas</span></div>
      </div>

      <p className="morse-daily-plan-copy">
        {summary.completed
          ? "You finished today's planned work."
          : "Tapmind has prioritized due reviews, then targeted practice, then newer material."}
      </p>

      <button type="button" className="ctrl-btn btn-next" onClick={onStart} disabled={!hasWork}>
        {summary.completed ? "Review Today Again →" : "Start Daily Session →"}
      </button>
    </section>
  );
}
