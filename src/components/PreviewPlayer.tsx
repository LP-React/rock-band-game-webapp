import { useEffect, useRef, useState } from 'react'
export function PreviewPlayer({ url, start, volume }: { url?: string; start: number; volume: number }) {
  const audio = useRef<HTMLAudioElement>(null), enabled = useRef(true)
  const [playing, setPlaying] = useState(false), [error, setError] = useState('')
  function seekStart() { const player = audio.current!; if (Number.isFinite(player.duration)) player.currentTime = Math.max(0, Math.min(start, player.duration - 1)) }
  useEffect(() => { if (audio.current) audio.current.volume = volume / 100 }, [volume])
  useEffect(() => {
    const player = audio.current!
    return () => { player.pause() }
  }, [])
  async function play() { try { await audio.current?.play(); setError('') } catch { setError('Pulsa Escuchar para iniciar el audio.') } }
  return <div className="preview-player"><audio ref={audio} src={url} preload="metadata" onLoadedMetadata={() => { seekStart(); if (enabled.current) void play() }} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onTimeUpdate={() => { const player = audio.current!; if (player.currentTime >= Math.max(0, Math.min(start, player.duration - 1)) + 20) player.pause() }} onError={() => { setPlaying(false); setError('Previsualización no disponible en este navegador.') }} /><button disabled={!url} onClick={() => { enabled.current = !playing; if (playing) audio.current?.pause(); else { seekStart(); void play() } }}>{playing ? 'Ⅱ Detener muestra' : '▶ Escuchar muestra'}</button><span>{playing ? 'ESCUCHANDO' : 'PREVISUALIZACIÓN'}</span>{error && <small role="status">{error}</small>}</div>
}
