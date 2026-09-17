# Project context

## Goal and scope

Build a browser-based, guitar-only rock rhythm game as a React learning project, inspired by Clone Hero / Guitar Hero. Use five descending lanes and disc-shaped notes on a perspective highway.

First-phase target: approximately five songs, per-song difficulties, synchronized audio, chords, sustains, streaks, score multipliers, boost, pause/restart, results, rock menus, audio/SFX settings, remappable keys, and optional per-song video. The user selected direct A/S/D/F/G keyboard play without a separate strum key. Additional instruments are outside scope; backend, multiplayer, accounts, and public uploads are not established requirements.

## Technical foundation

- React, TypeScript, Vite, ESLint; pnpm with `pnpm-lock.yaml`.
- `src/App.tsx`: full-viewport game shell, difficulty selection, fullscreen, and playback controls.
- `src/components/SettingsPanel.tsx` and `src/game/settings.ts`: five unique key bindings, volume, visual scroll speed, and localStorage persistence.
- `src/game/mechanics.ts`: sustain scoring/releases, boost phrases/energy, and health rules.
- `src/songs/`: song types, catalog, metadata, normalized charts, and audio loading.
- `src/game/prototype.ts`: input, judgment, score, and playback orchestration.
- `src/game/renderer.ts`: Canvas 2D perspective highway/discs/tails/effects.
- `src/game/demo-audio.ts` and `chart.ts`: isolated synthetic test fixture.
- `scripts/midi-chart.mjs`: format-1 MIDI guitar conversion; `scripts/import-dragonforce.mjs`: the current package import.
- PixiJS remains a proposed future renderer, not installed. MIDI parsing uses `midi-file` during import only; no MIDI parser runs in the browser.
- See [song integration](song-integration.md), [game plan](game-plan.md), and [chart research](chart-research.md).
- Selected compatibility direction: preserve existing community song packages as canonical input; read folders/ZIP/SNG and MIDI/`.chart` through shared adapters. Runtime normalization is allowed, but no proprietary song files or folder restructuring should be required. See [song architecture](song-architecture.md). Generic loaders and local import UI are not implemented yet.

## Commands

| Action | Command |
| --- | --- |
| Install | `pnpm install` |
| Develop | `pnpm dev` |
| Build/type check | `pnpm build` |
| Lint | `pnpm lint` |
| Test | `pnpm test` |
| Preview build | `pnpm preview` |
| Reimport current song | `pnpm import:dragonforce` |

## Current state

- The example now loads the user-supplied Dragonforce / Through The Fire & Flames package from the extracted folder in `src/musics`.
- Four actual guitar difficulty charts: Easy 1102, Medium 1823, Hard 2723, Expert 3722 note groups. MIDI resolution 480; 775 tempo events; first note at 2.414 seconds.
- Album artwork, full recorded accompaniment/guitar Opus audio, direct color input, chords, score/streak/multiplier, volume, stop/restart, focus-loss stop, and guitar attenuation on misses are implemented.
- Chart JSON is fetched separately; audio is fetched/decoded only on play and reused across restarts/difficulties for this song. Both stems start on the same AudioContext time.
- Sustains score while held; early release breaks the streak and attenuates guitar. Holding does not auto-hit future notes. MIDI marker 116 supplies 25 boost phrases; completing marked phrases charges energy. Space activates boost with at least half a bar, doubles the multiplier, and changes the highway/effects to electric cyan. Space is not a strum key.
- Health, spark effects, five remappable keys, live volume, persistent settings, visual speed (0.5–2×), and a fullscreen button are implemented. Scroll speed changes visibility only, independently of musical timing and hit windows. Settings are edited before play; volume remains available during play.
- Calibration, traditional HOPO/tap distinctions, pause/resume, preview playback, video, separate SFX volume, and a multi-song menu remain pending. See [gameplay rules](gameplay-rules.md) for provisional scoring and health values.
- The 140ms hit window and scoring/multiplier rules remain provisional. Input uses audio time at handler execution; hardware latency mapping is pending. Dense charts choose the closest eligible note in the pressed lane.
- Validation: build/lint and nine automated tests pass, covering conversion, direct input, chords, sustains, boost, and remapping. Browser checked desktop and 390×844 layouts, duplicate-key rejection, saving/restoring controls, and recorded audio playback. Full-song listening/latency, active boost visual playtesting, and cross-browser compatibility are not certified.
- The SNG's six files match the extracted folder byte-for-byte (SHA-256 comparison). Metadata differs in default fields; use the folder's `song.ini` for this integration.
- Git is initialized locally. Follow the documented commit conventions; pushing/deployment requires an explicit request. Preserve supplied assets and the existing `parse-sng` dependency.
- Unknowns: reference scoring/timing preset, future song assets, distribution rights, minimum browsers/devices, memory/performance baseline, and exact compatibility coverage/parser selection.

## Working conventions

Follow `AGENTS.md` and `docs/commit-conventions.md`. Keep documentation/commits in English and context focused on current facts.
