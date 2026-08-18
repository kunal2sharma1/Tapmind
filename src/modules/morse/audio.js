import { buildCharacterTimeline, buildMessageTimeline, resolveTiming } from "./timing";

export const AUDIO_DEFAULTS = Object.freeze({
  toneHz: 600,
  volume: 0.15,
  waveform: "sine",
  attackMs: 4,
  releaseMs: 8
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeAudioOptions(options = {}) {
  const toneHz = Number.isFinite(options.toneHz) ? clamp(options.toneHz, 100, 2_000) : AUDIO_DEFAULTS.toneHz;
  const volume = Number.isFinite(options.volume) ? clamp(options.volume, 0, 1) : AUDIO_DEFAULTS.volume;
  const attackMs = Number.isFinite(options.attackMs) ? clamp(options.attackMs, 0, 25) : AUDIO_DEFAULTS.attackMs;
  const releaseMs = Number.isFinite(options.releaseMs) ? clamp(options.releaseMs, 0, 50) : AUDIO_DEFAULTS.releaseMs;
  const waveform = ["sine", "square", "triangle", "sawtooth"].includes(options.waveform)
    ? options.waveform
    : AUDIO_DEFAULTS.waveform;
  return { toneHz, volume, attackMs, releaseMs, waveform };
}

export function createMorseAudioEngine({ AudioContextClass } = {}) {
  let context = null;
  let masterGain = null;
  let activeSources = new Set();

  function getAudioContextConstructor() {
    if (AudioContextClass) return AudioContextClass;
    if (typeof window === "undefined") return null;
    return window.AudioContext || window.webkitAudioContext || null;
  }

  function ensureContext() {
    if (context) return context;
    const Constructor = getAudioContextConstructor();
    if (!Constructor) throw new Error("Web Audio API is not available in this environment");
    context = new Constructor();
    masterGain = context.createGain();
    masterGain.gain.value = AUDIO_DEFAULTS.volume;
    masterGain.connect(context.destination);
    return context;
  }

  async function resume() {
    const audioContext = ensureContext();
    if (audioContext.state === "suspended") await audioContext.resume();
    return audioContext;
  }

  function stop() {
    for (const source of activeSources) {
      try { source.stop(); } catch { /* already ended */ }
    }
    activeSources.clear();
  }

  function scheduleTimeline(audioContext, timeline, options, onEvent) {
    const startAt = audioContext.currentTime + 0.02;
    masterGain.gain.setValueAtTime(options.volume, startAt);

    timeline.forEach((event, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const start = startAt + event.offsetMs / 1_000;
      const end = start + event.durationMs / 1_000;
      const attack = Math.min(options.attackMs / 1_000, Math.max(0.001, (end - start) / 3));
      const release = Math.min(options.releaseMs / 1_000, Math.max(0.001, (end - start) / 3));

      oscillator.type = options.waveform;
      oscillator.frequency.setValueAtTime(options.toneHz, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(1, start + attack);
      gain.gain.setValueAtTime(1, Math.max(start + attack, end - release));
      gain.gain.linearRampToValueAtTime(0, end);
      oscillator.connect(gain);
      gain.connect(masterGain);
      oscillator.start(start);
      oscillator.stop(end + 0.005);
      activeSources.add(oscillator);
      oscillator.addEventListener?.("ended", () => activeSources.delete(oscillator));
      onEvent?.({ ...event, index, startAtMs: event.offsetMs, endAtMs: event.offsetMs + event.durationMs });
    });

    return timeline.reduce((end, event) => Math.max(end, event.offsetMs + event.durationMs), 0);
  }

  async function playPattern(morse, { wpm, characterWpm, timingMode = "standard", toneHz, volume, waveform, attackMs, releaseMs, onEvent } = {}) {
    const audioContext = await resume();
    const timing = resolveTiming({ wpm, characterWpm, mode: timingMode });
    const options = normalizeAudioOptions({ toneHz, volume, waveform, attackMs, releaseMs });
    const timeline = buildCharacterTimeline(morse, timing);
    const durationMs = scheduleTimeline(audioContext, timeline, options, onEvent);
    return { timing, durationMs, events: timeline };
  }

  async function playMessage(morseMessage, { wpm, characterWpm, timingMode = "standard", toneHz, volume, waveform, attackMs, releaseMs, onEvent } = {}) {
    const audioContext = await resume();
    const timing = resolveTiming({ wpm, characterWpm, mode: timingMode });
    const options = normalizeAudioOptions({ toneHz, volume, waveform, attackMs, releaseMs });
    const timeline = buildMessageTimeline(morseMessage, timing);
    const durationMs = scheduleTimeline(audioContext, timeline, options, onEvent);
    return { timing, durationMs, events: timeline };
  }

  function setMasterVolume(volume) {
    const audioContext = ensureContext();
    const normalized = clamp(Number(volume) || 0, 0, 1);
    masterGain.gain.setTargetAtTime(normalized, audioContext.currentTime, 0.01);
  }

  function close() {
    stop();
    if (context && context.close) context.close();
    context = null;
    masterGain = null;
  }

  return Object.freeze({ ensureContext, resume, playPattern, playMessage, stop, setMasterVolume, close });
}
