import { useState, useEffect, useRef } from "react";

const DOT_THRESHOLD_MS = 200; // presses shorter than this = dot

export default function useMorseInput() {
  const [inputSequence, setInputSequence] = useState("");
  const [isPressed, setIsPressed]         = useState(false);

  // useRef so the keydown handler always sees the latest timestamp
  const pressStartTime = useRef(null);

  useEffect(() => {
    function handleKeyDown(e) {
      // Only spacebar; ignore auto-repeat (held key)
      if (e.code !== "Space" || e.repeat) return;
      e.preventDefault(); // stop page scroll

      pressStartTime.current = Date.now();
      setIsPressed(true);
    }

    function handleKeyUp(e) {
      if (e.code !== "Space") return;
      e.preventDefault();

      if (pressStartTime.current === null) return;

      const pressDuration = Date.now() - pressStartTime.current;
      const symbol = pressDuration < DOT_THRESHOLD_MS ? "." : "-";

      setInputSequence((prev) => {
        if (prev.length >= 10) return prev;
        return prev + symbol;
      });
      pressStartTime.current = null;
      setIsPressed(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup",   handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup",   handleKeyUp);
    };
  }, []); // empty deps — handlers reference refs, not stale closures

  // Clears sequence and resets press state (called by Retry)
  function resetInput() {
    setInputSequence("");
    setIsPressed(false);
    pressStartTime.current = null;
  }

  return { inputSequence, isPressed, resetInput };
}
