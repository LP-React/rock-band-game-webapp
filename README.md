# Riff Lab

A React learning project for a browser-based guitar rhythm game inspired by Guitar Hero and Clone Hero.

The current example plays the user-supplied Dragonforce / Through The Fire & Flames package, with four original MIDI guitar difficulties, album artwork, and separate accompaniment/guitar Opus audio. Press A/S/D/F/G when notes reach the line. No space/strum is required. Chords require each matching key; misses mute guitar and completed groups restore it. Stop/restart and volume are available; losing focus stops play.

The full-viewport Canvas 2D game draws perspective disc notes, glowing sustain tails, and hit sparks. Hold long notes to score their tails. Complete starred phrases to charge boost, then press Space with at least half a bar for double scoring and cyan effects. Health reaching zero ends the attempt. Configuration offers five remappable keys and visual scroll speed; settings persist locally. Music volume is adjustable during play, and a fullscreen button is available.

Calibration, video, separate SFX volume, preview playback, pause/resume, and a multi-song menu remain pending. Timing/scoring rules are provisional; see [gameplay rules](docs/gameplay-rules.md).

## Development

Use pnpm with the existing lockfile and a Node runtime compatible with the installed Vite version.

- `pnpm install`: install dependencies.
- `pnpm dev`: run locally.
- `pnpm build`: type check and build.
- `pnpm lint`: lint.
- `pnpm test`: test conversion and mocked gameplay/audio.
- `pnpm preview`: preview the build.
- `pnpm import:dragonforce`: regenerate normalized chart/metadata from the supplied MIDI/INI.

## Documentation

- [Agent instructions](AGENTS.md)
- [Project context](docs/project-context.md)
- [Song integration](docs/song-integration.md)
- [Game plan](docs/game-plan.md)
- [Chart research](docs/chart-research.md)
- [Commit conventions](docs/commit-conventions.md)
