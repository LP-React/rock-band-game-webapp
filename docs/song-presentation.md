# Song presentation

Community packages remain the source of notes, audio, artwork, and difficulties. Optional editorial customization lives in `src/songs/presentation.json`, separately from generated data. Import never overwrites this file.

Find the song's `id` and title in `src/generated/songs/manifest.json`, then add or edit its entry. IDs identify packages internally; they are not gameplay page URLs. Renaming a source folder changes its ID, so move its customization to the new key after importing.

Example (replace the description and background with your own content):

```json
{
  "f2507e5315d8ed44": {
    "label": "Linkin Park — Faint",
    "theme": {
      "accent": "#dec38d",
      "selection": "#f5e9d1",
      "panel": "#483c27",
      "onAccent": "#282116"
    },
    "background": "/backgrounds/faint.jpg",
    "description": "Your short song description.",
    "metadata": { "artist": "Linkin Park", "title": "Faint" }
  }
}
```

- `label`: editor identification only; not displayed.
- `accent`: buttons, selected difficulty, and visual accents.
- `selection`: selected song card background.
- `panel`: unselected card tint.
- `onAccent`: text on accent/selection backgrounds; choose sufficient contrast against both.
- `background`: optional image URL. Put `/backgrounds/faint.jpg` at `public/backgrounds/faint.jpg`. Keep authored assets outside the regenerated `public/songs` cache. Without an override, the package artwork is used.
- `description`: optional text under the song title.
- `metadata`: optional display overrides for `title`, `artist`, `album`, `charter`, `genre`, and `year`. Other imported fields and charts remain unchanged.

Use six-digit hexadecimal colors. Initial palettes are manually selected starting points, not extracted automatically. Songs without customization still work with package artwork and a neutral palette. Editing presentation does not require another import; restart/rebuild as appropriate for development/production.

The selected song controls catalog buttons, accents, and background; each list card has its own palette. Home design variants remain independent. The five gameplay lane colors stay fixed for recognition.

## Navigation and SEO

Home and catalog are public pages with metadata in `src/app/layout.tsx` and `src/app/catalog/page.tsx`. Gameplay uses only `/play`, is excluded from indexing, and requires an attempt started from the catalog. Song/difficulty are held in client session memory; direct access or full reload returns to the catalog. Returning through the game menu preserves selection during client navigation.

Editorial song descriptions are display content, not separate SEO pages. There are no individual public song URLs or song-specific search metadata in this design. Analytics, sitemap, and further site SEO remain pending.
