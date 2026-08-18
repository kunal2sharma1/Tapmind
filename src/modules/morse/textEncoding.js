import { getCharacterBySymbol } from "./characters";

export function normalizeText(value) {
  return String(value ?? "")
    .toUpperCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function encodeTextToMorse(value) {
  const normalized = normalizeText(value);
  if (!normalized) return "";

  return normalized
    .split(" ")
    .map((word) => word
      .split("")
      .map((symbol) => {
        const character = getCharacterBySymbol(symbol);
        if (!character) throw new Error(`Unsupported Morse character: ${symbol}`);
        return character.morse;
      })
      .join(" / "))
    .join(" / ");
}

export const CHARACTERS_BY_SYMBOL = Object.freeze(
  Object.fromEntries(
    ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","0","1","2","3","4","5","6","7","8","9",".",",","?","'","!","/","(",")","&",":",";","\"","$","@","=","+","-"].map((symbol) => [symbol, getCharacterBySymbol(symbol)])
  )
);
