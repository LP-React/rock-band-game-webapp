import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { convertChart } from '../scripts/text-chart.mjs'
import { discoverSongs, readIni, readPackage } from '../scripts/song-package.mjs'

const fixture = `[Song]
{
Resolution = 192
Offset = 0.2
}
[SyncTrack]
{
0 = B 120000
192 = B 60000
}
[ExpertSingle]
{
0 = N 0 384
0 = N 2 192
192 = N 5 0
192 = N 7 192
0 = S 2 384
}`
test('.chart tempo changes, offsets, disjoint sustains, modifiers and open notes are preserved', () => {
  const data = convertChart(fixture, { delayMs: 100 })
  assert.deepEqual(Object.keys(data.charts), ['expert'])
  assert.ok(Math.abs(data.charts.expert[0].time - .3) < 1e-10)
  assert.deepEqual(data.charts.expert[0].lanes, [0, 2])
  assert.deepEqual(data.charts.expert[0].durations, [1.5, .5])
  assert.equal(data.charts.expert[1].open, true)
  assert.equal(data.charts.expert[1].openDuration, 1)
  assert.equal(data.boostByDifficulty.expert[0].end, 1.8)
  assert.equal(data.warnings.length, 1)
  assert.throws(() => convertChart(fixture.replace('Resolution = 192', 'Resolution = 0')))
  assert.throws(() => convertChart(fixture.replace('192 = N 7 192', '192 = N 8 192')))
  assert.throws(() => convertChart(fixture.replace('192 = B 60000', '192 = A 1000000')), /anchors/)
})
test('all four supplied packages import actual difficulties, open notes and audio capabilities', async () => {
  const root = fileURLToPath(new URL('../src/musics/', import.meta.url))
  const folders = ['Dragonforce - Through The Fire & Flames (Neversoft)', 'Cole Rolland - Numb (Linkin Park Cover) (R.Bayu.F & Nephilim)', 'Linkin Park - Faint (heather)', 'Linkin Park - Given Up (heather)']
  const songs = await Promise.all(folders.map(folder => readPackage(join(root, folder), folder)))
  const byTitle = Object.fromEntries(songs.map(song => [song.entry.title, song]))
  assert.deepEqual(Object.values(byTitle['Through The Fire & Flames'].data.charts).map(notes => notes.length), [1102, 1823, 2723, 3722])
  assert.equal(byTitle['Through The Fire & Flames'].entry.reactiveGuitar, true)
  for (const [title, count, open] of [['Numb (Linkin Park Cover)', 591, 96], ['Faint', 525, 0], ['Given Up', 507, 159]]) {
    const song = byTitle[title]
    assert.deepEqual(song.entry.difficulties, ['expert'])
    assert.equal(song.data.charts.expert.length, count)
    assert.equal(song.entry.openNotes, open)
    assert.equal(song.entry.reactiveGuitar, false)
    assert.equal(song.entry.stems.length, 1)
    assert.equal(song.entry.stems[0].guitar, false)
    assert.ok(song.data.boostByDifficulty.expert.length > 0)
  }
})
test('discovery handles nested folders/case, isolates broken packages and reports ambiguous audio', async () => {
  const root = await mkdtemp(join(tmpdir(), 'riff-song-import-'))
  try {
    const valid = join(root, 'nested', 'valid'), broken = join(root, 'broken')
    await mkdir(valid, { recursive: true }); await mkdir(broken)
    await writeFile(join(valid, 'NOTES.CHART'), fixture)
    await writeFile(join(valid, 'SONG.OPUS'), '')
    await writeFile(join(valid, 'SONG.INI'), '[song]\nname = Valid\nartist = Test\nsong_length = 5000\n')
    await writeFile(join(broken, 'song.ini'), '[song]\nname = Broken\n')
    let result = await discoverSongs(root)
    assert.equal(result.songs.length, 1)
    assert.equal(result.songs[0].entry.title, 'Valid')
    assert.equal(result.errors.length, 1)
    assert.match(result.errors[0].message, /Missing/)
    await writeFile(join(valid, 'song.ogg'), '')
    result = await discoverSongs(root)
    assert.equal(result.songs.length, 0)
    assert.ok(result.errors.some(error => /Multiple audio/.test(error.message)))
  } finally {
    assert.ok(root.startsWith(join(tmpdir(), 'riff-song-import-')))
    await rm(root, { recursive: true, force: true })
  }
})
test('INI comments/other sections do not replace song metadata', () => {
  assert.deepEqual(readIni('\uFEFF[song]\nname = A=B\n;name = Wrong\n# comment\n[other]\nname = Wrong'), { name: 'A=B' })
})
