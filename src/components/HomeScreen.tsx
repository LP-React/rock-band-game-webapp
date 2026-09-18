import type { CSSProperties } from 'react'
import { keyLabel } from '../game/settings'
import type { Settings } from '../game/settings'
import { songs } from '../songs/catalog'
import { useRef } from 'react'
import { HomeMusic } from './HomeMusic'

export function HomeScreen({ settings, count, onPlay, onConfig }: { settings: Settings; count: number; onPlay: () => void; onConfig: () => void }) {
  const spectrum = useRef<HTMLCanvasElement>(null)
  const artwork = songs.find(song => song.reactiveGuitar)?.artwork ?? songs[0].artwork
  return <main className="menu-screen home-screen" data-variant="arcade">
    <h1 className="sr-only">Riff Lab · Juego de guitarra</h1>
    <img className="menu-backdrop" src={artwork} alt="" aria-hidden="true" />
    <div className="stage-lines" aria-hidden="true" />
    <header className="menu-header"><span className="brand">RIFF<span> / LAB</span></span><span className="library-status"><i />{count} canciones · Solo</span><HomeMusic volume={settings.volume} canvas={spectrum} /></header>
    <section className="home-arena" aria-label="Menú principal">
      <div className="record-wrap"><span className="orbit-label">FIVE FRETS / ONE STAGE</span><div className="record-stage"><canvas ref={spectrum} className="record-spectrum" width={600} height={600} aria-hidden="true" /><button className="hero-record" aria-label="Jugar desde el disco" onClick={onPlay}><span className="record-label"><span className="record-overline">GUITAR RHYTHM GAME</span><strong className="record-logo">RIFF<br /><em>LAB</em></strong><span className="record-play">PULSA PARA JUGAR ↗</span></span></button></div><span className="record-caption">GUITARRA / TECLADO / ROCK</span></div>
      <nav className="home-navigation" aria-label="Opciones del juego"><p className="menu-kicker">MAIN MENU <span>01 — SOLO</span></p><button className="menu-ribbon play-ribbon" onClick={onPlay} autoFocus><span className="ribbon-number">01</span><span><strong>Jugar</strong><small>Elige tu canción</small></span><b aria-hidden="true">↗</b></button><button className="menu-ribbon config-ribbon" onClick={onConfig}><span className="ribbon-number">02</span><span><strong>Configuración</strong><small>Teclas · Volumen · Velocidad</small></span><b aria-hidden="true">⚙</b></button><p className="home-hint">Toca al llegar a la línea.<br />Mantén las notas largas hasta el final.</p></nav>
    </section>
    <footer className="menu-footer home-footer"><div className="fret-guide">{settings.keys.map((key, lane) => <span key={lane} style={{ '--lane-color': ['#78e455', '#ff526b', '#ffdd57', '#58baff', '#ffa24f'][lane] } as CSSProperties}><kbd>{keyLabel(key)}</kbd><i /></span>)}<p>Cinco colores.<br />Sin rasgueo adicional.</p></div><div className="keyboard-guide"><span><kbd>ESPACIO</kbd> Boost</span><span><kbd>ESC</kbd> Pausa</span><span><kbd>ENTER</kbd> Seleccionar</span></div></footer>
  </main>
}
