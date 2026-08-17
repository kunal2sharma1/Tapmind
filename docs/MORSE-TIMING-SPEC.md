# TapMind Morse Timing Specification

## Status

Phase 1.2 of the Morse Master Product upgrade.

## Timing model

TapMind uses the standard PARIS 50-unit convention for WPM. One unit is `1.2 / WPM` seconds. Standard Morse timing uses:

- dot: 1 unit
- dash: 3 units
- gap between elements in a character: 1 unit
- gap between characters: 3 units
- gap between words: 7 units

The ITU International Morse Code recommendation is the standards reference for the code itself. TapMind's timing engine is implemented around the conventional PARIS 50-unit definition used by ARRL Morse timing guidance. citeturn817154search0turn593267search3

## Farnsworth timing

TapMind supports separate overall speed and character speed. When the overall speed is lower than the character speed, the character elements remain at the character speed and extra time is distributed across inter-character and inter-word spacing. This keeps character rhythm intact while giving beginners more time between characters. ARRL describes this as the Farnsworth technique. citeturn817154search24turn817154search25

For the standard 50-unit PARIS word, 31 units are element/intra-element timing and 19 units are inter-character/inter-word spacing. TapMind distributes the additional Farnsworth delay across those 19 spacing units. citeturn593267search3

## Implementation

The timing engine lives in `src/modules/morse/timing.js` and provides:

- standard timing profiles
- Farnsworth timing profiles
- WPM validation
- configurable character speed
- character timelines for audio/input scheduling
- timing constants in one place

The UI is intentionally not changed in this phase. Audio playback, timed input calibration, and WPM controls will consume this timing layer in later phases.
