import { useCallback, useEffect, useRef, useState } from "react";

const DOT_THRESHOLD_MS = 200;
const MAX_SEQUENCE_LENGTH = 10;

export default function useMorseInput() {
  const [inputSequence, setInputSequence] = useState("");
  const [isPressed, setIsPressed] = useState(false);
  const pressStartTime = useRef(null);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.code !== "Space" || event.repeat) return;
      event.preventDefault();
      pressStartTime.current = Date.now();
      setIsPressed(true);
    }

    function handleKeyUp(event) {
      if (event.code !== "Space") return;
      event.preventDefault();

      if (pressStartTime.current === null) return;

      const pressDuration = Date.now() - pressStartTime.current;
      const symbol = pressDuration < DOT_THRESHOLD_MS ? "." : "-";

      setInputSequence((previous) => {
        if (previous.length >= MAX_SEQUENCE_LENGTH) return previous;
        return previous + symbol;
      });

      pressStartTime.current = null;
      setIsPressed(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const resetInput = useCallback(() => {
    setInputSequence("");
    setIsPressed(false);
    pressStartTime.current = null;
  }, []);

  return { inputSequence, isPressed, resetInput };
}
