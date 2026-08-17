import useMorseAudio from "../hooks/useMorseAudio";
import "./MorseAudioControls.css";

const WPM_OPTIONS = [5, 10, 15, 20, 25, 30];

export default function MorseAudioControls({ morse, label = "Listen to Morse" }) {
  const { isPlaying, lastError, settings, play, stop, updateSetting } = useMorseAudio();

  function handlePlay() {
    if (isPlaying) {
      stop();
      return;
    }
    play(morse);
  }

  return (
    <section className="morse-audio-card" aria-label="Morse audio controls">
      <div className="morse-audio-header">
        <div>
          <p className="morse-audio-label">Audio</p>
          <h3>{label}</h3>
        </div>
        <button
          type="button"
          className="morse-audio-play"
          onClick={handlePlay}
          disabled={!morse}
          aria-pressed={isPlaying}
        >
          {isPlaying ? "Stop" : "▶ Listen"}
        </button>
      </div>

      <div className="morse-audio-settings">
        <label>
          <span>Speed</span>
          <select
            value={settings.wpm}
            onChange={(event) => updateSetting("wpm", Number(event.target.value))}
          >
            {WPM_OPTIONS.map((wpm) => (
              <option key={wpm} value={wpm}>{wpm} WPM</option>
            ))}
          </select>
        </label>

        <label>
          <span>Spacing</span>
          <select
            value={settings.timingMode}
            onChange={(event) => updateSetting("timingMode", event.target.value)}
          >
            <option value="standard">Standard</option>
            <option value="farnsworth">Farnsworth</option>
          </select>
        </label>

        <label>
          <span>Tone</span>
          <input
            type="range"
            min="300"
            max="1000"
            step="25"
            value={settings.toneHz}
            onChange={(event) => updateSetting("toneHz", Number(event.target.value))}
          />
          <output>{settings.toneHz} Hz</output>
        </label>
      </div>

      {lastError && <p className="morse-audio-error" role="alert">{lastError}</p>}
    </section>
  );
}
