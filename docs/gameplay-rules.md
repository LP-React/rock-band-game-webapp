# Current gameplay rules

These values are provisional for direct keyboard play, not a claim of exact Guitar Hero or Clone Hero parity.

- Five configurable color keys; default A/S/D/F/G. Each note needs a fresh press. Chords need every matching color within the ±140ms hit window. Key repeat does not hit future notes.
- Completed heads score 50 points per colored note. Base multiplier rises every 10 completed groups, capped at 4×. Misses reset the streak and attenuate the synchronized guitar stem; completed groups restore it.
- Sustains longer than 80ms of remaining hold time score 10 points per second per lane, multiplied by the current base multiplier and boost. Releasing more than 40ms before the tail ends breaks the streak, reduces health, and attenuates guitar. Incomplete expired chords cancel their active tails.
- Imported MIDI note 116 defines boost phrases. All heads in a phrase must succeed, with no missed input or broken sustain recorded in that phrase. Each completed phrase grants 25% energy, capped at 100%, once its end and judgment grace have elapsed.
- Space activates with at least 50% energy. A subtle highway notice shows when boost is ready; no clickable activation button is shown. Boost doubles scoring (up to 8× heads), drains 12.5% energy per second, and ends at zero. Full energy therefore lasts eight seconds without additional charge. Star markers identify phrase notes; active boost uses cyan discs, glow, and sparks.
- Health starts at 65%. Each completed group adds 1.2 percentage points, and each miss or broken sustain removes 2.5 points. Health is clamped to 0–100%; zero ends the attempt. Restart resets score, energy, and health.
- Visual speed ranges from 0.5× to 2×, with a three-second approach at 1×. It does not change audio rate, chart timestamps, or hit windows.
- Key bindings, volume, and speed persist in localStorage when available. Five distinct letter, digit, arrow, or numpad keys are accepted; Space remains reserved for boost. Settings are available before play, volume during play.
- Escape toggles pause/resume from the keyboard. Audio sources stop during pause; new sources restart both stems together at the saved audio offset. Chart position, judgments, score, streak, health, and energy are preserved and do not advance while paused. The pause menu also offers restart or return to the current song menu.
- Releases during pause cause no penalty. Rehold the relevant keys before resuming an ongoing sustain; any missing sustain key is released at the frozen chart time when play resumes. Focus loss pauses automatically and clears held input.
- The game fills the browser viewport. Fullscreen uses the browser Fullscreen API and reports unsupported requests. Browsers may also exit fullscreen on Escape.

Input/output calibration and device playtesting remain necessary. Health, scoring, and energy thresholds can be tuned independently of community chart files.
