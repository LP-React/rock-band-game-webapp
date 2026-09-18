import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { prepareSongAssets } from '../scripts/prepare-song-assets.mjs'

test('public cache copies only referenced assets, preserves sources and rejects escaping/missing files', async () => {
  const root = await mkdtemp(join(tmpdir(), 'riff-assets-'))
  const id = '1234567890abcdef', source = join(root, 'src/musics/Original folder')
  const charts = join(root, 'src/generated/songs'), output = join(root, 'public/songs', id)
  const song = { id, artwork: 'Original folder/album.jpg', preview: 'Original folder/preview.opus', stems: [{ path: 'Original folder/song.opus' }] }
  const manifest = () => writeFile(join(charts, 'manifest.json'), JSON.stringify({ songs: [song] }))
  try {
    await mkdir(source, { recursive: true }); await mkdir(charts, { recursive: true })
    for (const name of ['album.jpg', 'preview.opus', 'song.opus', 'unrelated.mp4']) await writeFile(join(source, name), name)
    await writeFile(join(charts, `${id}.json`), '{"schemaVersion":1}')
    await manifest()
    assert.equal(await prepareSongAssets(root), 4)
    assert.equal(await readFile(join(output, 'media/song.opus'), 'utf8'), 'song.opus')
    assert.equal(await readFile(join(source, 'song.opus'), 'utf8'), 'song.opus')
    await assert.rejects(readFile(join(output, 'media/unrelated.mp4')), { code: 'ENOENT' })
    song.preview = 'Original folder/missing.opus'
    await manifest(); await assert.rejects(prepareSongAssets(root), { code: 'ENOENT' })
    assert.equal(await readFile(join(output, 'media/song.opus'), 'utf8'), 'song.opus')
    song.preview = '../../outside.opus'
    await manifest(); await assert.rejects(prepareSongAssets(root), /escapes/)
    song.preview = ''; song.artwork = ''
    await manifest(); await prepareSongAssets(root)
    await assert.rejects(readFile(join(output, 'media/preview.opus')), { code: 'ENOENT' })
  } finally {
    assert.ok(root.startsWith(join(tmpdir(), 'riff-assets-')))
    await rm(root, { recursive: true, force: true })
  }
})
