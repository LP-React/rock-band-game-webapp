import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import ts from 'typescript'

const compile = async path => ts.transpileModule(await readFile(new URL(path, import.meta.url), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText
const url = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
async function moduleUrl(path) {
  let code = await compile(path)
  for (const match of code.matchAll(/from ['"]([.][^'"]+)['"]/g)) {
    const dependency = new URL(`${match[1]}.ts`, new URL(path, import.meta.url))
    code = code.replace(match[0], `from '${await moduleUrl(dependency)}'`)
  }
  return url(code)
}
const { Prototype } = await import(await moduleUrl('../src/game/prototype.ts'))
const { Mechanics } = await import(await moduleUrl('../src/game/mechanics.ts'))
const { validKeys } = await import(await moduleUrl('../src/game/settings.ts'))

class Element { tagName = 'CANVAS' }
class Audio {
  currentTime = 0
  destination = {}
  sources = []
  gains = []
  async resume() {}
  async close() {}
  createGain() {
    const node = { connect() {}, gain: { value: 1, cancelScheduledValues() {}, setValueAtTime(value) { this.value = value }, setTargetAtTime(value) { this.value = value } } }
    this.gains.push(node)
    return node
  }
  createBuffer(_, length) { const samples = new Float32Array(length); return { getChannelData: () => samples } }
  createBufferSource() {
    const node = { connect() {}, disconnect() {}, start(time) { this.time = time }, stop() { this.stopped = true } }
    this.sources.push(node)
    return node
  }
}
globalThis.HTMLElement = Element
globalThis.AudioContext = Audio
globalThis.window = { addEventListener() {}, removeEventListener() {}, devicePixelRatio: 1 }
globalThis.document = { addEventListener() {}, removeEventListener() {}, hidden: false }
globalThis.requestAnimationFrame = () => 1
globalThis.cancelAnimationFrame = () => {}
const drawing = new Proxy({}, { get: (_, key) => String(key).startsWith('create') ? () => ({ addColorStop() {} }) : () => {} })
const canvas = () => ({ clientWidth: 1000, clientHeight: 500, getContext: () => drawing, focus() {} })
const press = (game, code, repeat = false) => game.keydown({ target: new Element(), code, repeat, preventDefault() {} })

test('direct key presses respect timing; repeats do not score; guitar recovers', async () => {
  const game = new Prototype(canvas(), () => {})
  await game.start(.65)
  assert.equal(game.sources[0].time, game.sources[1].time)
  game.audio.currentTime = game.started + 1.85
  press(game, 'KeyA')
  assert.equal(game.score, 0)
  assert.equal(game.guitar.gain.value, 0)
  game.audio.currentTime = game.started + 1.861
  press(game, 'KeyA')
  assert.equal(game.score, 50)
  assert.equal(game.guitar.gain.value, 1)
  press(game, 'KeyA', true)
  assert.equal(game.score, 50)
  game.audio.currentTime = game.started + 2.641
  press(game, 'KeyA')
  assert.equal(game.score, 50)
  assert.equal(game.streak, 0)
  assert.equal(game.guitar.gain.value, 0)
  game.destroy()
})

test('chords complete with separate color key presses; restart clears state', async () => {
  const game = new Prototype(canvas(), () => {})
  await game.start(.5)
  game.audio.currentTime = game.started + 6
  press(game, 'KeyA')
  assert.equal(game.score, 0)
  assert.equal(game.streak, 0)
  press(game, 'Space')
  assert.equal(game.guitar.gain.value, 0)
  game.audio.currentTime += .03
  press(game, 'KeyD')
  assert.equal(game.score, 100)
  const oldSources = [...game.sources]
  await game.start(.25)
  assert.ok(oldSources.every(source => source.stopped))
  assert.equal(game.score, 0)
  assert.equal(game.held.size, 0)
  assert.equal(game.judged.size, 0)
  assert.equal(game.pressed.size, 0)
  assert.equal(game.master.gain.value, .25)
  game.blur()
  assert.equal(game.active, false)
  assert.ok(game.audio.sources.every(source => source.stopped))
  game.destroy()
})

test('wrong color fails and an incomplete chord expires without scoring', async () => {
  const game = new Prototype(canvas(), () => {})
  await game.start(.5)
  game.audio.currentTime = game.started + 2
  press(game, 'KeyS')
  assert.equal(game.score, 0)
  assert.equal(game.guitar.gain.value, 0)
  press(game, 'KeyA')
  assert.equal(game.score, 50)
  game.audio.currentTime = game.started + 6
  press(game, 'KeyA')
  game.expire(6.141)
  assert.equal(game.score, 50)
  assert.equal(game.streak, 0)
  assert.equal(game.pressed.size, 0)
  game.destroy()
})

test('sustain scoring uses elapsed song time and ends immediately on early release', () => {
  const mechanics = new Mechanics()
  mechanics.hold(0, 1, 3)
  assert.equal(mechanics.update(2, [], [], 2), 20)
  assert.equal(mechanics.update(2, [], [], 2), 0)
  const before = mechanics.health
  assert.equal(mechanics.release(0, 2), true)
  assert.ok(mechanics.health < before)
  assert.equal(mechanics.update(3, [], [], 2), 0)
  mechanics.hold(1, 4, 5)
  assert.equal(mechanics.update(5, [], [], 1), 10)
  assert.equal(mechanics.release(1, 5), false)
})

test('boost requires half energy, successful chart phrases charge once, misses cancel charge', () => {
  const mechanics = new Mechanics()
  const notes = [{ time: 1, lanes: [0] }, { time: 3, lanes: [1] }, { time: 5, lanes: [2] }]
  const phrases = [{ start: 1, end: 2 }, { start: 3, end: 4 }, { start: 5, end: 6 }]
  assert.equal(mechanics.activate(), false)
  mechanics.hit(0); mechanics.update(2.2, notes, phrases, 1)
  assert.equal(mechanics.energy, .25)
  mechanics.update(2.3, notes, phrases, 1)
  assert.equal(mechanics.energy, .25)
  mechanics.hit(1); mechanics.update(4.2, notes, phrases, 1)
  assert.equal(mechanics.energy, .5)
  assert.equal(mechanics.activate(), true)
  assert.equal(mechanics.activate(), false)
  mechanics.hit(2); mechanics.miss(5.1)
  mechanics.update(8.2, notes, phrases, 1)
  assert.ok(mechanics.energy < 1e-12)
  mechanics.update(8.3, notes, phrases, 1)
  assert.equal(mechanics.boost, false)
})

test('bindings require exactly five distinct usable color keys', () => {
  assert.equal(validKeys(['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT']), true)
  assert.equal(validKeys(['KeyA', 'KeyA', 'KeyD', 'KeyF', 'KeyG']), false)
  assert.equal(validKeys(['Space', 'KeyS', 'KeyD', 'KeyF', 'KeyG']), false)
  assert.equal(validKeys(['KeyA']), false)
})

test('remapped keyboard input hits and original bindings no longer trigger', async () => {
  const game = new Prototype(canvas(), () => {})
  game.setSettings({ keys: ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT'], volume: 50, speed: 2 })
  await game.start(.5)
  game.audio.currentTime = game.started + 2
  press(game, 'KeyA')
  assert.equal(game.score, 0)
  press(game, 'KeyQ')
  assert.equal(game.score, 50)
  game.destroy()
})
