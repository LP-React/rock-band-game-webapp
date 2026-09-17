# Song integration

The current offline JSON import is a prototype implementation. The selected direction is to read original community packages through generic adapters without requiring new song files; see [song architecture](song-architecture.md).

## Selected source

Use the extracted `src/musics/Dragonforce - Through The Fire & Flames (Neversoft)` folder supplied by the user. It has `album.jpg`, `notes.mid`, `song.ini`, `song.opus`, `guitar.opus`, `preview.opus`, and `desktop.ini`. A ZIP archive itself is not present; its extracted folder is.

The sibling SNG declares the same six asset files (INI metadata is stored in its header). SHA-256 comparison of every streamed SNG file against the extracted counterpart confirmed identical bytes. The folder avoids runtime container extraction and keeps chart/audio inspection straightforward. The original files and SNG are preserved. `desktop.ini` is not game data; preview audio is not yet used.

## Data flow and separation

1. `scripts/midi-chart.mjs` parses format-1 MIDI with `midi-file`, accumulates absolute ticks, builds a tempo timeline, pairs note-on/off (including zero-velocity note-on releases), and converts tick positions into seconds.
2. `scripts/import-dragonforce.mjs` reads this folder's INI, applies delay and sustain cutoff, strips markup from the charter display name, and writes normalized chart JSON and small metadata JSON. Run `pnpm import:dragonforce` after changing source chart/metadata. Outputs are data artifacts required by the application, not compiled build output.
3. `src/songs/types.ts` defines the normalized song contract. `catalog.ts` references Vite asset URLs and fetches chart JSON separately from JavaScript.
4. `src/songs/audio-loader.ts` fetches/decodes accompaniment and guitar sequentially, reports unsupported decoding, and checks their duration agreement.
5. `src/game/prototype.ts` orchestrates playback and direct-key judgment independently of the React screen. Both decoded stems are scheduled against one shared audio start time. Misses lower guitar gain without restarting it.
6. `src/game/renderer.ts` draws notes and beat lines using song time and the imported tempo-derived beats. `demo-audio.ts` isolates the old synthetic fixture used by engine tests.

The internal chart schema is version 1. A note group has `time` in audio-origin seconds, `lanes` numbered 0-4, and `durations` aligned with those lanes. Notes with the same MIDI tick form a group; different difficulty ranges form separate charts. Imported guitar modifier pitches are not rendered as colored notes.

## Actual imported data

| Difficulty | Groups | Colored notes |
| --- | --- | --- |
| Easy | 1102 | 1103 |
| Medium | 1823 | 1900 |
| Hard | 2723 | 2835 |
| Expert | 3722 | 3916 |

Metadata duration is 442.363 seconds. Runtime end uses decoded audio duration rather than trusting metadata alone. MIDI resolution is 480 ticks/quarter; there are 775 tempo events; the first note is at 2.414 seconds. All difficulty patterns come from the package rather than automatic simplification. No chart/audio offset was invented; this INI has no delay field, so zero is used.

## Limits and next steps

This is a local example integration, not generic SNG/ZIP upload support or complete Clone Hero compatibility. Sustain lengths drive hold/release judgment and time-based scoring. MIDI pitch 116 supplies 25 Star Power phrases as `boostPhrases` with start/end times; successful phrases charge boost. HOPO/strum markers do not change direct-key controls. Future imports must explicitly handle unsupported open notes/SysEx modifiers before claiming universal compatibility. See [gameplay rules](gameplay-rules.md).

Decoded full-song buffers consume much more RAM than the approximately 8.8 MB of compressed stems. Only the current song is cached, but streaming/chunked transport or a memory budget needs evaluation before a larger catalog or mobile support. Fetching is sequential to avoid simultaneous compressed-data allocations. No background video is included in this package/integration.

Validation: nine tests cover tempo conversion, delay, note releases, durations, imported counts/boost phrases, keyboard canvas focus, direct-key windows, chords, wrong colors, repeat suppression, restart, sustains, boost charging/drain, and remapping. Build/lint pass; chart JSON is a separate asset. Browser verified actual Opus decode/start, rendering, stop, difficulty selection, settings, and responsive layout. Listening quality and full-song synchronization over several minutes still need device playtesting.

## References

- [MIDI five-fret track conventions](https://thenathannator.github.io/GuitarGame_ChartFormats/Chart-File-Formats/mid-format/Tracks/5-Fret-Guitar/)
- [SNG format specification](https://github.com/mdsitton/SngFileFormat)
- [midi-file parser](https://github.com/carter-thaxton/midi-file)
