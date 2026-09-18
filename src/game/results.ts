export type Grade = 'SS' | 'S' | 'A' | 'B' | 'C' | 'F'
export interface GameResult {
  score: number; maxCombo: number; hits: number; missed: number; wrongPresses: number; sustainBreaks: number
  errors: number; total: number; remaining: number; accuracy: number; grade: Grade; completed: boolean; endedAt: string
}
export class AttemptStats {
  hits = 0; maxCombo = 0; missed = 0; wrongPresses = 0; sustainBreaks = 0
  hit(combo: number) { this.hits++; this.maxCombo = Math.max(this.maxCombo, combo) }
  finish(score: number, total: number, completed: boolean): GameResult {
    const errors = this.missed + this.wrongPresses + this.sustainBreaks
    const accuracy = total ? this.hits / total * 100 : 0
    const grade: Grade = !completed || !total ? 'F' : accuracy === 100 && errors === 0 ? 'SS' : accuracy >= 98 ? 'S' : accuracy >= 90 ? 'A' : accuracy >= 80 ? 'B' : accuracy >= 65 ? 'C' : 'F'
    return { score, total, completed, hits: this.hits, maxCombo: this.maxCombo, missed: this.missed, wrongPresses: this.wrongPresses, sustainBreaks: this.sustainBreaks, errors, accuracy, grade, remaining: Math.max(0, total - this.hits - this.missed), endedAt: new Date().toISOString() }
  }
}
export function saveResult(songId: string, difficulty: string, result: GameResult): boolean {
  try {
    const stored = JSON.parse(localStorage.getItem('riff-results') ?? '[]')
    const history = Array.isArray(stored) ? stored : []
    localStorage.setItem('riff-results', JSON.stringify([{ songId, difficulty, ...result }, ...history].slice(0, 50)))
    return true
  } catch { return false }
}
