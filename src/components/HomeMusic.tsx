import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { songs } from '../songs/catalog'

export function HomeMusic({ volume, canvas }: { volume: number; canvas: RefObject<HTMLCanvasElement | null> }) {
  const [index, setIndex] = useState(() => Math.max(0, songs.findIndex(song => song.reactiveGuitar)))
  const [playing, setPlaying] = useState(false), [error, setError] = useState('')
  const audio = useRef<HTMLAudioElement>(null)
  const graph = useRef<{ context: AudioContext; analyser: AnalyserNode } | null>(null)
  const continuePlaying = useRef(false)
  const song = songs[index]
  useEffect(() => { if (audio.current) audio.current.volume = volume / 100 }, [volume])
  useEffect(() => {
    const player = audio.current!
    const surface = canvas.current!, painter = surface.getContext('2d')!
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const data = new Uint8Array(128)
    let frame = 0
    function draw() {
      cancelAnimationFrame(frame)
      const analyser = graph.current?.analyser
      if (analyser && !player.paused) analyser.getByteFrequencyData(data)
      else data.fill(0)
      painter.clearRect(0, 0, 600, 600)
      painter.strokeStyle = '#ffe5c3'; painter.lineWidth = 2
      painter.beginPath()
      for (let i = 0; i <= 96; i++) {
        const angle = i / 96 * Math.PI * 2
        const energy = reduced.matches ? 0 : data[4 + Math.min(i % 48, 47 - i % 48)] / 255
        const radius = 237 + energy * 38
        const x = 300 + Math.cos(angle) * radius, y = 300 + Math.sin(angle) * radius
        if (i === 0) painter.moveTo(x, y); else painter.lineTo(x, y)
      }
      painter.closePath(); painter.globalAlpha = .8; painter.stroke()
      for (let i = 0; i < 96; i++) {
        const angle = i / 96 * Math.PI * 2
        const energy = reduced.matches ? 0 : data[4 + i % 48] / 255
        painter.globalAlpha = .15 + energy * .7
        painter.beginPath(); painter.moveTo(300 + Math.cos(angle) * 246, 300 + Math.sin(angle) * 246)
        painter.lineTo(300 + Math.cos(angle) * (250 + energy * 38), 300 + Math.sin(angle) * (250 + energy * 38)); painter.stroke()
      }
      if (!player.paused && !reduced.matches && !document.hidden) frame = requestAnimationFrame(draw)
    }
    player.addEventListener('play', draw); player.addEventListener('pause', draw)
    document.addEventListener('visibilitychange', draw); reduced.addEventListener('change', draw)
    draw()
    return () => {
      player.removeEventListener('play', draw); player.removeEventListener('pause', draw)
      document.removeEventListener('visibilitychange', draw); reduced.removeEventListener('change', draw)
      cancelAnimationFrame(frame); player.pause(); void graph.current?.context.close(); graph.current = null
    }
  }, [canvas])
  async function play() {
    try {
      if (!graph.current) {
        const context = new AudioContext(), analyser = context.createAnalyser()
        analyser.fftSize = 256; analyser.smoothingTimeConstant = .85
        context.createMediaElementSource(audio.current!).connect(analyser); analyser.connect(context.destination)
        graph.current = { context, analyser }
      }
      await graph.current.context.resume(); await audio.current!.play(); setError('')
    } catch { setError('Pulsa reproducir para iniciar la música.') }
  }
  function change(step: number) {
    continuePlaying.current = !audio.current!.paused
    audio.current!.pause(); setError(''); setIndex(value => (value + step + songs.length) % songs.length)
  }
  return <div className="home-music" aria-label="Reproductor del menú">
    <audio ref={audio} src={song.preview} preload="metadata" loop onLoadedMetadata={() => { audio.current!.currentTime = song.previewStart ?? 0; if (continuePlaying.current) void play() }} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setError('Audio no disponible. Prueba otra canción.')} />
    <img src={song.artwork} alt="" />
    <div className="home-music-copy"><small>{playing ? 'SONANDO AHORA' : 'MÚSICA DEL MENÚ'}</small><strong>{song.title}</strong><span>{song.artist}</span>{error && <span role="status">{error}</span>}</div>
    <div className="home-music-controls"><button aria-label="Canción anterior" onClick={() => change(-1)}>‹</button><button aria-label={playing ? 'Pausar música' : 'Reproducir música'} onClick={() => { if (playing) audio.current!.pause(); else void play() }}>{playing ? 'Ⅱ' : '▶'}</button><button aria-label="Siguiente canción" onClick={() => change(1)}>›</button></div>
  </div>
}
