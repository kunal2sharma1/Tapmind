import { useEffect, useMemo, useState } from "react";
import { createMorseAudioEngine } from "../modules/morse/audio";
import { MORSE_TIMING } from "../modules/morse/timing";

export default function useMorseAudio() {
  const engine = useMemo(() => createMorseAudioEngine(), []);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [settings, setSettings] = useState({
    wpm: MORSE_TIMING.DEFAULT_WPM,
    characterWpm: MORSE_TIMING.DEFAULT_CHARACTER_WPM,
    timingMode: "standard",
    toneHz: MORSE_TIMING.DEFAULT_TONE_HZ,
    volume: 0.15,
    waveform: "sine"
  });

  useEffect(() => () => engine.close(), [engine]);

  async function play(morse, overrides = {}) {
    if (!morse) return null;
    setLastError(null);
    setIsPlaying(true);

    try {
      engine.stop();
      const result = await engine.playPattern(morse, { ...settings, ...overrides });
      window.setTimeout(() => setIsPlaying(false), result.durationMs + 80);
      return result;
    } catch (error) {
      setLastError(error instanceof Error ? error.message : "Unable to play Morse audio");
      setIsPlaying(false);
      return null;
    }
  }

  function stop() {
    engine.stop();
    setIsPlaying(false);
  }

  function updateSetting(name, value) {
    setSettings((previous) => ({ ...previous, [name]: value }));
  }

  return { isPlaying, lastError, settings, play, stop, updateSetting };
}
