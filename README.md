# Riff Lab

A React learning project for a browser-based, five-color guitar rhythm game inspired by Guitar Hero and Clone Hero.

The current catalog includes Dragonforce / Through The Fire & Flames, Cole Rolland / Numb (Linkin Park Cover), and Linkin Park / Faint and Given Up. Original community maps provide the notes and difficulties. A/S/D/F/G are the default color keys; no separate strum is required. Hold long notes to score tails. Complete starred phrases and press Space with half a bar for boost. Escape pauses/resumes without resetting progress; losing focus pauses automatically.

The full-viewport Canvas 2D highway includes perspective discs, sparks, a faded entrance, enlarged score/streak, vertical health, and a boost-ready notice. Configuration offers five remappable keys and visual speed; settings persist locally. Volume is adjustable during play. Fullscreen is available. Separate guitar stems support attenuation on misses; full mixes continue playing. Open notes are retained in imported data but excluded from current gameplay by user choice.

## Add songs

Extract each song under `src/musics`, preserving its files, then run:

```sh
pnpm import:songs
pnpm dev
```

Choose the song from the game selector. No per-song catalog edits are needed for supported folders. The command reads MIDI or `.chart`, metadata, difficulties, and conventional audio/artwork, reports unsupported/broken packages, and generates a reproducible catalog in `src/generated/songs`. Original files stay unchanged. Rerun after changing song folders. See [song integration](docs/song-integration.md) for compatibility limits.

ZIP/SNG extraction, preview/video playback, calibration, separate SFX volume, and a dedicated song-menu screen remain pending. Timing/scoring rules are provisional; see [gameplay rules](docs/gameplay-rules.md).

## Development

Use pnpm with the existing lockfile and a Node runtime compatible with the installed Vite version.

- `pnpm install`: install dependencies.
- `pnpm dev`: run locally.
- `pnpm build`: type check and build.
- `pnpm lint`: lint.
- `pnpm test`: test parsing, import, and mocked gameplay/audio.
- `pnpm preview`: preview the build.
- `pnpm import:songs`: regenerate catalog/chart data from original folders.
- `pnpm import:dragonforce`: compatibility alias for `import:songs`.

## Documentation

- [Agent instructions](AGENTS.md)
- [Project context](docs/project-context.md)
- [Song integration](docs/song-integration.md)
- [Song architecture](docs/song-architecture.md)
- [Gameplay rules](docs/gameplay-rules.md)
- [Commit conventions](docs/commit-conventions.md)
