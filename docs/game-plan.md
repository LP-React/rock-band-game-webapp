# Guitar rhythm game plan

Status: proposed production direction with a Canvas 2D/Web Audio example playing a real Dragonforce package with four imported MIDI difficulties, sustains, boost, health, and persistent controls. MIDI import uses the `midi-file` development dependency. See [project context](project-context.md) and [gameplay rules](gameplay-rules.md) for current implementation facts.

## Recommended foundation

| Responsibility | Recommendation | Reason |
| --- | --- | --- |
| Menus, catalog, settings, results | Existing React + TypeScript + Vite | Preserve the learning focus and tooling. |
| Highway, notes, effects | PixiJS mounted through a React component | Dedicated canvas rendering with perspective projection for a 2.5D highway. |
| Audio transport/mixing | Native Web Audio API | Schedule synchronized stems and control guitar gain separately. |
| Gameplay rules | Independent TypeScript modules | Test judgment/scoring without React or graphics. |
| Background video | Muted HTML video behind the canvas | Decorative video follows the song timeline. |
| Menu animation | CSS initially | Avoid unnecessary dependencies. |
| Future validation | Vitest for engine rules and browser integration checks | Test boundaries, chords, sustains, scoring, and pause/resume. |

True 3D is not required for perspective or disc notes. Reconsider Three.js only for actual 3D scene requirements. Do not add Phaser, Tone.js, Howler, state libraries, or a React/Pixi wrapper without a concrete need. Performance must be measured, not assumed.

## Timing and input

- Schedule decoded song stems against one AudioContext start time. Derive song position from the audio timeline and saved playback offset; never accumulate frame deltas as the song clock.
- Each rendering frame projects visible notes from their target time relative to song position. Dropped frames must not shift later notes.
- Map input event timestamps to the audio timeline. Where usable, `getOutputTimestamp()` connects audio output and the performance clock. Define separate input and visual calibration offsets and test their signs.
- Hit windows use milliseconds independently of highway speed/FPS. Difficulty charts change musical patterns, not merely scroll speed.
- Ignore repeated keydowns; track fresh color presses, held keys, and releases. Explicitly define chord and sustain rules.
- Pause audio, engine, and video together. Recreate buffer sources at the saved offset when resuming/restarting. Clear held keys on focus loss and pause hidden tabs.
- Start/resume audio after a user gesture. Calibrate latency rather than promise identical device/browser behavior.

## Reactive guitar audio

Faithful audio needs an accompaniment stem and an isolated guitar stem sharing a time origin. Both continue playing in sync. Misses lower guitar gain with a short ramp; successful play restores it according to explicit recovery rules. Do not restart the guitar recording on each hit. Hit/miss effects use a separate gain path.

A mixed MP3 supports synchronized rhythm play but ordinary playback controls cannot independently mute its guitar. Describe that as simplified audio behavior. Offline source separation may help prepare assets but has quality limitations and is not part of the browser runtime.

Decode only the selected song and release previous buffers. Measure memory: decoded stems are much larger than compressed files. Verify duration, leading silence, codec behavior, and stem alignment using actual assets. Stop previews before starting gameplay.

## Song pipeline

Initial proposal: a curated static catalog served with the app, without an upload backend. A versioned song package contains:

- Metadata: stable ID, title, artist, duration, artwork, preview range, asset references, and source/license information.
- Audio: accompaniment and optional isolated guitar, with explicit reactive-audio capability metadata.
- Per-difficulty charts: note times, lane combinations, sustain durations, strum/HOPO/tap flags, and boost phrases.
- Timing: tempo changes, beats, and explicit chart/audio offset. Normalized notes use seconds from the audio origin.
- Optional video with its own offset and still-image fallback.

Use original community packages as canonical input; do not require proprietary song files. The prototype's generated JSON is transitional; a shared loader should normalize MIDI/`.chart` into runtime objects in memory, with any persistent cache optional. Validate finite times, ordering, lanes, chord representation, sustain lengths, and asset references before play. Retain tempo/beat metadata even when gameplay uses precomputed seconds. See [song architecture](song-architecture.md).

An MP3 does not contain a playable chart. Beat detection alone cannot produce a faithful guitar arrangement or suitable difficulty patterns. Author or obtain charts and verify them through listening/playtesting. If existing `.chart` / MIDI packs are selected, research their specifications and build an import adapter separately; compatibility is not currently promised.

Local file selection may be added later. Public uploads, persistent storage, and server processing need separate scope decisions. Source owned or suitably licensed music, stems, charts, artwork, and video; do not assume commercial assets are available for distribution.

## Gameplay contract

- Five colored frets with direct keyboard presses, as selected by the user. No separate strum key is required. Multi-color notes require their matching color presses within the judgment window.
- Define chords, sustain ticks/releases, misses, and extra color presses deterministically.
- Tune base score, multiplier thresholds/cap, streak resets, boost phrases, energy gain/drain, activation, and boost scoring against the selected reference. Current provisional values are documented in [gameplay rules](gameplay-rules.md).
- Choose a concrete reference game/preset; Guitar Hero, Rock Band, and Clone Hero are not one identical ruleset.
- Assess open notes, extended sustains, whammy, failure meter, and controllers before claiming exact parity. Their first-phase inclusion is not established.
- Difficulty names may be Easy/Medium/Hard/Expert; show only supplied charts. Each difficulty needs its own authored arrangement.

## Delivery sequence

1. Timing prototype: one short authorized song, chart, five lanes, input, calibration, and pause/restart. Verify alignment at different frame rates.
2. Playable slice: chords, sustains, control mode, HOPO/tap rules, misses, streak/multiplier, boost, results, and guitar gain behavior.
3. Catalog: expand toward five songs with verified difficulty charts, selection, artwork, and audio/video previews.
4. Presentation and optimization: perspective highway, disc notes, effects, rock menus, video, loading, and quality settings.

Before catalog expansion, verify deterministic judgment/scoring, pause/resume alignment, guitar recovery, remappable controls, and keyboard chord limitations. Measure frame time and memory on agreed desktop hardware with video on/off. Smooth 60 FPS is a provisional target, not a measured result. Verify responsive menus and keyboard navigation; mobile gameplay is not an established requirement.

## Open decisions

1. Exact reference scoring/timing rules adapted to the selected direct-key controls.
2. Prototype song and availability of authorized stems/charts.
3. Minimum browsers/devices and need for local custom songs in phase one.

## References

- [PixiJS ticker](https://pixijs.com/8.x/guides/components/application/ticker-plugin)
- [Audio scheduling](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/start)
- [Audio clock](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/currentTime)
- [Output timestamp mapping](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/getOutputTimestamp)
- [Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)
