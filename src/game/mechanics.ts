import type { ChartNote } from './chart'
export interface BoostPhrase { start: number; end: number }
export interface Sustain { lane: number; end: number; from: number; group?: number }
export class Mechanics {
  health = .65
  energy = 0
  boost = false
  sustains: Sustain[] = []
  private success = new Set<number>()
  private failed = new Set<number>()
  private awarded = new Set<number>()
  private last = 0
  private tickRemainder = 0
  hit(index: number) { this.success.add(index); this.health = Math.min(1, this.health + .012) }
  miss(time: number) {
    this.health = Math.max(0, this.health - .025)
    this.failed.add(time)
  }
  hold(lane: number, from: number, end: number, group?: number) { if (end - from > .08) this.sustains.push({ lane, from, end, group }) }
  cancelGroup(group: number) { this.sustains = this.sustains.filter(s => s.group !== group) }
  release(lane: number, time: number) {
    const broken = this.sustains.filter(s => s.lane === lane && time < s.end - .04)
    this.sustains = this.sustains.filter(s => s.lane !== lane)
    if (broken.length) this.miss(broken[0].from)
    return broken.length > 0
  }
  activate() { if (this.boost || this.energy < .5) return false; this.boost = true; return true }
  update(time: number, notes: ChartNote[], phrases: BoostPhrase[], multiplier: number) {
    const delta = Math.max(0, time - this.last)
    const boostedFor = this.boost ? Math.min(delta, this.energy / .125) : 0
    for (const sustain of this.sustains) {
      const end = Math.min(time, sustain.end), start = Math.max(this.last, sustain.from)
      if (end > start) {
        const overlap = Math.max(0, Math.min(end, this.last + boostedFor) - start)
        this.tickRemainder += (end - start + overlap) * 10 * multiplier
      }
    }
    const points = Math.floor(this.tickRemainder); this.tickRemainder -= points
    this.sustains = this.sustains.filter(s => s.end > time)
    if (this.boost) { this.energy = Math.max(0, this.energy - delta * .125); if (!this.energy) this.boost = false }
    phrases.forEach((phrase, index) => {
      if (time <= phrase.end + .14 || this.awarded.has(index)) return
      this.awarded.add(index)
      const members = notes.map((note, i) => ({ note, i })).filter(({ note }) => note.time >= phrase.start && note.time < phrase.end)
      if (members.length && members.every(({ i }) => this.success.has(i)) && ![...this.failed].some(t => t >= phrase.start && t < phrase.end)) this.energy = Math.min(1, this.energy + .25)
    })
    this.last = time
    return points
  }
}
