import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import ts from 'typescript'
const code = ts.transpileModule(await readFile(new URL('../src/game/results.ts', import.meta.url), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText
const { AttemptStats, saveResult } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
test('grades use actual accuracy with an error-free completed SS and failed F', () => {
  for (const [hits, expected] of [[100, 'SS'], [98, 'S'], [90, 'A'], [80, 'B'], [65, 'C'], [64, 'F']]) {
    const stats = new AttemptStats()
    for (let i = 1; i <= hits; i++) stats.hit(i)
    stats.missed = 100 - hits
    const result = stats.finish(1234, 100, true)
    assert.equal(result.grade, expected)
    assert.equal(result.accuracy, hits)
    assert.equal(result.maxCombo, hits)
    assert.equal(result.remaining, 0)
    assert.ok(Number.isFinite(Date.parse(result.endedAt)))
  }
  const stats = new AttemptStats(); stats.hit(1); stats.wrongPresses++
  assert.equal(stats.finish(50, 1, true).grade, 'S')
  assert.equal(stats.finish(50, 1, false).grade, 'F')
  assert.equal(new AttemptStats().finish(0, 0, true).grade, 'F')
})
test('misses, wrong presses, broken sustains and unresolved groups remain distinct', () => {
  const stats = new AttemptStats(); stats.hit(1); stats.hit(2); stats.hit(1)
  stats.missed = 2; stats.wrongPresses = 1; stats.sustainBreaks = 1
  const result = stats.finish(150, 10, false)
  assert.equal(result.hits, 3); assert.equal(result.maxCombo, 2)
  assert.equal(result.errors, 4); assert.equal(result.remaining, 5); assert.equal(result.accuracy, 30)
})
test('local history is bounded and storage failure leaves the result usable', () => {
  let stored = '[]'
  globalThis.localStorage = { getItem: () => stored, setItem: (_, value) => { stored = value } }
  const result = new AttemptStats().finish(0, 1, false)
  for (let i = 0; i < 55; i++) assert.equal(saveResult(String(i), 'expert', result), true)
  assert.equal(JSON.parse(stored).length, 50)
  assert.equal(JSON.parse(stored)[0].songId, '54')
  globalThis.localStorage = { getItem() { throw Error('Unavailable') } }
  assert.equal(saveResult('song', 'easy', result), false)
  delete globalThis.localStorage
})
