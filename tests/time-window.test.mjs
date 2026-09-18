import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import ts from 'typescript'
const code = ts.transpileModule(await readFile(new URL('../src/game/time-window.ts', import.meta.url), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText
const { lowerBound, upperBound, noteTime } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
test('time windows retain exact inclusive boundaries and duplicate note indices', () => {
  const notes = Array.from({ length: 30000 }, (_, i) => ({ time: Math.floor(i / 3) / 10 }))
  for (const [from, to] of [[0, .14], [50, 50.3], [999, 1000], [-4, -1], [2000, 3000]]) {
    const first = lowerBound(notes, from, noteTime), last = upperBound(notes, to, noteTime)
    assert.deepEqual(notes.slice(first, last), notes.filter(note => note.time >= from && note.time <= to))
  }
  let reads = 0
  lowerBound(notes, 700, note => { reads++; return note.time })
  assert.ok(reads <= 15, `Expected logarithmic lookup, got ${reads} reads`)
  assert.equal(lowerBound([], 1, noteTime), 0)
})
