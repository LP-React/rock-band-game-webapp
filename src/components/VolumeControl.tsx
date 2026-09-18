import { useRef } from 'react'

export function VolumeControl({ volume, onChange, muted = volume === 0, onToggle }: { volume: number; onChange: (volume: number) => void; muted?: boolean; onToggle?: () => void }) {
  const previous = useRef(volume > 0 ? volume : 100)
  function change(value: number) {
    if (value > 0) previous.current = value
    onChange(value)
  }
  function toggle() {
    if (onToggle) { onToggle(); return }
    if (volume > 0) { previous.current = volume; onChange(0) }
    else onChange(previous.current)
  }
  return <div className="home-volume">
    <button className="music-volume-toggle" aria-label={muted ? 'Activar sonido' : 'Silenciar música'} title={muted ? 'Activar sonido' : 'Silenciar música'} aria-pressed={!muted} onClick={toggle}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4 6 8H3v8h3l5 4Z" />{muted || volume === 0 ? <path d="m16 9 6 6m0-6-6 6" /> : <><path d="M15 8a6 6 0 0 1 0 8" /><path d="M18 5a10 10 0 0 1 0 14" /></>}</svg>
    </button>
    <div className="home-volume-panel"><label>Volumen <span>{volume}%</span><input type="range" min="0" max="200" value={volume} aria-label="Volumen de la música" onChange={event => change(Number(event.target.value))} /></label></div>
  </div>
}
