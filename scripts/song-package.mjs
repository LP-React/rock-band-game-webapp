import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { convertMidi } from './midi-chart.mjs'
import { convertChart, chartMetadata, chartSections } from './text-chart.mjs'

export function readIni(text) {
  const result = {}; let section = ''
  for (const line of text.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const header = line.trim().match(/^\[(.+)\]$/)
    if (header) { section = header[1].toLowerCase(); continue }
    if (section !== 'song' || /^\s*[;#]/.test(line)) continue
    const separator = line.indexOf('=')
    if (separator > 0) result[line.slice(0, separator).trim().toLowerCase()] = line.slice(separator + 1).trim()
  }
  return result
}
export async function readPackage(folder, relative) {
  const files = (await readdir(folder, { withFileTypes: true })).filter(f => f.isFile()).map(f => f.name)
  const find = name => files.find(f => f.toLowerCase() === name)
  const midi = find('notes.mid'), chart = find('notes.chart'), ini = find('song.ini')
  if (!midi && !chart) throw new Error('Missing notes.mid or notes.chart')
  const text = !midi ? await readFile(join(folder, chart), 'utf8') : ''
  const fallback = chartMetadata(chartSections(text).Song)
  const metadata = ini ? readIni(await readFile(join(folder, ini), 'utf8')) : {}
  const delayMs = Number(metadata.delay ?? 0), sustainCutoff = Number(metadata.sustain_cutoff_threshold ?? 40)
  if (!Number.isFinite(delayMs) || !Number.isFinite(sustainCutoff) || sustainCutoff < 0) throw new Error('Invalid INI timing settings')
  if (metadata.modchart === '1') throw new Error('Modcharts are not supported')
  const data = midi ? convertMidi(await readFile(join(folder, midi)), { delayMs, sustainCutoff }) : convertChart(text, { delayMs })
  for (const notes of Object.values(data.charts)) for (const note of notes) if (!Number.isFinite(note.time) || note.time < 0) throw new Error('Negative or invalid playable note time')
  const warnings = [...(data.warnings ?? [])]
  const openNotes = Object.values(data.charts).reduce((sum, notes) => sum + notes.filter(note => note.open).length, 0)
  if (openNotes) warnings.push(`${openNotes} open notes preserved in chart data but excluded from current five-color gameplay`)
  if (midi && chart) warnings.push('Both chart files present; notes.mid takes precedence')
  const extensions = ['opus', 'ogg', 'mp3', 'wav', 'flac']
  const stems = []
  for (const role of ['song', 'guitar', 'rhythm', 'bass', 'keys', 'drums', 'drums_1', 'drums_2', 'drums_3', 'drums_4', 'vocals', 'crowd']) {
    const matches = extensions.map(ext => find(`${role}.${ext}`)).filter(Boolean)
    if (matches.length > 1) throw new Error(`Multiple audio files for ${role}; keep one encoding`)
    if (matches.length) stems.push({ path: `${relative}/${matches[0]}`, guitar: role === 'guitar' })
  }
  if (stems.some(s => /\/drums_[1-4]\./i.test(s.path))) { const index = stems.findIndex(s => /\/drums\./i.test(s.path)); if (index >= 0) stems.splice(index, 1) }
  if (!stems.length) throw new Error('No supported conventional audio files')
  const reactiveGuitar = stems.length > 1 && stems.some(s => s.guitar)
  if (!reactiveGuitar) { stems.forEach(s => { s.guitar = false }); warnings.push('Mixed audio: guitar cannot be muted independently') }
  const artwork = ['album.jpg', 'album.png', 'album.jpeg', 'album.webp'].map(find).find(Boolean)
  if (files.some(f => /^video\./i.test(f))) warnings.push('Background video found; playback is not implemented yet')
  const clean = value => (value ?? '').replace(/<[^>]+>/g, '')
  const duration = Number(metadata.song_length ?? 0) / 1000 || Math.max(...Object.values(data.charts).map(notes => notes.at(-1).time + Math.max(0, ...(notes.at(-1).durations ?? []), notes.at(-1).openDuration ?? 0))) + 2
  if (!Number.isFinite(duration) || duration <= 0) throw new Error('Invalid song duration')
  const id = createHash('sha256').update(relative).digest('hex').slice(0, 16)
  const difficulties = Object.keys(data.charts).filter(key => data.charts[key].some(note => !note.open))
  if (!difficulties.length) throw new Error('No colored guitar notes; open-only charts are pending')
  return { data, entry: { id, title: clean(metadata.name ?? fallback.Name ?? relative.split('/').at(-1)), artist: clean(metadata.artist ?? fallback.Artist ?? 'Unknown artist'), album: clean(metadata.album ?? fallback.Album), charter: clean(metadata.charter ?? fallback.Charter), duration, artwork: artwork ? `${relative}/${artwork}` : '', stems, reactiveGuitar, openNotes, difficulties, warnings } }
}
export async function discoverSongs(root) {
  const songs = [], errors = []
  async function walk(folder, relative = '') {
    const children = await readdir(folder, { withFileTypes: true })
    if (children.some(f => f.isFile() && /^(notes\.(mid|chart)|song\.ini)$/i.test(f.name))) {
      try { songs.push(await readPackage(folder, relative)) } catch (error) { errors.push({ folder: relative, message: error.message }) }
      return
    }
    for (const child of children.filter(f => f.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) await walk(join(folder, child.name), relative ? `${relative}/${child.name}` : child.name)
  }
  await walk(root)
  return { songs, errors }
}
