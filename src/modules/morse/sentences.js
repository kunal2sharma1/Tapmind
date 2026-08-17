import sentencesData from "./sentences.json" with { type: "json" };
import { symbolToMorse } from "./characters";

export const MORSE_SENTENCE_MODES = Object.freeze({
  RECOGNITION: "sentence-recognition",
  AUDIO_RECOGNITION: "sentence-audio-recognition",
  RECALL: "sentence-recall",
  AUDIO_RECALL: "sentence-audio-recall"
});

export const MORSE_SENTENCE_DIFFICULTIES = Object.freeze({
  FOUNDATION: 1,
  BASIC: 2,
  OPERATIONAL: 3,
  ADVANCED: 4
});

const SENTENCE_WORD_GAP = " / ";

function normalizeText(text) {
  return String(text ?? "").trim().replace(/\s+/g, " ").toUpperCase();
}

export function encodeMorseText(text) {
  const normalized = normalizeText(text);
  if (!normalized) throw new Error("Sentence text is required.");

  const words = normalized.split(" ");
  const encodedWords = words.map((word) => {
    return [...word].map((character) => {
      const morse = symbolToMorse(character);
      if (!morse) throw new Error(`Unsupported character in sentence: ${character}`);
      return morse;
    }).join(" ");
  });

  return encodedWords.join(SENTENCE_WORD_GAP);
}

function toSentenceRecord(item) {
  const text = normalizeText(item.text);
  const morse = encodeMorseText(text);
  return Object.freeze({
    id: item.id,
    text,
    morse,
    level: item.level,
    difficulty: item.difficulty,
    tags: [...(item.tags ?? [])],
    wordCount: text.split(" ").length,
    characterCount: text.replace(/ /g, "").length
  });
}

export const MORSE_SENTENCES = Object.freeze(
  sentencesData.sentences.map(toSentenceRecord)
);

export function getSentences({ level = null, maxDifficulty = null, tags = [] } = {}) {
  return MORSE_SENTENCES.filter((sentence) => {
    if (level && sentence.level !== level) return false;
    if (Number.isFinite(maxDifficulty) && sentence.difficulty > maxDifficulty) return false;
    if (tags.length && !tags.some((tag) => sentence.tags.includes(tag))) return false;
    return true;
  });
}

export function getSentenceById(id) {
  return MORSE_SENTENCES.find((sentence) => sentence.id === id) ?? null;
}

export function getSentenceDifficulty(sentence) {
  if (!sentence) return MORSE_SENTENCE_DIFFICULTIES.BASIC;
  return sentence.difficulty;
}

export function getSentenceMorseWords(sentence) {
  if (!sentence) return [];
  return sentence.morse.split(SENTENCE_WORD_GAP);
}
