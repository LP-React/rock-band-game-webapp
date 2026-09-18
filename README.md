# Riff Lab

A React learning project using Next.js App Router for a browser-based, five-color guitar rhythm game inspired by Guitar Hero and Clone Hero.

The current catalog includes eight songs from Dragonforce, Cole Rolland, Linkin Park, Imperial Circus Dead Decadence, and Linked Horizon. Original community maps provide the notes and difficulties. A/S/D/F/G are the default color keys; no separate strum is required. Hold long notes to score tails. Complete starred phrases and press Space with half a bar for boost. Escape pauses/resumes without resetting progress; losing focus pauses automatically.

Home provides a playable vinyl disc, Play, configuration, and current controls. A compact music player offers previous/play-pause/next controls; the home attempts to start music muted, with an explicit sound button (play remains available if autoplay is blocked). A circular spectrum and disc pulse follow the actual audio intensity, including silent playback. Music follows shared volume and stops on leaving home. Play expands Solo and Friends options; Friends is pending. How to Play opens a keyboard-controls modal, while the colored key guide stays in the footer. Reduced-motion preferences keep the spectrum static. The library uses slanted song cards with individual palettes, a selected-song backdrop, search, metadata, actual difficulty selection, and 20-second audio samples. Use arrows to select and Enter to play. Samples stop when leaving the catalog; browsers that block autoplay offer a listening button.

Edit `src/songs/presentation.json` to curate colors, backgrounds, descriptions, and display metadata without modifying community packages or generated charts. See [song presentation](docs/song-presentation.md). Gameplay uses `/play` without song/difficulty parameters; direct access or a full reload returns to the catalog.

The full-viewport Canvas 2D highway includes perspective discs, sparks, a faded entrance, enlarged score/streak, vertical health, and a boost-ready notice. Configuration offers five remappable keys and visual speed; settings persist locally. Volume is adjustable during play. Fullscreen is available. Separate guitar stems support attenuation on misses; full mixes continue playing. Open notes are retained in imported data but excluded from current gameplay by user choice.

## Add songs

Extract each song under `src/musics`, preserving its files, then run:

```sh
pnpm import:songs
pnpm dev
```

Choose the song from the game selector. No per-song catalog edits are needed for supported folders. The command reads MIDI or `.chart`, metadata, difficulties, and conventional audio/artwork, reports unsupported/broken packages, and generates a reproducible catalog in `src/generated/songs`. Original files stay unchanged. Rerun after changing song folders. See [song integration](docs/song-integration.md) for compatibility limits.

ZIP/SNG extraction, video playback, calibration, and separate SFX volume remain pending. Timing/scoring rules are provisional; see [gameplay rules](docs/gameplay-rules.md).

## Development

Use pnpm with the existing lockfile and a Node runtime compatible with Next.js 16 (Node 20.9 or newer).

- `pnpm install`: install dependencies.
- `pnpm dev`: prepare song assets and run Next.js at `http://127.0.0.1:5173`.
- `pnpm build`: type check and build.
- `pnpm lint`: lint.
- `pnpm test`: test parsing, import, and mocked gameplay/audio.
- `pnpm preview`: serve the production build locally after `pnpm build`.
- `pnpm start`: serve the production build with Next.js defaults.
- `pnpm assets:songs`: regenerate the public song-file cache without reparsing charts.
- `pnpm import:songs`: regenerate catalog/chart data from original folders.
- `pnpm import:dragonforce`: compatibility alias for `import:songs`.

## Documentation

- [Agent instructions](AGENTS.md)
- [Project context](docs/project-context.md)
- [Song integration](docs/song-integration.md)
- [Song architecture](docs/song-architecture.md)
- [Next.js migration](docs/next-migration.md)
- [Gameplay rules](docs/gameplay-rules.md)
- [Commit conventions](docs/commit-conventions.md)
