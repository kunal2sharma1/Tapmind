import catalog from "./characters.json";

export const MORSE_CHARACTERS = Object.freeze(catalog.characters);

const bySymbol = new Map(MORSE_CHARACTERS.map((character) => [character.symbol, character]));
const byMorse = new Map(MORSE_CHARACTERS.map((character) => [character.morse, character]));

export function getCharacterBySymbol(symbol) {
  if (typeof symbol !== "string") return null;
  return bySymbol.get(symbol.trim().toUpperCase()) ?? null;
}

export function getCharacterByMorse(morse) {
  if (typeof morse !== "string") return null;
  return byMorse.get(morse.trim()) ?? null;
}

export function getCharactersByCategory(category) {
  return MORSE_CHARACTERS.filter((character) => character.category === category);
}

export function getLetters() {
  return getCharactersByCategory("letter");
}

export function getNumbers() {
  return getCharactersByCategory("number");
}

export function getPunctuation() {
  return getCharactersByCategory("punctuation");
}

export function getProsigns() {
  return getCharactersByCategory("prosign");
}

export function isValidMorsePattern(morse) {
  return typeof morse === "string" && /^[.-]+$/.test(morse);
}

export function encodeSymbol(symbol) {
  return getCharacterBySymbol(symbol)?.morse ?? null;
}

export function decodeMorse(morse) {
  return getCharacterByMorse(morse)?.symbol ?? null;
}
