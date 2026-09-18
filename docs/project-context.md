# Project context

## Goal and scope

Build a browser-based, guitar-only rock rhythm game as a React learning project, inspired by Clone Hero / Guitar Hero. Use five descending lanes and disc-shaped notes on a perspective highway.

First-phase target: approximately five songs, per-song difficulties, synchronized audio, chords, sustains, streaks, score multipliers, boost, pause/restart, results, rock menus, audio/SFX settings, remappable keys, and optional per-song video. The user selected direct A/S/D/F/G keyboard play without a separate strum key. Additional instruments are outside scope; backend, multiplayer, accounts, and public uploads are not established requirements.

## Technical foundation

- React, TypeScript, Vite, ESLint; pnpm with `pnpm-lock.yaml`.
- `src/App.tsx`: full-viewport game shell, difficulty selection, fullscreen, and playback controls.
- `src/components/SettingsPanel.tsx` and `src/game/settings.ts`: five unique key bindings, volume, visual scroll speed, and localStorage persistence.
- `src/game/mechanics.ts`: sustain scoring/releases, boost phrases/energy, and health rules.
- `src/songs/`: runtime types, generated-manifest catalog, and selected-song audio loading. `src/generated/songs/` holds reproducible derived charts/manifest; `src/musics/` holds unchanged original packages.
- `src/game/prototype.ts`: input, judgment, score, and playback orchestration.
- `src/game/renderer.ts`: Canvas 2D perspective highway/discs/tails/effects.
- `src/game/demo-audio.ts` and `chart.ts`: isolated synthetic test fixture.
- `scripts/import-songs.mjs` / `song-package.mjs`: generic folder discovery/import and error reporting. `midi-chart.mjs` / `text-chart.mjs`: MIDI and `.chart` five-fret lead-guitar adapters.
- PixiJS remains a proposed future renderer, not installed. MIDI parsing uses `midi-file` during import only; no MIDI parser runs in the browser.
- See [song integration](song-integration.md), [game plan](game-plan.md), and [chart research](chart-research.md).
- Selected compatibility direction: preserve community packages as canonical input; read extracted folders through generic MIDI/`.chart` adapters without per-song code. ZIP/SNG readers and local upload UI remain pending. Generated JSON is a reproducible derived cache, not a user-authored format. See [song architecture](song-architecture.md).

## Commands

| Action | Command |
| --- | --- |
| Install | `pnpm install` |
| Develop | `pnpm dev` |
| Build/type check | `pnpm build` |
| Lint | `pnpm lint` |
| Test | `pnpm test` |
| Preview build | `pnpm preview` |
| Import all song folders | `pnpm import:songs` |
| Legacy import alias | `pnpm import:dragonforce` |

## Current state

- The selector loads four supplied folders: Dragonforce / Through The Fire & Flames, Cole Rolland / Numb (Linkin Park Cover), Linkin Park / Faint, and Linkin Park / Given Up. Add extracted folders under `src/musics` and run `pnpm import:songs`; no song-specific code edits are required for supported packages.
- Four actual guitar difficulty charts: Easy 1102, Medium 1823, Hard 2723, Expert 3722 note groups. MIDI resolution 480; 775 tempo events; first note at 2.414 seconds.
- Album artwork, full recorded accompaniment/guitar Opus audio, direct color input, chords, score/streak/multiplier, volume, pause/resume/restart, focus-loss pause, and guitar attenuation on misses are implemented.
- Chart JSON is fetched separately; only selected-song audio is decoded/cached and reused for restarts/difficulty changes. All available stems start together. Full mixes on the three new songs remain audible on misses; DragonForce has isolated guitar attenuation. Unequal stem lengths are allowed, with the longest decoded duration setting attempt length.
- New `.chart` packages contain Expert only: Numb 591 groups (495 colored + 96 open), Faint 525 colored, Given Up 507 (348 colored + 159 open). Open notes are preserved in derived data but excluded from current play by user decision; support remains pending. No extra input key was added. Numb's supplied video is preserved but not played.
- Sustains score while held; early release breaks the streak and attenuates guitar. Holding does not auto-hit future notes. MIDI marker 116 supplies 25 boost phrases; completing marked phrases charges energy. Space activates boost with at least half a bar, doubles the multiplier, and changes the highway/effects to electric cyan. Space is not a strum key.
- Health, spark effects, five remappable keys, live volume, persistent settings, visual speed (0.5–2×), and a fullscreen button are implemented. Scroll speed changes visibility only, independently of musical timing and hit windows. Settings are edited before play; volume remains available during play.
- Escape toggles pause/resume without resetting progress. Pause freezes the song clock and stops both sources; resume schedules both cached stems together at the saved offset. Focus loss pauses automatically. Rehold ongoing sustain keys before continuing; releases during pause do not count as misses.
- The receptors sit near the bottom, with a faded highway entrance, enlarged score/streak beside the board, vertical health on the right, and boost energy on the left. A subtle boost-ready notice appears near the highway; activation is keyboard-only with Space.
- Calibration, traditional HOPO/tap distinctions, open-note gameplay, preview/video playback, separate SFX volume, and a dedicated song-menu screen remain pending. Generic extraction of ZIP/SNG is pending; extracted folders work. See [gameplay rules](gameplay-rules.md) for provisional scoring and health values.
- The 140ms hit window and scoring/multiplier rules remain provisional. Input uses audio time at handler execution; hardware latency mapping is pending. Dense charts choose the closest eligible note in the pressed lane.
- Validation: lint/build and 17 tests pass, covering original four-package counts/capabilities, `.chart` tempo/offset/sustains/boost/open notes, malformed folder isolation, case/nested discovery, audio routing, and existing pause/gameplay rules. Browser checked desktop/390×844 selector layouts, actual decoding/start, and pause for all four songs. Full-song listening/latency, active boost visual playtesting, and cross-browser compatibility are not certified.
- Import skips broken packages with a per-folder report; no-valid-song runs fail while preserving the previous catalog. Conventional names and codecs are documented in [song integration](song-integration.md); universal chart compatibility is not claimed.
- Git is initialized locally. Follow the documented commit conventions; pushing/deployment requires an explicit request. Preserve supplied assets and the existing `parse-sng` dependency.
- Unknowns: reference scoring/timing preset, future song assets, distribution rights, minimum browsers/devices, memory/performance baseline, and exact compatibility coverage/parser selection.

## Working conventions

Follow `AGENTS.md` and `docs/commit-conventions.md`. Keep documentation/commits in English and context focused on current facts.
