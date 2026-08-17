import catalog from "./characters.json";

const CHARACTERS = Object.freeze(catalog.characters.map((character) => Object.freeze({ ...character })));

const BY_ID = new Map(CHARACTERS.map((character) => [character.id, character]));
const BY_SYMBOL = new Map(CHARACTERS.map((character) => [character.symbol, character]));
const BY_MORSE = new Map(
  CHARACTERS.filter((character) => character.category !== "prosign").map((character) => [character.morse, character])
);

export const MORSE_CATEGORIES = Object.freeze({
  LETTER: "letter",
  NUMBER: "number",
  PUNCTUATION: "punctuation",
  PROSIGN: "prosign"
});

export function getAllCharacters() {
  return [...CHARACTERS];
}

export function getCharacterById(id) {
  return id ? BY_ID.get(id) ?? null : null;
}

export function getCharacterBySymbol(symbol) {
  if (!symbol) return null;
  return BY_SYMBOL.get(symbol.toUpperCase()) ?? BY_SYMBOL.get(symbol) ?? null;
}

export function getCharacterByMorse(morse) {
  return morse ? BY_MORSE.get(morse) ?? null : null;
}

export function getCharactersByCategory(category) {
  return CHARACTERS.filter((character) => character.category === category);
}

export function getLetters() {
  return getCharactersByCategory(MORSE_CATEGORIES.LETTER);
}

export function getNumbers() {
  return getCharactersByCategory(MORSE_CATEGORIES.NUMBER);
}

export function getPunctuation() {
  return getCharactersByCategory(MORSE_CATEGORIES.PUNCTUATION);
}

export function getProsigns() {
  return getCharactersByCategory(MORSE_CATEGORIES.PROSIGN);
}

export function isValidMorsePattern(morse) {
  return typeof morse === "string" && morse.length > 0 && /^[.-]+$/.test(morse);
}

export function isCanonicalCharacter(character) {
  return Boolean(
    character &&
      typeof character.id === "string" &&
      typeof character.symbol === "string" &&
      isValidMorsePattern(character.morse) &&
      Object.values(MORSE_CATEGORIES).includes(character.category)
  );
}

export function getCatalogStats() {
  return Object.fromEntries(
    Object.values(MORSE_CATEGORIES).map((category) => [
      category,
      CHARACTERS.filter((character) => character.category === category).length
    ])
  );
}
