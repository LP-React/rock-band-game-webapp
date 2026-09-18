import { mkdir, writeFile, readdir, unlink } from 'node:fs/promises'
import { discoverSongs } from './song-package.mjs'
import { fileURLToPath } from 'node:url'

const output = new URL('../src/generated/songs/', import.meta.url)
const { songs, errors } = await discoverSongs(fileURLToPath(new URL('../src/musics/', import.meta.url)))
if (!songs.length) throw new Error(`No valid songs found: ${JSON.stringify(errors)}`)
await mkdir(output, { recursive: true })
for (const song of songs) {
  await writeFile(new URL(`${song.entry.id}.json`, output), JSON.stringify(song.data))
  console.log(`${song.entry.title}: ${Object.entries(song.data.charts).map(([key, notes]) => `${key}=${notes.length}`).join(', ')}`)
  song.entry.warnings.forEach(message => console.warn(`  Warning: ${message}`))
}
await writeFile(new URL('manifest.json', output), JSON.stringify({ schemaVersion: 1, songs: songs.map(song => song.entry), errors }, null, 2) + '\n')
const keep = new Set(songs.map(song => `${song.entry.id}.json`))
for (const name of await readdir(output)) if (/^[a-f0-9]{16}\.json$/.test(name) && !keep.has(name)) await unlink(new URL(name, output))
errors.forEach(error => console.error(`Skipped ${error.folder}: ${error.message}`))
console.log(`Imported ${songs.length}; skipped ${errors.length}.`)
