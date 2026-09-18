# Project context

## Goal and scope

Build a browser-based, guitar-only rock rhythm game as a React learning project, inspired by Clone Hero / Guitar Hero. Use five descending lanes and disc-shaped notes on a perspective highway.

First-phase target: per-song difficulties, synchronized audio, chords, sustains, streaks, score multipliers, boost, pause/restart, results, rock menus, audio/SFX settings, remappable keys, and optional per-song video. The user selected direct A/S/D/F/G keyboard play without a separate strum key. Future direction includes public release, SEO, GA4/Clarity, and synchronized versus rooms for up to four players; these integrations are not implemented. Additional instruments, accounts, and public uploads are not established requirements.

## Technical foundation

- React, TypeScript, Next.js 16.3.5 App Router, ESLint; pnpm with `pnpm-lock.yaml`. Vite tooling has been removed.
- `src/app/`: prerendered routes `/`, `/catalog`, and `/play`, shared global CSS, Spanish HTML, and metadata. Gameplay requires an explicit validated catalog attempt held in client session memory; song/difficulty never appear in its URL. Direct access or full reload returns to the catalog. Canvas/Web Audio initialize only after mounting in the browser.
- `src/App.tsx`: shared client session/settings provider, restoring localStorage after hydration without overwriting saved settings. `MenuRoutes.tsx` connects existing screens to Next navigation. `HomeScreen`, `SongCatalog`, `PreviewPlayer`, and `GameScreen` separate welcome, library browsing, audio samples, and engine lifecycle.
- `src/components/SettingsPanel.tsx` and `src/game/settings.ts`: five unique key bindings, volume, visual scroll speed, and localStorage persistence.
- `src/game/mechanics.ts`: sustain scoring/releases, boost phrases/energy, and health rules.
- `src/songs/`: runtime types, generated-manifest catalog, and selected-song audio loading. `src/generated/songs/` holds reproducible derived charts/manifest; `src/musics/` holds unchanged original packages.
- `src/songs/presentation.json`: optional manually curated palettes, backgrounds, descriptions, and display metadata keyed by imported ID; import never overwrites it. The catalog layers these over generated metadata, with artwork/neutral palette fallbacks. See [song presentation](song-presentation.md). Initial palettes are editorial starting points; gameplay lane colors remain fixed.
- `src/game/prototype.ts`: input, judgment, score, and playback orchestration.
- `src/game/renderer.ts`: Canvas 2D perspective highway/discs/tails/effects.
- `src/game/demo-audio.ts` and `chart.ts`: isolated synthetic test fixture.
- `scripts/import-songs.mjs` / `song-package.mjs`: generic folder discovery/import and error reporting. `midi-chart.mjs` / `text-chart.mjs`: MIDI and `.chart` five-fret lead-guitar adapters.
- `scripts/prepare-song-assets.mjs`: validates inputs and copies only referenced charts/media into an exclusively generated `public/songs` cache, prepared on import/dev/build. Original `src/musics` packages and derived `src/generated/songs` remain canonical inputs; do not put originals in the ignored public cache. See [Next.js migration](next-migration.md).
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
| Serve production | `pnpm start` |
| Prepare public song assets | `pnpm assets:songs` |
| Import all song folders | `pnpm import:songs` |
| Legacy import alias | `pnpm import:dragonforce` |

## Current state

- The catalog loads eight supplied folders: Dragonforce, Cole Rolland, three Linkin Park songs, two Imperial Circus Dead Decadence songs, and Linked Horizon. Add extracted folders under `src/musics` and run `pnpm import:songs`; no song-specific code edits are required for supported packages.
- Desktop home buttons overlap behind the foreground disc in both menu steps; labels and Back stay outside its edge. Mobile keeps a stacked layout. The audio ring uses stronger nonlinear peaks and transient emphasis with faster FFT smoothing; pause/reduced-motion return to a static ring.
- Home shares the catalog's song presentation palette and background, driven by the current player selection. Switching tracks updates the disc, spectrum, menu buttons, and interface accents without recreating the audio graph. The five gameplay key colors remain fixed.
- Muted playback exposes a compact sound-activation button centered inside the header (beside the brand on mobile). The player always shows a volume icon to its right, including its muted state. Hover/focus reveals a volume slider tied to shared persisted settings; changing volume preserves mute until explicitly enabled. Existing muted-autoplay attempts and browser-blocked playback fallback remain in place.
- Home starts in active silent-preview mode. If native audio autoplay is blocked, a monotonic preview clock advances through the decoded song envelope and animates the disc without audio playback; sound activation seeks the audio to that position. Pause freezes both paths, track changes reset the clock while preserving pause, and reduced-motion/hidden-page animation handling remains intact. Animation requires the envelope to finish loading and decoding.
- How to Play explicitly receives the active song palette and uses a translucent blurred dialog with current key bindings, note types, scoring/boost/health guidance, and keyboard navigation sections. Narrow screens stack sections within a scrollable native modal; Escape/close restore focus. Sound activation hover preserves the song color with a small brightness adjustment instead of the global button background.
- Home uses the Arcade vinyl/cream/amber design; the Arcade/Encore selector is removed. `HomeMusic` adds a top-right artwork/title/artist player with previous/play-pause/next controls, shared volume, and looping imported preview audio (first song: DragonForce). Home attempts muted autoplay, offers explicit sound activation, preserves pause when switching songs, and stops audio on leaving home. Browsers may block even muted autoplay; the play control remains available. A Canvas ring reacts to Web Audio frequency data; the disc scale follows a predecoded 20 Hz audio-intensity envelope, also while muted. This is an approximate musical pulse, not chart BPM/beat detection. Offline decoding retains only normalized levels and discards canceled results; long full-mix previews still need memory measurement; animation stops while paused/hidden and becomes static for reduced-motion preferences. Player/context/animation resources are released on unmount. Mobile stacks the player under the header. Home removes decorative copy/song counts, retains the colored key guide, and opens a native How to Play modal with current bindings and keyboard controls. Play replaces the primary Play/Configuration buttons with an animated Solo/Friends step; only one step is rendered at a time; Solo opens the catalog, Friends is disabled/pending. Escape/Back collapse it and restore button focus; help closes by Escape or button. Desktop/mobile playback, pause, song switching, and navigation were browser-checked.
- The catalog uses slanted artwork cards on the right and selected-song metadata/difficulty/play controls on the left. Each card has its own palette; selected-song colors control buttons/accents, with a dimmed artwork or curated image backdrop. Mobile layouts stack these regions. Search, actual difficulties, previews, and arrow/Enter navigation remain intact. Escape returns home when the list is focused. Missing metadata uses a dash rather than invented values. Transitions respect reduced-motion preferences. Only home/catalog have public SEO metadata; `/play` is not indexed and there are no public per-song pages.
- Catalog detail groups artwork, title/artist/preview, metadata, difficulty, and the play button into a vertically centered block. The play button sits directly below the information; the whole pane scrolls on short desktop screens, and mobile uses normal page scrolling. Artwork exposes more vinyl with extra space before the title; short desktop screens use two metadata columns.
- Catalog selection enlarges the active row and dims/shrinks other rows while retaining their song palettes and readable metadata. Home-style stage lines, a slowly rotating ambient ring, vinyl behind the album cover, and a slanted play button connect both menus. Preview bars animate only during sample playback; they are a decorative playback indicator, not an audio spectrum. Reduced-motion disables ambient and playback animations.
- Selecting or navigating to a song smoothly centers its row within the list only; viewport-sized list padding allows the first/last songs to center too. Selected tabs animate in from the right, and their bars follow native sample playback state. Reduced-motion uses immediate scrolling and static bars.
- `next.config.mjs` hides the development indicator to keep it from covering game/menu controls; Next still reports runtime/compile errors.
- Menu layouts were browser-checked at 1280×720, 1024×600, and 390×844, including variant switching, configuration access, keyboard song start/pause, previews, and selection preservation on catalog return. Per-song palettes were checked on desktop/mobile; DragonForce starts at `/play`, pauses, and returns with selection intact. Direct `/play` access redirects to the catalog without starting a song.
- Catalog samples use native audio for up to 20 seconds: dedicated preview files take priority, otherwise `preview_start_time` (milliseconds) selects the main-song range, falling back to zero. Samples try autoplay with an explicit listening button if blocked, follow shared volume, and stop when changing songs or leaving the catalog. Video playback remains pending.
- Four actual guitar difficulty charts: Easy 1102, Medium 1823, Hard 2723, Expert 3722 note groups. MIDI resolution 480; 775 tempo events; first note at 2.414 seconds.
- Album artwork, full recorded accompaniment/guitar Opus audio, direct color input, chords, score/streak/multiplier, volume, pause/resume/restart, focus-loss pause, and guitar attenuation on misses are implemented.
- Chart JSON is fetched separately; only selected-song audio is decoded/cached and reused for restarts/difficulty changes. All available stems start together. Full mixes on the three new songs remain audible on misses; DragonForce has isolated guitar attenuation. Unequal stem lengths are allowed, with the longest decoded duration setting attempt length.
- New `.chart` packages contain Expert only: Numb 591 groups (495 colored + 96 open), Faint 525 colored, Given Up 507 (348 colored + 159 open). Open notes are preserved in derived data but excluded from current play by user decision; support remains pending. No extra input key was added. Numb's supplied video is preserved but not played.
- Sustains score while held; early release breaks the streak and attenuates guitar. Holding does not auto-hit future notes. MIDI marker 116 supplies 25 boost phrases; completing marked phrases charges energy. Space activates boost with at least half a bar, doubles the multiplier, and changes the highway/effects to electric cyan. Space is not a strum key.
- Health, spark effects, five remappable keys, live volume, persistent settings, visual speed (0.5–2×), and a fullscreen button are implemented. Scroll speed changes visibility only, independently of musical timing and hit windows. Settings are edited before play; volume remains available during play.
- Escape toggles pause/resume without resetting progress. Pause freezes the song clock and stops both sources; resume schedules both cached stems together at the saved offset. Focus loss pauses automatically. Rehold ongoing sustain keys before continuing; releases during pause do not count as misses.
- The receptors sit near the bottom, with a faded highway entrance, enlarged score/streak beside the board, vertical health on the right, and boost energy on the left. A subtle boost-ready notice appears near the highway; activation is keyboard-only with Space.
- Calibration, traditional HOPO/tap distinctions, open-note gameplay, video playback, and separate SFX volume remain pending. Generic extraction of ZIP/SNG is pending; extracted folders work. See [gameplay rules](gameplay-rules.md) for provisional scoring and health values.
- The 140ms hit window and scoring/multiplier rules remain provisional. Input uses audio time at handler execution; hardware latency mapping is pending. Dense charts choose the closest eligible note in the pressed lane.
- Validation: lint/build and 21 tests pass, including public-cache boundaries/source preservation alongside parsing, audio, pause, and gameplay rules. Next production browser checks cover desktop/390×844 catalog layouts, dedicated preview playback, DragonForce start/pause, return selection, and settings persistence after reload without hydration errors. HTTP checks confirm home/catalog content in initial HTML and invalid-song 404s. Full-song listening/latency, active boost visual playtesting, and cross-browser compatibility are not certified.
- Import skips broken packages with a per-folder report; no-valid-song runs fail while preserving the previous catalog. Conventional names and codecs are documented in [song integration](song-integration.md); universal chart compatibility is not claimed.
- Git is initialized locally. Follow the documented commit conventions; pushing/deployment requires an explicit request. Preserve supplied assets and the existing `parse-sng` dependency.
- Unknowns: reference scoring/timing preset, future song assets, distribution rights, minimum browsers/devices, memory/performance baseline, and exact compatibility coverage/parser selection.

## Working conventions

Follow `AGENTS.md` and `docs/commit-conventions.md`. Keep documentation/commits in English and context focused on current facts.
