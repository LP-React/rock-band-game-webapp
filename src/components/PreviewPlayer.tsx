import { useEffect, useRef, useState } from 'react'
import { MenuFade } from '../game/menu-fade'
export function PreviewPlayer({ url, start, volume, onPlaybackChange }: { url?: string; start: number; volume: number; onPlaybackChange?: (playing: boolean) => void }) {
  const audio = useRef<HTMLAudioElement>(null), enabled = useRef(true)
  const fade = useRef<MenuFade | null>(null), ending = useRef(false)
  const [playing, setPlaying] = useState(false), [error, setError] = useState('')
  function playback(playing: boolean) { setPlaying(playing); onPlaybackChange?.(playing) }
  function seekStart() { const player = audio.current!; if (Number.isFinite(player.duration)) player.currentTime = Math.max(0, Math.min(start, player.duration - 1)) }
  useEffect(() => {
    const player = audio.current!
    fade.current = new MenuFade(player)
    return () => { fade.current?.cancel(); player.pause() }
  }, [])
  useEffect(() => { fade.current?.setVolume(volume) }, [volume])
  useEffect(() => {
    const player = audio.current!
    let cancelled = false
    const transition = player.paused ? Promise.resolve(true) : fade.current!.to(0, 220)
    void transition.then(() => {
      if (cancelled) return
      player.pause(); enabled.current = true; ending.current = false
      fade.current?.reset()
      player.src = url ?? ''; player.load(); setError('')
    })
    return () => { cancelled = true; fade.current?.cancel() }
  }, [url])
  async function play() { ending.current = false; fade.current?.cancel(); try { await audio.current?.play(); void fade.current?.to(1, 450); setError('') } catch { setError('Pulsa Escuchar para iniciar el audio.') } }
  async function pause() { if (await fade.current?.to(0, 250)) audio.current?.pause() }
  return <div className="preview-player" data-playing={playing}><audio ref={audio} preload="metadata" onLoadedMetadata={() => { seekStart(); if (enabled.current) void play() }} onPlay={() => playback(true)} onPause={() => playback(false)} onEnded={() => playback(false)} onTimeUpdate={() => { const player = audio.current!; if (player.currentTime >= Math.min(player.duration - .5, Math.max(0, Math.min(start, player.duration - 1)) + 19.5) && !ending.current) { ending.current = true; void pause() } }} onError={() => { playback(false); setError('Previsualización no disponible en este navegador.') }} /><button disabled={!url} onClick={() => { enabled.current = !playing; if (playing) void pause(); else { seekStart(); void play() } }}>{playing ? 'Ⅱ Detener muestra' : '▶ Escuchar muestra'}</button><span className="preview-status"><span className="preview-meter" aria-hidden="true"><i /><i /><i /><i /></span>{playing ? 'ESCUCHANDO' : 'PREVISUALIZACIÓN'}</span>{error && <small role="status">{error}</small>}</div>
}
