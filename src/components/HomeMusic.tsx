import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { songs } from '../songs/catalog'
import { menuLevels } from '../game/menu-audio'
import { fallbackTheme } from '../songs/presentation'

export function HomeMusic({ volume, canvas, index, onSongChange }: { volume: number; canvas: RefObject<HTMLCanvasElement | null>; index: number; onSongChange: (index: number) => void }) {
  const [playing, setPlaying] = useState(false), [error, setError] = useState('')
  const [muted, setMuted] = useState(true)
  const [autoStart, setAutoStart] = useState(true)
  const audio = useRef<HTMLAudioElement>(null)
  const graph = useRef<{ context: AudioContext; analyser: AnalyserNode } | null>(null)
  const continuePlaying = useRef(true), levels = useRef<Float32Array>(new Float32Array())
  const song = songs[index]
  const ringColor = useRef(fallbackTheme.selection), redraw = useRef<(() => void) | null>(null)
  useEffect(() => {
    ringColor.current = (song.theme ?? fallbackTheme).selection
    redraw.current?.()
  }, [song.theme])
  useEffect(() => { if (audio.current) audio.current.volume = volume / 100 }, [volume])
  useEffect(() => {
    const controller = new AbortController()
    levels.current = new Float32Array()
    void menuLevels(song.preview, controller.signal).then(data => { if (!controller.signal.aborted) levels.current = data }).catch(() => { /* Keep playback available without visualization on decode failure. */ })
    return () => controller.abort()
  }, [song.preview])
  useEffect(() => {
    const player = audio.current!
    const surface = canvas.current!, painter = surface.getContext('2d')!
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const data = new Uint8Array(128)
    let frame = 0, previousLevel = 0, impact = 0
    let disposed = false
    function draw() {
      cancelAnimationFrame(frame)
      const analyser = graph.current?.analyser
      const silentLevel = levels.current[Math.floor(player.currentTime * 20)] ?? 0
      impact = player.paused || reduced.matches ? 0 : Math.max(impact * .86, Math.max(0, silentLevel - previousLevel) * 3)
      previousLevel = silentLevel
      if (analyser && !player.paused && !player.muted) analyser.getByteFrequencyData(data)
      else data.fill(player.paused ? 0 : silentLevel * 210)
      const pulse = player.paused || reduced.matches ? 0 : silentLevel ** 3 * .06 + Math.min(1, impact) * .045
      surface.parentElement!.style.setProperty('--record-pulse', String(1 + pulse))
      painter.clearRect(0, 0, 600, 600)
      painter.strokeStyle = ringColor.current; painter.lineWidth = 2
      painter.beginPath()
      for (let i = 0; i <= 96; i++) {
        const angle = i / 96 * Math.PI * 2
        const frequency = 4 + Math.min(i % 48, 47 - i % 48)
        const level = data[frequency] / 255
        const envelope = .25 + .75 * Math.abs(Math.sin(i / 96 * Math.PI * 8))
        const energy = reduced.matches ? 0 : Math.min(1, Math.max(0, (level - .2) / .8) ** 2 * 1.4 + impact * envelope)
        const radius = 237 + energy * 52
        const x = 300 + Math.cos(angle) * radius, y = 300 + Math.sin(angle) * radius
        if (i === 0) painter.moveTo(x, y); else painter.lineTo(x, y)
      }
      painter.closePath(); painter.globalAlpha = .8; painter.stroke()
      for (let i = 0; i < 96; i++) {
        const angle = i / 96 * Math.PI * 2
        const level = data[4 + i % 48] / 255
        const energy = reduced.matches ? 0 : Math.min(1, level ** 3 * 1.4 + impact * Math.abs(Math.sin(i / 96 * Math.PI * 8)))
        painter.globalAlpha = .15 + energy * .85
        painter.beginPath(); painter.moveTo(300 + Math.cos(angle) * 246, 300 + Math.sin(angle) * 246)
        painter.lineTo(300 + Math.cos(angle) * (250 + energy * 44), 300 + Math.sin(angle) * (250 + energy * 44)); painter.stroke()
      }
      if (!player.paused && !reduced.matches && !document.hidden) frame = requestAnimationFrame(draw)
    }
    redraw.current = draw
    player.addEventListener('play', draw); player.addEventListener('pause', draw)
    document.addEventListener('visibilitychange', draw); reduced.addEventListener('change', draw)
    draw()
    // Cached media can finish loading before effects attach (including Strict Mode remounts).
    queueMicrotask(() => {
      if (!disposed && continuePlaying.current && player.readyState >= 1) void player.play().catch(error => { if (!disposed && error.name !== 'AbortError') setError('Pulsa reproducir para iniciar la música.') })
    })
    return () => {
      disposed = true
      redraw.current = null
      player.removeEventListener('play', draw); player.removeEventListener('pause', draw)
      document.removeEventListener('visibilitychange', draw); reduced.removeEventListener('change', draw)
      cancelAnimationFrame(frame); player.pause(); void graph.current?.context.close(); graph.current = null
    }
  }, [canvas])
  async function play(audible = !audio.current!.muted) {
    try {
      if (audible && !graph.current) {
        const context = new AudioContext(), analyser = context.createAnalyser()
        analyser.fftSize = 256; analyser.smoothingTimeConstant = .55
        context.createMediaElementSource(audio.current!).connect(analyser); analyser.connect(context.destination)
        graph.current = { context, analyser }
      }
      if (audible) { await graph.current!.context.resume(); audio.current!.muted = false; setMuted(false) }
      await audio.current!.play(); setError('')
    } catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) setError('Pulsa reproducir para iniciar la música.') }
  }
  function change(step: number) {
    continuePlaying.current = !audio.current!.paused
    setAutoStart(continuePlaying.current)
    audio.current!.pause(); setError(''); onSongChange((index + step + songs.length) % songs.length)
  }
  return <div className="home-music" aria-label="Reproductor del menú">
    <audio ref={audio} src={song.preview} preload="auto" loop muted={muted} autoPlay={autoStart} playsInline onLoadedMetadata={() => { const player = audio.current!; player.currentTime = Math.max(0, Math.min(song.previewStart ?? 0, Math.max(0, player.duration - 1))); if (continuePlaying.current) void play() }} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setError('Audio no disponible. Prueba otra canción.')} />
    {muted && <button className="home-sound-prompt" onClick={() => void play(true)}><span aria-hidden="true">♫</span> Activar sonido</button>}
    <img src={song.artwork} alt="" />
    <div className="home-music-copy"><small>{playing ? muted ? 'REPRODUCIENDO · SIN SONIDO' : 'SONANDO AHORA' : 'EN PAUSA'}</small><strong>{song.title}</strong><span>{song.artist}</span>{error && <span role="status">{error}</span>}</div>
    <div className="home-player-actions"><div className="home-music-controls"><button aria-label="Canción anterior" onClick={() => change(-1)}>⏮</button><button className="music-toggle" aria-label={playing ? 'Pausar música' : 'Reproducir música'} onClick={() => { if (playing) audio.current!.pause(); else void play() }}>{playing ? 'Ⅱ' : '▶'}</button><button aria-label="Siguiente canción" onClick={() => change(1)}>⏭</button></div>{!muted && <button className="music-sound" aria-label="Silenciar música" onClick={() => { audio.current!.muted = true; setMuted(true) }}>Silenciar</button>}</div>
  </div>
}
