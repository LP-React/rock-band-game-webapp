import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import ts from 'typescript'

const code = ts.transpileModule(await readFile(new URL('../src/game/menu-audio.ts', import.meta.url), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText
const { menuLevels } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)

test('silent menu envelope stays finite, follows audio intensity and discards aborted decoding', async t => {
  const originalContext = globalThis.OfflineAudioContext, originalFetch = globalThis.fetch
  t.after(() => { globalThis.fetch = originalFetch; if (originalContext) globalThis.OfflineAudioContext = originalContext; else delete globalThis.OfflineAudioContext })
  let samples = new Float32Array(480), afterDecode = () => {}
  globalThis.OfflineAudioContext = class {
    async decodeAudioData() { afterDecode(); return { sampleRate: 3200, getChannelData: () => samples } }
  }
  globalThis.fetch = async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(0) })
  assert.deepEqual([...await menuLevels('/preview.opus', new AbortController().signal)], [0, 0, 0])
  samples.fill(.25, 160, 320); samples.fill(.5, 320)
  assert.deepEqual([...await menuLevels('/preview.opus', new AbortController().signal)], [0, .5, 1])
  const controller = new AbortController(); afterDecode = () => controller.abort()
  assert.equal((await menuLevels('/preview.opus', controller.signal)).length, 0)
  globalThis.fetch = async () => ({ ok: false })
  await assert.rejects(menuLevels('/missing.opus', new AbortController().signal), /could not be loaded/)
})
