# Next.js migration

The existing repository now uses Next.js 16.3.5 App Router instead of Vite. React components, Canvas/Web Audio gameplay, song parsers, original packages, and gameplay tests are reused.

## Boundaries

- `/`: prerendered welcome screen with shared configuration.
- `/catalog`: prerendered library with client selection, previews, search, and difficulty controls.
- `/play/[id]/[difficulty]`: validates the song/difficulty on the server and mounts the client engine. Invalid combinations return 404. Attempts are excluded from indexing.
- `src/App.tsx`: session provider retained across client navigation. Local preferences load after hydration; the initial server/client output uses the same defaults. Selection/difficulty persist during navigation, not after a full reload.
- `src/components/MenuRoutes.tsx`: client navigation and selected-chart loading. Browser APIs execute in effects or event handlers, not during server rendering.
- `src/app/layout.tsx`: global styles, Spanish document language, and initial metadata. Per-song public SEO pages, sitemap, analytics, and multiplayer remain future work.

## Files and commands

Vite's glob-based media imports are replaced by deterministic `/songs/<id>/chart.json` and `/songs/<id>/media/<filename>` URLs. `prepare-song-assets.mjs` validates source references before replacing the generated `public/songs` cache. It copies only manifest-referenced assets, preserving original folders. This cache is ignored by Git and must not hold user-authored files.

`pnpm import:songs` still discovers and parses community folders, then prepares public assets. `pnpm dev` and `pnpm build` prepare assets from the checked-in manifest without reparsing maps. Fresh checkouts therefore retain the existing song workflow. `pnpm assets:songs` prepares only media/chart copies.

Development stays at `http://127.0.0.1:5173`. Use `pnpm build` followed by `pnpm preview` for local production verification; `pnpm start` uses Next's deployment defaults. Deployment must include the prepared `public` directory and follow the hosting provider's Next.js procedure. Static-export deployment is not configured.

Changing origins/ports changes the browser's localStorage scope. Existing preferences on the same origin are retained. WebSocket room coordination will be designed separately from the locally timed gameplay engine.
