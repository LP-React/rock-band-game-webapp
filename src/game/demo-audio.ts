import { chart, DURATION, riffPitches } from './chart'

export function makeDemoAudio(audio: AudioContext) {
    const rate = 24000
    const backing = audio.createBuffer(1, DURATION * rate, rate)
    const guitar = audio.createBuffer(1, DURATION * rate, rate)
    const back = backing.getChannelData(0), lead = guitar.getChannelData(0)
    for (let beat = 0; beat < 36; beat++) {
      const start = 2 + beat * .5
      for (let j = 0; j < rate * .42 && Math.floor(start * rate) + j < back.length; j++) {
        const t = j / rate, at = Math.floor(start * rate) + j
        const kick = Math.sin(2 * Math.PI * (60 * t + 5 * (1 - Math.exp(-25 * t)))) * Math.exp(-18 * t)
        const hat = Math.sin(j * 1.77) * Math.sin(j * .63) * Math.exp(-55 * t)
        const snare = Math.sin(j * 1.31) * Math.sin(j * .27) * Math.exp(-22 * t)
        back[at] += .23 * kick + .08 * hat + (beat % 2 ? .16 * snare : 0)
      }
    }
    chart.forEach((note, index) => {
      const frequency = 440 * 2 ** ((riffPitches[index % 16] - 69) / 12)
      for (let j = 0; j < rate * .45; j++) {
        const t = j / rate, at = Math.floor(note.time * rate) + j
        const phase = 2 * Math.PI * frequency * t
        const chord = Math.sin(phase) + .45 * Math.sin(phase * 1.5) + .3 * Math.sin(phase * 2)
        lead[at] += .17 * Math.tanh(chord * 3) * Math.min(1, t * 200) * Math.exp(-7 * t)
        back[at] += .09 * Math.sin(phase / 2) * Math.min(1, t * 200) * Math.exp(-9 * t)
      }
    })
    return [backing, guitar]
  }
