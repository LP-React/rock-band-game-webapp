// Keep the saved volume separate from the temporary transition gain.
export const menuFadeTimes = { entrance: 900, transition: 700, pause: 400, repeatGap: 1500 }
export class MenuFade {
  private gain = 0
  private volume = 1
  private timer: ReturnType<typeof setTimeout> | undefined
  private settle: ((completed: boolean) => void) | undefined
  constructor(private player: HTMLAudioElement) { player.volume = 0 }
  setVolume(volume: number) { this.volume = volume / 100; this.player.volume = this.volume * this.gain }
  reset() { this.cancel(); this.gain = 0; this.player.volume = 0 }
  cancel() { clearTimeout(this.timer); this.settle?.(false); this.settle = undefined }
  to(target: number, duration = 300): Promise<boolean> {
    this.cancel()
    const from = this.gain, started = performance.now()
    return new Promise(resolve => {
      this.settle = resolve
      const tick = () => {
        const progress = Math.min(1, (performance.now() - started) / duration)
        const smooth = progress * progress * (3 - 2 * progress)
        this.gain = from + (target - from) * smooth
        this.player.volume = this.volume * this.gain
        if (progress < 1) this.timer = setTimeout(tick, 16)
        else { this.settle = undefined; resolve(true) }
      }
      tick()
    })
  }
}
