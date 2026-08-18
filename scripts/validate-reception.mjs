import { buildReceptionSession, getReceptionMessages, scoreReceptionCopy } from "../src/modules/morse/reception.js";
import { encodeTextToMorse, normalizeText } from "../src/modules/morse/textEncoding.js";

const messages = getReceptionMessages();
if (messages.length < 5) throw new Error("Reception corpus must contain at least five messages.");

for (const message of messages) {
  if (!message.id || !message.text) throw new Error("Reception messages need stable IDs and text.");
  if (normalizeText(message.text) !== message.text) throw new Error(`Reception text must be normalized: ${message.id}`);
  const morse = encodeTextToMorse(message.text);
  if (!morse) throw new Error(`Reception message produced empty Morse: ${message.id}`);
}

const session = buildReceptionSession({ count: 5, maxDifficulty: 4, seed: 42, wpm: 12 });
if (session.messages.length !== 5) throw new Error("Reception session must generate exactly five messages.");
if (!session.messages.every((item) => item.encoded?.morse)) throw new Error("Every reception message must have Morse audio data.");

const perfect = scoreReceptionCopy("SEND FIVE", "SEND FIVE", 30_000);
if (perfect.characterAccuracy !== 100 || perfect.wordAccuracy !== 100 || !perfect.passed) {
  throw new Error("Perfect reception copy should score 100% and pass.");
}

const imperfect = scoreReceptionCopy("SEND FIVE", "SEND FVE", 30_000);
if (imperfect.characterAccuracy >= 100) throw new Error("Imperfect reception copy must lose character accuracy.");

console.log("Reception validation passed.");
