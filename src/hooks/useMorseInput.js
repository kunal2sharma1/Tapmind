import { useCallback, useEffect, useRef, useState } from "react";
import {
  createMorseInputSession,
  MORSE_INPUT_DEFAULTS,
  MORSE_INPUT_DEVICES,
  normalizePressDuration
} from "../modules/morse/input";

export default function useMorseInput(options = {}) {
  const sessionRef = useRef(null);
  const pressStartedAt = useRef(null);
  const [snapshot, setSnapshot] = useState(() => ({
    sequence: "",
    isPressed: false,
    activeDevice: null,
    events: [],
    timing: null,
    calibration: null
  }));

  if (sessionRef.current === null) {
    sessionRef.current = createMorseInputSession({
      ...MORSE_INPUT_DEFAULTS,
      ...options
    });
  }

  const syncSnapshot = useCallback(() => {
    setSnapshot(sessionRef.current.snapshot());
  }, []);

  const startPress = useCallback((device = MORSE_INPUT_DEVICES.KEYBOARD) => {
    if (pressStartedAt.current !== null) return;
    pressStartedAt.current = performance.now();
    sessionRef.current.startPress({
      device,
      timestamp: pressStartedAt.current
    });
    syncSnapshot();
  }, [syncSnapshot]);

  const endPress = useCallback(() => {
    if (pressStartedAt.current === null) return null;

    const timestamp = performance.now();
    pressStartedAt.current = null;
    const event = sessionRef.current.endPress({ timestamp });
    syncSnapshot();
    return event;
  }, [syncSnapshot]);

  const setCalibration = useCallback((nextCalibration) => {
    const calibration = sessionRef.current.setCalibration(nextCalibration);
    syncSnapshot();
    return calibration;
  }, [syncSnapshot]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.code !== "Space" || event.repeat) return;
      event.preventDefault();
      startPress(MORSE_INPUT_DEVICES.KEYBOARD);
    }

    function handleKeyUp(event) {
      if (event.code !== "Space") return;
      event.preventDefault();
      endPress();
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [startPress, endPress]);

  const handlePointerDown = useCallback((event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    startPress(
      event.pointerType === "touch"
        ? MORSE_INPUT_DEVICES.TOUCH
        : MORSE_INPUT_DEVICES.MOUSE
    );
  }, [startPress]);

  const handlePointerUp = useCallback((event) => {
    event.preventDefault();
    endPress();
  }, [endPress]);

  const handlePointerCancel = useCallback((event) => {
    event.preventDefault();
    endPress();
  }, [endPress]);

  const resetInput = useCallback(() => {
    sessionRef.current.reset();
    pressStartedAt.current = null;
    syncSnapshot();
  }, [syncSnapshot]);

  return {
    inputSequence: snapshot.sequence,
    isPressed: snapshot.isPressed,
    activeDevice: snapshot.activeDevice,
    events: snapshot.events,
    timing: snapshot.timing,
    calibration: snapshot.calibration,
    startPress,
    endPress,
    setCalibration,
    handlePointerDown,
    handlePointerUp,
    handlePointerCancel,
    resetInput,
    normalizePressDuration
  };
}
