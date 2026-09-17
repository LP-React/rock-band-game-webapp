# Chart and audio findings

## Verified structure

The official Clone Hero wiki describes separate `notes.chart`, song audio, and `song.ini` metadata, and points to the Guitar Game Chart Formats documentation for stem naming. This documents a compatible ecosystem format; it is not access to Clone Hero's private implementation.

The format reference describes metadata in `[Song]`, tempo/time signatures in `[SyncTrack]`, global events in `[Events]`, and separate instrument/difficulty tracks. A note event has a tick position, note identifier, and length. Musical time uses ticks per quarter note (`Resolution`); tempo changes determine conversion to seconds. For constant 120 BPM and resolution 192, 192 ticks span 0.5 seconds. With tempo changes, conversion must accumulate each tempo segment.

Frets are gameplay identifiers, not fixed musical pitches or note samples. The chart specifies when/what to play; the recording supplies the musical sound. Audio conventions distinguish `song` (background or full mix) from `guitar` (lead guitar or full mix when alone). Merely renaming a mixed recording `guitar` does not isolate its guitar.

For our web engine, normalize authored/imported notes into seconds and lane groups, retaining the tempo map for beat lines. Use per-difficulty chart data. The current example now uses an offline MIDI adapter; `.chart` import remains unimplemented. See [song integration](song-integration.md).

## Synthetic fixture (retained for tests)

`src/game/chart.ts` holds gameplay note times and lane combinations. The independent `riffPitches` arrangement is used only to synthesize demonstration audio. Both audio buffers are prebuilt and scheduled at one shared start time, rather than creating a musical sound on each successful keypress.

The accompaniment continues while misses set guitar gain to zero and completed note groups restore it. This tests our proposed stem-mixing architecture, not exact Clone Hero attenuation/recovery rules. The audio is synthetic and does not represent a real recorded guitar performance.

The Canvas 2D renderer draws a projected five-lane board and layered elliptical note discs with metallic bases, colored bodies, white caps, and hit glows. CSS styles the page layout, not moving notes. Original PNG sprite atlases can replace drawn discs later through the same projection; no reference-game image assets were copied.

Controls: press A/S/D/F/G directly at the receptor line; space is ignored. Multi-color groups accept one press per required color inside the timing window and award score/streak once complete. An incomplete group expires as a miss. Holding a key does not automatically hit later notes; repeated keydown events are ignored. The 140ms hit window, scoring, and ten-hit multiplier steps are experimental values. No sustain, boost, HOPO/tap, calibration, background video, custom uploads, or controls editor is implemented.

Checks: `pnpm build`, `pnpm lint`, and `pnpm test`. Tests use mocked audio APIs and cannot certify audible quality, hardware latency, or frame-rate performance. Browser inspection verified desktop/390px rendering, start focus, and missed-note feedback. Losing focus stops rather than pauses the demo.

## Sources

- [Official Clone Hero conversion guide](https://wiki.clonehero.net/books/guides-and-tutorials/page/converting-gh3-chart-songs-for-use-with-clone-hero)
- [Chart format reference](https://github.com/TheNathannator/GuitarGame_ChartFormats)
- [Core chart infrastructure](https://raw.githubusercontent.com/TheNathannator/GuitarGame_ChartFormats/main/doc/FileFormats/.chart/Core%20Infrastructure.md)
- [Supported audio files](https://thenathannator.github.io/GuitarGame_ChartFormats/Chart-File-Formats/Supported-Audio-Files/)
