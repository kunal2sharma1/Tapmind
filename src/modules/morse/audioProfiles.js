import { AUDIO_DEFAULTS } from "./audio";

export const MORSE_AUDIO_PROFILES = Object.freeze({
  BEGINNER: Object.freeze({
    id: "beginner",
    label: "Beginner",
    wpm: 8,
    characterWpm: 15,
    timingMode: "farnsworth",
    toneHz: 600,
    volume: 0.15,
    waveform: "sine"
  }),
  COMFORTABLE: Object.freeze({
    id: "comfortable",
    label: "Comfortable",
    wpm: 10,
    characterWpm: 15,
    timingMode: "farnsworth",
    toneHz: 600,
    volume: 0.15,
    waveform: "sine"
  }),
  STANDARD: Object.freeze({
    id: "standard",
    label: "Standard",
    wpm: 15,
    characterWpm: 15,
    timingMode: "standard",
    toneHz: AUDIO_DEFAULTS.toneHz,
    volume: AUDIO_DEFAULTS.volume,
    waveform: AUDIO_DEFAULTS.waveform
  }),
  FAST: Object.freeze({
    id: "fast",
    label: "Fast",
    wpm: 20,
    characterWpm: 20,
    timingMode: "standard",
    toneHz: 600,
    volume: 0.15,
    waveform: "sine"
  }),
  EXPERT: Object.freeze({
    id: "expert",
    label: "Expert",
    wpm: 30,
    characterWpm: 30,
    timingMode: "standard",
    toneHz: 600,
    volume: 0.15,
    waveform: "sine"
  })
});

export function getAudioProfile(id) {
  return Object.values(MORSE_AUDIO_PROFILES).find((profile) => profile.id === id) ?? MORSE_AUDIO_PROFILES.STANDARD;
}

export function getAudioProfiles() {
  return Object.values(MORSE_AUDIO_PROFILES);
}
