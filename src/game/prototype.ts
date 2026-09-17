import { chart, DURATION, HIT_WINDOW } from './chart'

import { makeDemoAudio } from './demo-audio'
import { drawHighway } from './renderer'
import { loadSongAudio } from '../songs/audio-loader'
import type { Song, Difficulty } from '../songs/types'
import { Mechanics } from './mechanics'
import { defaults, keyLabel, validKeys } from './settings'
import type { Settings } from './settings'

export class Prototype {
  private ctx: CanvasRenderingContext2D
  private audio?: AudioContext
  private master?: GainNode
  private guitar?: GainNode
  private sources: AudioBufferSourceNode[] = []
  private buffers?: AudioBuffer[]
  private songId = 'demo'
  private notes = chart
  private mechanics = new Mechanics()
  private phrases: { start: number; end: number }[] = []
  private settings = defaults
  private duration = DURATION
  private beats = Array.from({ length: 44 }, (_, index) => index * .5)
  private held = new Set<number>()
  private judged = new Set<number>()
  private pressed = new Map<number, Set<number>>()
  private flashes = [0, 0, 0, 0, 0]
  private started = 0
  private active = false
  private destroyed = false
  private generation = 0
  private score = 0
  private streak = 0
  private frame = 0
  private canvas: HTMLCanvasElement
  private notify: (message: string, active: boolean) => void
  constructor(canvas: HTMLCanvasElement, notify: (message: string, active: boolean) => void) {
    this.canvas = canvas
    this.notify = notify
    this.ctx = canvas.getContext('2d')!
    window.addEventListener('keydown', this.keydown)
    window.addEventListener('keyup', this.keyup)
    window.addEventListener('blur', this.blur)
    document.addEventListener('visibilitychange', this.visibility)
    this.render()
  }
  private position() { return this.active && this.audio ? Math.max(0, this.audio.currentTime - this.started) : 0 }
  configure(song: Song, difficulty: Difficulty) {
    this.stop(false)
    const notes = song.charts[difficulty]
    if (!notes) throw new Error('La canción no contiene esta dificultad.')
    this.notes = notes; this.beats = song.beats; this.duration = song.duration
    this.phrases = song.boostPhrases ?? []; this.mechanics = new Mechanics()
    this.judged.clear(); this.pressed.clear(); this.flashes.fill(0)
    this.score = 0; this.streak = 0
    this.notify('Listo para tocar', false)
  }
  async start(volume: number, song?: Song, difficulty: Difficulty = 'easy') {
    this.stop(false)
    const generation = this.generation
    this.audio ??= new AudioContext()
    await this.audio.resume()
    if (this.destroyed || generation !== this.generation) return
    if (!this.master) {
      this.master = this.audio.createGain()
      this.master.connect(this.audio.destination)
      this.guitar = this.audio.createGain()
      this.guitar.connect(this.master)
    }
    const id = song?.id ?? 'demo'
    if (id !== this.songId) { this.buffers = undefined; this.songId = id }
    if (!this.buffers) {
      this.notify('Cargando audio y chart…', false)
      const buffers = song ? await loadSongAudio(this.audio, song) : makeDemoAudio(this.audio)
      if (this.destroyed || generation !== this.generation) return
      this.buffers = buffers
    }
    this.notes = song?.charts[difficulty] ?? chart
    if (song && !song.charts[difficulty]) throw new Error('La canción no contiene esta dificultad.')
    this.duration = song ? Math.max(...this.buffers.map(buffer => buffer.duration)) : DURATION
    this.beats = song?.beats ?? Array.from({ length: 44 }, (_, index) => index * .5)
    this.phrases = song?.boostPhrases ?? []; this.mechanics = new Mechanics()
    this.setVolume(volume)
    this.guitar!.gain.cancelScheduledValues(this.audio.currentTime)
    this.guitar!.gain.setValueAtTime(1, this.audio.currentTime)
    this.started = this.audio.currentTime + 0.1
    this.sources = this.buffers.map((buffer, index) => {
      const source = this.audio!.createBufferSource()
      source.buffer = buffer
      source.connect(index === 0 ? this.master! : this.guitar!)
      source.start(this.started)
      return source
    })
    this.judged.clear(); this.pressed.clear(); this.held.clear(); this.flashes.fill(0)
    this.score = 0; this.streak = 0; this.active = true
    this.canvas.focus({ preventScroll: true })
    this.notify(`Prepárate · Pulsa ${this.settings.keys.map(keyLabel).join('/')} al llegar a la línea`, true)
  }
  setVolume(value: number) { this.master?.gain.setTargetAtTime(value, this.audio!.currentTime, 0.02) }
  setSettings(settings: Settings) {
    if (!validKeys(settings.keys)) throw new Error('Asigna cinco teclas diferentes.')
    this.settings = { ...settings, keys: [...settings.keys] }
    this.setVolume(settings.volume / 100)
  }
  activateBoost() {
    if (this.active) this.notify(this.mechanics.activate() ? 'BOOST · Puntuación doble' : this.mechanics.boost ? 'BOOST activo' : 'Completa frases con estrellas para cargar media barra', true)
    this.canvas.focus({ preventScroll: true })
  }
  stop(report = true) {
    this.generation++
    this.active = false; this.held.clear()
    this.mechanics.sustains = []
    this.sources.forEach(source => { source.stop(); source.disconnect() })
    this.sources = []
    if (report) this.notify('Detenido · Puedes volver a tocar', false)
  }
  private gain(value: number) {
    if (this.audio && this.guitar) this.guitar.gain.setTargetAtTime(value, this.audio.currentTime, 0.015)
  }
  private miss(time = this.position()) { this.streak = 0; this.mechanics.miss(time); this.gain(0); this.notify('Fallo · Guitarra silenciada', true) }
  private keydown = (event: KeyboardEvent) => {
    if (event.target instanceof HTMLElement && /^(INPUT|BUTTON|SELECT|TEXTAREA|A)$/.test(event.target.tagName)) return
    if (!this.active || event.repeat) return
    if (event.code === 'Space') { event.preventDefault(); this.activateBoost(); return }
    const lane = this.settings.keys.indexOf(event.code)
    if (lane < 0) return
    event.preventDefault()
    this.held.add(lane)
    const time = this.position()
    this.score += this.mechanics.update(time, this.notes, this.phrases, Math.min(4, 1 + Math.floor(this.streak / 10)))
    this.expire(time)
    let index = -1, closest = Infinity
    this.notes.forEach((note, i) => {
      const distance = Math.abs(note.time - time)
      if (!this.judged.has(i) && distance <= HIT_WINDOW && distance < closest && note.lanes.includes(lane) && !this.pressed.get(i)?.has(lane)) { index = i; closest = distance }
    })
    if (index < 0) { this.miss(); return }
    const pressed = this.pressed.get(index) ?? new Set<number>()
    pressed.add(lane)
    this.pressed.set(index, pressed)
    this.flashes[lane] = performance.now()
    const note = this.notes[index]
    this.mechanics.hold(lane, Math.max(time, note.time), note.time + (note.durations?.[note.lanes.indexOf(lane)] ?? 0), index)
    if (pressed.size < this.notes[index].lanes.length) return
    this.judged.add(index)
    this.pressed.delete(index)
    this.streak++
    this.mechanics.hit(index)
    this.score += 50 * this.notes[index].lanes.length * this.multiplier()
    this.notes[index].lanes.forEach(laneIndex => { this.flashes[laneIndex] = performance.now() })
    this.gain(1)
    this.notify(`Acierto · Racha ${this.streak} · Guitarra activa`, true)
  }
  private keyup = (event: KeyboardEvent) => {
    const lane = this.settings.keys.indexOf(event.code), time = this.position()
    if (this.active) {
      this.score += this.mechanics.update(time, this.notes, this.phrases, Math.min(4, 1 + Math.floor(this.streak / 10)))
      if (this.mechanics.release(lane, time)) { this.streak = 0; this.gain(0); this.notify('Sostenido soltado antes de tiempo', true) }
    }
    this.held.delete(lane)
  }
  private blur = () => { if (this.active) this.stop(); this.held.clear() }
  private visibility = () => { if (document.hidden) this.blur() }
  private multiplier() { return Math.min(4, 1 + Math.floor(this.streak / 10)) * (this.mechanics.boost ? 2 : 1) }
  private expire(time: number) {
    this.notes.forEach((note, index) => {
      if (!this.judged.has(index) && time > note.time + HIT_WINDOW) { this.judged.add(index); this.pressed.delete(index); this.mechanics.cancelGroup(index); this.miss(note.time) }
    })
  }
  private render = () => {
    const time = this.position()
    if (this.active) this.expire(time)
    if (this.active) this.score += this.mechanics.update(time, this.notes, this.phrases, Math.min(4, 1 + Math.floor(this.streak / 10)))
    drawHighway({ canvas: this.canvas, ctx: this.ctx, time, active: this.active, held: this.held, judged: this.judged, pressed: this.pressed, flashes: this.flashes, score: this.score, streak: this.streak, multiplier: this.multiplier(), duration: this.duration, notes: this.notes, beats: this.beats, mechanics: this.mechanics, settings: this.settings, phrases: this.phrases })
    if (this.active && this.mechanics.health <= 0) { this.stop(false); this.notify(`Fin de partida · ${this.score} puntos`, false) }
    if (this.active && time >= this.duration) { this.stop(false); this.notify(`Canción terminada · ${this.score} puntos`, false) }
    this.frame = requestAnimationFrame(this.render)
  }
  destroy() {
    this.destroyed = true; this.stop(false); cancelAnimationFrame(this.frame)
    window.removeEventListener('keydown', this.keydown); window.removeEventListener('keyup', this.keyup)
    window.removeEventListener('blur', this.blur); document.removeEventListener('visibilitychange', this.visibility)
    void this.audio?.close()
  }
}
