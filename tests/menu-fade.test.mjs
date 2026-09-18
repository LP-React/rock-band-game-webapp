import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import ts from 'typescript'

const code = ts.transpileModule(await readFile(new URL('../src/game/menu-fade.ts', import.meta.url), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText
const { MenuFade } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)

test('menu fades honor saved volume and cancel obsolete pause transitions', async () => {
  const player = { volume: 1 }, fade = new MenuFade(player)
  fade.setVolume(60)
  assert.equal(player.volume, 0)
  await fade.to(1, 20)
  assert.equal(player.volume, .6)
  const obsoletePause = fade.to(0, 300)
  const resumed = fade.to(1, 20)
  assert.equal(await obsoletePause, false)
  fade.setVolume(35)
  assert.equal(await resumed, true)
  assert.equal(player.volume, .35)
  await fade.to(0, 20)
  assert.equal(player.volume, 0)
  const pending = fade.to(1, 300)
  fade.cancel()
  assert.equal(await pending, false)
})
