import { readFile, writeFile } from 'node:fs/promises'
import { convertMidi } from './midi-chart.mjs'

const folder = new URL('../src/musics/Dragonforce - Through The Fire & Flames (Neversoft)/', import.meta.url)
const ini = await readFile(new URL('song.ini', folder), 'utf8')
const metadata = Object.fromEntries(ini.split(/\r?\n/).filter(line => line.includes('=')).map(line => {
  const separator = line.indexOf('=')
  return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()]
}))
const data = convertMidi(await readFile(new URL('notes.mid', folder)), {
  delayMs: Number(metadata.delay ?? 0),
  sustainCutoff: Number(metadata.sustain_cutoff_threshold ?? 40),
})
const song = {
  ...data,
  id: 'dragonforce-through-the-fire-and-flames',
  title: metadata.name,
  artist: metadata.artist,
  album: metadata.album,
  charter: metadata.charter.replace(/<[^>]+>/g, ''),
  duration: Number(metadata.song_length) / 1000,
}
await writeFile(new URL('../src/songs/dragonforce.json', import.meta.url), JSON.stringify(song))
await writeFile(new URL('../src/songs/dragonforce-info.json', import.meta.url), JSON.stringify({ id: song.id, title: song.title, artist: song.artist, album: song.album, charter: song.charter, duration: song.duration }))
console.log(JSON.stringify({ title: song.title, duration: song.duration, tempoChanges: song.tempoChanges, charts: Object.fromEntries(Object.entries(song.charts).map(([key, notes]) => [key, { groups: notes.length, notes: notes.reduce((sum, n) => sum + n.lanes.length, 0), first: notes[0].time, last: notes.at(-1).time }])) }, null, 2))
