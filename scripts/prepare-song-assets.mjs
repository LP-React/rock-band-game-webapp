import { copyFile, mkdir, readFile, rm, lstat } from 'node:fs/promises'
import { dirname, resolve, sep, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

export async function prepareSongAssets(project = fileURLToPath(new URL('../', import.meta.url))) {
  const source = resolve(project, 'src/musics'), charts = resolve(project, 'src/generated/songs')
  const output = resolve(project, 'public/songs')
  const manifest = JSON.parse(await readFile(resolve(charts, 'manifest.json'), 'utf8'))
  const files = []
  for (const song of manifest.songs) {
    if (!/^[a-f0-9]{16}$/.test(song.id)) throw new Error('Invalid generated song ID')
    const paths = new Set([song.artwork, song.preview, ...song.stems.map(stem => stem.path)].filter(Boolean))
    files.push([resolve(charts, `${song.id}.json`), resolve(output, song.id, 'chart.json')])
    for (const path of paths) {
      const input = resolve(source, path)
      if (!input.startsWith(source + sep)) throw new Error('Song asset escapes the source directory')
      files.push([input, resolve(output, song.id, 'media', basename(input))])
    }
  }
  // Validate inputs before replacing this exclusively generated public cache.
  for (const [input] of files) if (!(await lstat(input)).isFile()) throw new Error(`Missing song asset: ${input}`)
  if (output !== resolve(project, 'public', 'songs') || !output.startsWith(resolve(project) + sep)) throw new Error('Unsafe cache directory')
  const existing = await lstat(output).catch(error => { if (error.code !== 'ENOENT') throw error })
  if (existing?.isSymbolicLink()) throw new Error('Public song cache must not be a symbolic link')
  await rm(output, { recursive: true, force: true })
  for (const [input, target] of files) { await mkdir(dirname(target), { recursive: true }); await copyFile(input, target) }
  return files.length
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(`Prepared ${await prepareSongAssets()} public song assets.`)
}
