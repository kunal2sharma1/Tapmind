import { useEffect, useMemo, useState } from "react";
import { createMorseAudioEngine } from "../modules/morse/audio";
import { MORSE_TIMING } from "../modules/morse/timing";

export default function useMorseReceptionAudio() {
  const engine = useMemo(() => createMorseAudioEngine(), []);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [settings, setSettings] = useState({
    wpm: 10,
    characterWpm: 10,
    timingMode: "standard",
    toneHz: MORSE_TIMING.DEFAULT_TONE_HZ,
    volume: 0.15,
    waveform: "sine",
  });

  useEffect(() => () => engine.close(), [engine]);

  async function playMessage(morseMessage, overrides = {}) {
    if (!morseMessage) return null;
    setLastError(null);
    setIsPlaying(true);
    try {
      engine.stop();
      const result = await engine.playMessage(morseMessage, { ...settings, ...overrides });
      window.setTimeout(() => setIsPlaying(false), result.durationMs + 100);
      return result;
    } catch (error) {
      setLastError(error instanceof Error ? error.message : "Unable to play reception audio");
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

  return { isPlaying, lastError, settings, playMessage, stop, updateSetting };
}
