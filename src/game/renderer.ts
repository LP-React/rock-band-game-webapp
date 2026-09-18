import { lowerBound, upperBound, noteTime, beatTime } from './time-window'
import type { ChartNote } from './chart'
import type { Mechanics, BoostPhrase } from './mechanics'
import { keyLabel } from './settings'
import type { Settings } from './settings'
import type { SongTheme } from '../songs/presentation'
interface RenderState { reducedMotion?: boolean; preparing?: number; theme?: SongTheme; canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; time: number; active: boolean; held: Set<number>; judged: Set<number>; pressed: Map<number, Set<number>>; flashes: number[]; score: number; streak: number; multiplier: number; duration: number; notes: ChartNote[]; beats: number[]; mechanics: Mechanics; settings: Settings; phrases: BoostPhrase[] }
const backgrounds = new WeakMap<CanvasRenderingContext2D, { key: string; ambient: CanvasGradient; board: CanvasGradient; entrance: CanvasGradient; meter: CanvasGradient }>()
const stars = new WeakMap<ChartNote[], { phrases: BoostPhrase[]; marked: boolean[] }>()
export function drawHighway(state: RenderState) {
    const accent = state.theme?.accent ?? '#c5bedc', selection = state.theme?.selection ?? '#eee9f8', panel = state.theme?.panel ?? '#353046'
    const colors = state.mechanics.boost ? Array(5).fill(accent) as string[] : ['#72eb48', '#ff4659', '#ffe14d', '#45b9ff', '#ff9d38']
    // Pulse from the adjacent chart beats, synchronized with the audio clock.
    const beatIndex = upperBound(state.beats, state.time, beatTime) - 1
    const beatStart = state.beats[beatIndex] ?? 0, beatEnd = state.beats[beatIndex + 1] ?? beatStart + .5
    const pulse = state.reducedMotion || beatIndex < 0 ? 0 : Math.exp(-6 * (state.time - beatStart) / Math.max(.1, beatEnd - beatStart))
    const boost = state.mechanics.boost
    const travel = 3 / state.settings.speed
    const { canvas, ctx: c } = state
    const w = canvas.clientWidth, h = canvas.clientHeight, dpr = Math.min(2, window.devicePixelRatio || 1)
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr) }
    c.setTransform(dpr, 0, 0, dpr, 0, 0)
    c.clearRect(0, 0, w, h)
    const key = `${w}:${h}:${dpr}:${accent}:${selection}:${panel}:${state.mechanics.boost}`
    let cached = backgrounds.get(c)
    if (cached?.key !== key) {
      const ambient = c.createRadialGradient(w * .5, h * .3, 10, w * .5, h * .5, w * .6)
      ambient.addColorStop(0, state.mechanics.boost ? accent + '70' : panel); ambient.addColorStop(1, '#07090dd9')
      const board = c.createLinearGradient(0, h * .08, 0, h * 1.04); board.addColorStop(0, '#111218'); board.addColorStop(1, '#24252d')
      const entrance = c.createLinearGradient(0, h * .08, 0, h * .28); entrance.addColorStop(0, '#101018'); entrance.addColorStop(1, '#07090d00')
      const meter = c.createLinearGradient(0, h * .55 + Math.min(170, h * .27), 0, h * .55)
      meter.addColorStop(0, panel); meter.addColorStop(.5, accent); meter.addColorStop(1, selection)
      cached = { key, ambient, board, entrance, meter }; backgrounds.set(c, cached)
    }
    let phrases = stars.get(state.notes)
    if (phrases?.phrases !== state.phrases) { phrases = { phrases: state.phrases, marked: state.notes.map(note => state.phrases.some(phrase => note.time >= phrase.start && note.time < phrase.end)) }; stars.set(state.notes, phrases) }
    c.fillStyle = cached.ambient; c.fillRect(0, 0, w, h)
    const near = Math.min(w * .70, h * 1.12), top = h * .08, bottom = h * 1.04, hit = .94
    const point = (lane: number, depth: number) => {
      const scale = .25 / (1 - .75 * depth)
      return { x: w / 2 + (lane / 5 - .5) * near * scale, y: top + (bottom - top) * (scale - .25) / .75, width: near * scale / 5 }
    }
    const path = (points: { x: number; y: number }[]) => { c.beginPath(); points.forEach((p, i) => { if (i) c.lineTo(p.x, p.y); else c.moveTo(p.x, p.y) }); c.closePath() }
    path([point(0, 0), point(5, 0), point(5, 1), point(0, 1)])
    c.fillStyle = cached.board; c.fill()
    if (state.mechanics.boost) { c.shadowColor = accent; c.shadowBlur = 16 + pulse * 22 }
    for (let lane = 0; lane <= 5; lane++) {
      const a = point(lane, 0), b = point(lane, 1)
      c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y)
      c.strokeStyle = state.mechanics.boost ? accent : lane === 0 || lane === 5 ? '#9298a7' : '#60616a'; c.lineWidth = lane === 0 || lane === 5 ? 3 : 1; c.stroke()
    }
    c.shadowBlur = 0
    // Decorative grain follows the same projection as the lane geometry.
    for (let line = 0; line < 32; line++) {
      const lane = (line * 1.618) % 5, a = point(lane, 0), b = point(lane, 1)
      c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.strokeStyle = '#ffffff06'; c.lineWidth = 2; c.stroke()
    }
    if (boost) {
      c.save(); path([point(0, 0), point(5, 0), point(5, 1), point(0, 1)]); c.clip()
      c.globalAlpha = .04 + pulse * .08; c.fillStyle = accent; c.fillRect(0, 0, w, h)
      if (!state.reducedMotion) for (let trail = 0; trail < 8; trail++) {
        const depth = (trail / 8 + state.time * .6) % 1, a = point(0, depth), b = point(5, depth)
        c.globalAlpha = .08 + depth * .16; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y)
        c.strokeStyle = selection; c.lineWidth = 1 + depth * 2; c.stroke()
      }
      c.restore()
    }
    const time = state.time
    const previewTime = state.active ? time : 1.1
    const firstBeat = lowerBound(state.beats, previewTime - (1 - hit) * travel, beatTime), lastBeat = upperBound(state.beats, previewTime + hit * travel, beatTime)
    if (state.preparing !== undefined) {
      for (let line = 0; line < 8; line++) {
        const depth = (line / 8 + state.preparing * .3) % 1
        const a = point(0, depth), b = point(5, depth)
        c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.strokeStyle = '#b0b5c53a'; c.lineWidth = 1; c.stroke()
      }
    }
    for (let beat = firstBeat; state.preparing === undefined && beat < lastBeat; beat++) {
      const depth = hit - (state.beats[beat] - previewTime) / travel
      if (depth < 0 || depth > 1) continue
      const a = point(0, depth), b = point(5, depth)
      c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.strokeStyle = '#b0b5c53a'; c.lineWidth = beat % 4 === 0 ? 2 : 1; c.stroke()
    }
    const ellipse = (x: number, y: number, rx: number, ry: number, fill: string | CanvasGradient, stroke?: string) => {
      c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fillStyle = fill; c.fill()
      if (stroke) { c.strokeStyle = stroke; c.lineWidth = Math.max(1, rx * .06); c.stroke() }
    }
    const disc = (lane: number, depth: number, receptor = false) => {
      const p = point(lane + .5, depth), radius = p.width * .4, color = colors[lane]
      ellipse(p.x, p.y + radius * .2, radius * 1.12, radius * .44, '#000000aa')
      ellipse(p.x, p.y + radius * .1, radius, radius * .38, '#d5dbe2', '#515763')
      const fill = c.createLinearGradient(p.x, p.y - radius * .5, p.x, p.y + radius * .3)
      fill.addColorStop(0, '#ffffff'); fill.addColorStop(.24, color); fill.addColorStop(1, '#15161e')
      ellipse(p.x, p.y - radius * .03, radius * .94, radius * .38, fill)
      ellipse(p.x, p.y - radius * .15, radius * .64, radius * .24, receptor ? '#101218' : color, color)
      ellipse(p.x, p.y - radius * .28, radius * .37, radius * .14, receptor ? '#20232e' : '#f6fbff')
      if (receptor && state.held.has(lane)) { c.globalAlpha = .65; ellipse(p.x, p.y - radius * .12, radius * .7, radius * .25, color); c.globalAlpha = 1 }
      if (receptor && (boost || state.held.has(lane))) {
        c.save(); c.shadowColor = color; c.shadowBlur = 12 + pulse * 15; c.globalAlpha = boost ? .4 + pulse * .35 : .65
        ellipse(p.x, p.y - radius * .08, radius * (1.05 + pulse * .12), radius * .44, '#ffffff00', color)
        if (state.held.has(lane)) { c.globalAlpha = .3; ellipse(p.x, p.y - radius * .4, radius * .45, radius * .7, color) }
        c.restore()
      }
      const age = performance.now() - state.flashes[lane]
      if (receptor && state.flashes[lane] > 0 && age < 400) {
        c.globalAlpha = 1 - age / 400
        const glow = c.createRadialGradient(p.x, p.y - 20, 0, p.x, p.y - 20, radius * 1.6)
        glow.addColorStop(0, '#fff4c5'); glow.addColorStop(.3, state.mechanics.boost ? accent : '#ffba38'); glow.addColorStop(1, '#ff7c0000')
        ellipse(p.x, p.y - 20, radius * 1.6, radius * 2, glow); c.globalAlpha = 1
        for (let spark = 0; spark < 12; spark++) {
          const angle = spark * 2.4, distance = age * .2
          c.globalAlpha = 1 - age / 400
          ellipse(p.x + Math.sin(angle) * distance, p.y - Math.abs(Math.cos(angle)) * distance - 15, 2, 4, state.mechanics.boost ? selection : '#ffd36b')
        }
        c.globalAlpha = 1
      }
    }
    const a = point(0, hit), b = point(5, hit)
    c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.strokeStyle = '#ffffff88'; c.lineWidth = 2; c.stroke()
    const firstNote = lowerBound(state.notes, previewTime - (1 - hit) * travel, noteTime), lastNote = upperBound(state.notes, previewTime + hit * travel, noteTime)
    for (let i = lastNote - 1; state.preparing === undefined && i >= firstNote; i--) {
      const depth = hit - (state.notes[i].time - previewTime) / travel
      if (depth >= 0 && depth <= 1 && (!state.active || !state.judged.has(i))) state.notes[i].lanes.forEach((lane, laneIndex) => {
        if (state.active && state.pressed.get(i)?.has(lane)) return
        const duration = state.notes[i].durations?.[laneIndex] ?? 0
        if (duration > .08) {
          const tail = Math.max(0, depth - duration / travel)
          const start = point(lane + .5, depth), end = point(lane + .5, tail)
          c.beginPath(); c.moveTo(start.x, start.y); c.lineTo(end.x, end.y)
          c.strokeStyle = colors[lane]; c.lineWidth = Math.max(2, start.width * .08); c.stroke()
        }
        disc(lane, depth)
        if (phrases.marked[i]) {
          const p = point(lane + .5, depth)
          c.fillStyle = '#fff'; c.font = `bold ${Math.max(9, p.width * .32)}px Segoe UI`; c.textAlign = 'center'; c.fillText('★', p.x, p.y - p.width * .04)
        }
      })
    }
    for (const sustain of state.mechanics.sustains) {
      const start = point(sustain.lane + .5, hit), end = point(sustain.lane + .5, Math.max(0, hit - (sustain.end - time) / travel))
      c.beginPath(); c.moveTo(start.x, start.y); c.lineTo(end.x, end.y); c.strokeStyle = colors[sustain.lane]; c.lineWidth = 7; c.shadowColor = colors[sustain.lane]; c.shadowBlur = 16; c.stroke(); c.shadowBlur = 0
    }
    colors.forEach((_, lane) => {
      disc(lane, hit, true)
      const p = point(lane + .5, hit)
      c.fillStyle = '#b6b7c3'; c.font = '11px Segoe UI'; c.textAlign = 'center'; c.fillText(keyLabel(state.settings.keys[lane]), p.x, p.y + p.width * .45)
    })
    // Fade the distant entrance, including rails and arriving notes, into the background.
    c.save(); path([point(0, 0), point(5, 0), point(5, 1), point(0, 1)]); c.clip()
    c.fillStyle = cached.entrance; c.fillRect(0, top - 1, w, h * .20 + 1); c.restore()
    const compact = w < 700
    const boardLeft = point(0, hit).x
    const hudX = compact ? 12 : Math.max(20, boardLeft - 240), hudY = h * (compact ? .30 : .60)
    c.save()
    const scoreEntrance = state.preparing === undefined ? 1 : Math.min(1, state.preparing / .7)
    c.globalAlpha = scoreEntrance; c.translate(-24 * (1 - scoreEntrance), 0)
    c.textAlign = 'left'; c.fillStyle = '#c9c3d1'; c.font = '10px Segoe UI'; c.fillText('PUNTUACIÓN', hudX, hudY + 12)
    c.shadowColor = boost ? accent : '#000'; c.shadowBlur = boost ? 10 + pulse * 16 : 8
    c.fillStyle = selection; c.font = compact ? 'italic 900 25px Consolas, monospace' : 'italic 900 42px Consolas, monospace'
    c.fillText(String(state.score).padStart(6, '0'), hudX, hudY + (compact ? 43 : 63))
    c.shadowBlur = 0; c.fillStyle = accent; c.font = compact ? 'bold 13px Consolas, monospace' : 'bold 18px Consolas, monospace'
    c.fillText(String(state.streak) + ' RACHA', hudX + 4, hudY + (compact ? 70 : 96))
    c.restore()
    c.save()
    const lifeEntrance = state.preparing === undefined ? 1 : Math.max(0, Math.min(1, (state.preparing - .2) / .7))
    c.globalAlpha = lifeEntrance
    const meterTop = .72, gap = compact ? 12 : 22, meterWidth = compact ? 8 : 14
    const themedLife = cached.meter
    // Project each segment beside the rails, sharing their perspective and slope.
    const meter = (lane: number, side: number, value: number, label: string) => {
      c.shadowColor = accent; c.shadowBlur = boost ? 8 + pulse * 10 : 0
      for (let segment = 0; segment < 20; segment++) {
        const depth = hit - segment / 20 * (hit - meterTop)
        const a = point(lane, depth), b = point(lane, depth - (hit - meterTop) / 20 * .78)
        path([{ x: a.x + side * gap, y: a.y }, { x: a.x + side * (gap + meterWidth), y: a.y }, { x: b.x + side * (gap + meterWidth), y: b.y }, { x: b.x + side * gap, y: b.y }])
        c.fillStyle = segment / 20 < value ? label === 'BOOST' || boost ? themedLife : segment < 5 ? '#ff4659' : segment < 10 ? '#ffe14d' : '#72eb48' : '#ffffff15'; c.fill()
      }
      c.shadowBlur = 0
      const top = point(lane, meterTop), bottom = point(lane, hit), middle = point(lane, (meterTop + hit) / 2)
      c.textAlign = 'center'; c.fillStyle = '#c9c3d1'; c.font = '9px Segoe UI'; c.fillText(label, top.x + side * (gap + meterWidth / 2), top.y - 14)
      if (label === 'BOOST') {
        c.strokeStyle = selection; c.lineWidth = 1; c.beginPath(); c.moveTo(middle.x - gap - meterWidth - 3, middle.y); c.lineTo(middle.x - gap + 3, middle.y); c.stroke()
        c.fillStyle = selection; c.font = '10px Segoe UI'; c.fillText(String(Math.round(value * 100)) + '%', bottom.x - gap - meterWidth / 2, bottom.y + 22)
        c.fillStyle = '#c9c3d1'; c.font = '8px Segoe UI'; c.fillText('ESPACIO', bottom.x - gap - meterWidth / 2, bottom.y + 36)
      }
      return bottom.x + side * (gap + meterWidth / 2)
    }
    meter(0, -1, state.mechanics.energy, 'BOOST')
    const multiplierX = meter(5, 1, state.mechanics.health, 'VIDA'), multiplierY = point(5, hit).y + 30, multiplierRadius = compact ? 15 : 23
    ellipse(multiplierX, multiplierY, multiplierRadius, multiplierRadius, '#100d17dd', boost ? selection : accent)
    c.fillStyle = selection; c.font = compact ? '900 14px Segoe UI' : '900 20px Segoe UI'; c.fillText('×' + state.multiplier, multiplierX, multiplierY + 6)
    c.restore()
    if (state.active && !state.mechanics.boost && state.mechanics.energy >= .5) {
      c.textAlign = 'center'; c.font = 'bold 13px Segoe UI'; c.fillStyle = selection; c.fillText('⚡ BOOST LISTO · ESPACIO', w / 2, h * .25)
    }
    if (boost) { c.textAlign = 'center'; c.font = 'bold 18px Segoe UI'; c.shadowColor = accent; c.shadowBlur = 12 + pulse * 20; c.fillStyle = selection; c.fillText(`⚡ BOOST ×${state.multiplier}`, w / 2, h * .1); c.shadowBlur = 0 }
    c.fillStyle = accent; c.fillRect(0, h - 3, w * time / state.duration, 3)
}
