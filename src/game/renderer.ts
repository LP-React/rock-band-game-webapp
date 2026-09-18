import type { ChartNote } from './chart'
import type { Mechanics, BoostPhrase } from './mechanics'
import { keyLabel } from './settings'
import type { Settings } from './settings'
import type { SongTheme } from '../songs/presentation'
interface RenderState { theme?: SongTheme; canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; time: number; active: boolean; held: Set<number>; judged: Set<number>; pressed: Map<number, Set<number>>; flashes: number[]; score: number; streak: number; multiplier: number; duration: number; notes: ChartNote[]; beats: number[]; mechanics: Mechanics; settings: Settings; phrases: BoostPhrase[] }
export function drawHighway(state: RenderState) {
    const accent = state.theme?.accent ?? '#c5bedc', selection = state.theme?.selection ?? '#eee9f8', panel = state.theme?.panel ?? '#353046'
    const colors = state.mechanics.boost ? Array(5).fill(accent) as string[] : ['#72eb48', '#ff4659', '#ffe14d', '#45b9ff', '#ff9d38']
    const travel = 3 / state.settings.speed
    const { canvas, ctx: c } = state
    const w = canvas.clientWidth, h = canvas.clientHeight, dpr = Math.min(2, window.devicePixelRatio || 1)
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr) }
    c.setTransform(dpr, 0, 0, dpr, 0, 0)
    c.clearRect(0, 0, w, h)
    const ambient = c.createRadialGradient(w * .5, h * .3, 10, w * .5, h * .5, w * .6)
    ambient.addColorStop(0, state.mechanics.boost ? accent + '70' : panel); ambient.addColorStop(1, '#07090dd9')
    c.fillStyle = ambient; c.fillRect(0, 0, w, h)
    const near = Math.min(w * .70, h * 1.12), top = h * .08, bottom = h * 1.04, hit = .94
    const point = (lane: number, depth: number) => {
      const scale = .25 / (1 - .75 * depth)
      return { x: w / 2 + (lane / 5 - .5) * near * scale, y: top + (bottom - top) * (scale - .25) / .75, width: near * scale / 5 }
    }
    const path = (points: { x: number; y: number }[]) => { c.beginPath(); points.forEach((p, i) => { if (i) c.lineTo(p.x, p.y); else c.moveTo(p.x, p.y) }); c.closePath() }
    path([point(0, 0), point(5, 0), point(5, 1), point(0, 1)])
    const board = c.createLinearGradient(0, top, 0, bottom); board.addColorStop(0, '#111218'); board.addColorStop(1, '#24252d')
    c.fillStyle = board; c.fill()
    if (state.mechanics.boost) { c.shadowColor = accent; c.shadowBlur = 20 }
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
    const time = state.time
    const previewTime = state.active ? time : 1.1
    for (let beat = 0; beat < state.beats.length; beat++) {
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
      const age = performance.now() - state.flashes[lane]
      if (receptor && state.flashes[lane] > 0 && age < 400) {
        c.globalAlpha = 1 - age / 400
        const glow = c.createRadialGradient(p.x, p.y - 20, 0, p.x, p.y - 20, radius * 1.6)
        glow.addColorStop(0, '#fff4c5'); glow.addColorStop(.3, state.mechanics.boost ? '#64e7ff' : '#ffba38'); glow.addColorStop(1, '#ff7c0000')
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
    for (let i = state.notes.length - 1; i >= 0; i--) {
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
        if (state.phrases.some(phrase => state.notes[i].time >= phrase.start && state.notes[i].time < phrase.end)) {
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
    const entrance = c.createLinearGradient(0, top, 0, top + h * .20)
    entrance.addColorStop(0, '#101018'); entrance.addColorStop(1, '#07090d00')
    c.save(); path([point(0, 0), point(5, 0), point(5, 1), point(0, 1)]); c.clip()
    c.fillStyle = entrance; c.fillRect(0, top - 1, w, h * .20 + 1); c.restore()
    const compact = w < 700
    const boardLeft = point(0, hit).x, boardRight = point(5, hit).x
    const hudX = compact ? 12 : Math.max(18, boardLeft - 210), hudY = h * (compact ? .38 : .62)
    c.fillStyle = panel + 'bb'; c.fillRect(hudX - 16, hudY - 24, compact ? 138 : 210, 180)
    c.fillStyle = accent; c.fillRect(hudX - 16, hudY - 24, 3, 180)
    c.textAlign = 'left'; c.fillStyle = '#a4a3b1'; c.font = '11px Segoe UI'
    c.fillText('PUNTUACIÓN', hudX, hudY)
    c.fillStyle = '#f0eff5'; c.font = `900 ${compact ? 26 : 42}px Segoe UI`; c.fillText(String(state.score).padStart(6, '0'), hudX, hudY + 45)
    c.fillStyle = accent; c.font = `bold ${compact ? 14 : 20}px Segoe UI`; c.fillText(`×${state.multiplier}  ·  ${state.streak} RACHA`, hudX, hudY + 76)
    const barWidth = compact ? 90 : 168
    c.fillStyle = accent; c.font = '11px Segoe UI'; c.fillText(state.mechanics.boost ? 'BOOST ACTIVO' : 'BOOST · ESPACIO', hudX, hudY + 112)
    c.fillStyle = '#303440'; c.fillRect(hudX, hudY + 124, barWidth, 12)
    c.fillStyle = accent; c.fillRect(hudX, hudY + 124, barWidth * state.mechanics.energy, 12)
    c.fillStyle = '#fff'; c.fillRect(hudX + barWidth / 2, hudY + 122, 1, 16)
    const lifeX = compact ? w - 30 : Math.min(w - 45, boardRight + 30), lifeY = h * .55, lifeHeight = Math.min(180, h * .30)
    c.textAlign = 'center'; c.fillStyle = '#a4a3b1'; c.font = '11px Segoe UI'; c.fillText('VIDA', lifeX + 8, lifeY - 16)
    for (let segment = 0; segment < 20; segment++) {
      const segmentY = lifeY + lifeHeight - (segment + 1) * lifeHeight / 20
      c.fillStyle = segment / 20 < state.mechanics.health ? segment < 5 ? '#ff4659' : segment < 10 ? '#ffe14d' : '#72eb48' : '#303440'
      c.fillRect(lifeX, segmentY, 16, lifeHeight / 20 - 2)
    }
    if (state.active && !state.mechanics.boost && state.mechanics.energy >= .5) {
      c.textAlign = 'center'; c.font = 'bold 13px Segoe UI'; c.fillStyle = selection; c.fillText('⚡ BOOST LISTO · ESPACIO', w / 2, h * .25)
    }
    if (state.mechanics.boost) { c.textAlign = 'center'; c.font = 'bold 24px Segoe UI'; c.fillStyle = selection; c.fillText(`⚡ BOOST ×${state.multiplier}`, w / 2, h * .1) }
    c.fillStyle = accent; c.fillRect(0, h - 3, w * time / state.duration, 3)
}
