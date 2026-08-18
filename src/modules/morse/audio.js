import { buildCharacterTimeline, buildMessageTimeline, resolveTiming } from "./timing";
import { getRealismProfile, transformTimelineForRealism, REALISM_LEVELS, calculateSignalQuality } from "./realisticMorse";

export const AUDIO_DEFAULTS = Object.freeze({
  toneHz: 600,
  volume: 0.15,
  waveform: "sine",
  attackMs: 4,
  releaseMs: 8,
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

function createNoiseBuffer(audioContext, durationSeconds) {
  const frameCount = Math.max(1, Math.ceil(audioContext.sampleRate * durationSeconds));
  const buffer = audioContext.createBuffer(1, frameCount, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < frameCount; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }
  return buffer;
}

export function createMorseAudioEngine({ AudioContextClass } = {}) {
  let context = null;
  let masterGain = null;
  let activeSources = new Set();
  let activeNodes = new Set();

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
    for (const node of activeNodes) {
      try { node.disconnect(); } catch { /* already disconnected */ }
    }
    activeSources.clear();
    activeNodes.clear();
  }

  function scheduleBackgroundEffects(audioContext, options, realism, startAt, durationMs) {
    const created = [];
    const durationSeconds = Math.max(0.05, durationMs / 1_000);

    if (realism.noiseLevel > 0) {
      const source = audioContext.createBufferSource();
      const noiseGain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      source.buffer = createNoiseBuffer(audioContext, durationSeconds + 0.2);
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2_800, startAt);
      noiseGain.gain.setValueAtTime(realism.noiseLevel * options.volume, startAt);
      source.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(masterGain);
      source.start(startAt);
      source.stop(startAt + durationSeconds + 0.05);
      created.push(source, noiseGain, filter);
      activeSources.add(source);
    }

    if (realism.interferenceLevel > 0) {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(Math.max(45, options.toneHz / 2.4), startAt);
      gain.gain.setValueAtTime(realism.interferenceLevel * options.volume, startAt);
      oscillator.connect(gain);
      gain.connect(masterGain);
      oscillator.start(startAt);
      oscillator.stop(startAt + durationSeconds + 0.05);
      created.push(oscillator, gain);
      activeSources.add(oscillator);
    }

    return created;
  }

  function scheduleTimeline(audioContext, timeline, options, onEvent, realism) {
    const startAt = audioContext.currentTime + 0.02;
    const signalQuality = calculateSignalQuality(realism);
    const normalizedRealism = getRealismProfile(realism?.level ?? REALISM_LEVELS.CLEAN, realism);
    const signalVolumeScale = normalizedRealism.volumeScale;
    masterGain.gain.setValueAtTime(options.volume * signalVolumeScale, startAt);

    const durationMs = timeline.reduce((end, event) => Math.max(end, event.offsetMs + event.durationMs), 0);
    scheduleBackgroundEffects(audioContext, options, normalizedRealism, startAt, durationMs);

    timeline.forEach((event, index) => {
      if (event.realism?.dropped) {
        onEvent?.({ ...event, index, dropped: true, signalQuality });
        return;
      }

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

      if (normalizedRealism.fadeDepth > 0) {
        const fadePhase = start * normalizedRealism.fadeRateHz * Math.PI * 2;
        const fade = clamp(1 - normalizedRealism.fadeDepth * (0.5 + 0.5 * Math.sin(fadePhase)), 0.15, 1);
        gain.gain.setValueAtTime(fade, start + attack);
      }

      oscillator.connect(gain);
      gain.connect(masterGain);
      oscillator.start(start);
      oscillator.stop(end + 0.005);
      activeSources.add(oscillator);
      oscillator.addEventListener?.("ended", () => activeSources.delete(oscillator));

      onEvent?.({
        ...event,
        index,
        dropped: false,
        signalQuality,
        startAtMs: event.offsetMs,
        endAtMs: event.offsetMs + event.durationMs,
      });
    });

    return durationMs;
  }

  async function playPattern(morse, {
    wpm,
    characterWpm,
    timingMode = "standard",
    toneHz,
    volume,
    waveform,
    attackMs,
    releaseMs,
    realism = { level: REALISM_LEVELS.CLEAN },
    seed = 0,
    onEvent,
  } = {}) {
    const audioContext = await resume();
    const timing = resolveTiming({ wpm, characterWpm, mode: timingMode });
    const options = normalizeAudioOptions({ toneHz, volume, waveform, attackMs, releaseMs });
    const profile = getRealismProfile(realism.level, realism);
    const timeline = transformTimelineForRealism(buildCharacterTimeline(morse, timing), profile, seed);
    const durationMs = scheduleTimeline(audioContext, timeline, options, onEvent, profile);
    return { timing, durationMs, events: timeline, realism: profile, signalQuality: calculateSignalQuality(profile) };
  }

  async function playMessage(morseMessage, {
    wpm,
    characterWpm,
    timingMode = "standard",
    toneHz,
    volume,
    waveform,
    attackMs,
    releaseMs,
    realism = { level: REALISM_LEVELS.CLEAN },
    seed = 0,
    onEvent,
  } = {}) {
    const audioContext = await resume();
    const timing = resolveTiming({ wpm, characterWpm, mode: timingMode });
    const options = normalizeAudioOptions({ toneHz, volume, waveform, attackMs, releaseMs });
    const profile = getRealismProfile(realism.level, realism);
    const timeline = transformTimelineForRealism(buildMessageTimeline(morseMessage, timing), profile, seed);
    const durationMs = scheduleTimeline(audioContext, timeline, options, onEvent, profile);
    return { timing, durationMs, events: timeline, realism: profile, signalQuality: calculateSignalQuality(profile) };
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
