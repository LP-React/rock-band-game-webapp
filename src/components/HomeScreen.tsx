import { useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { keyLabel } from '../game/settings'
import type { Settings } from '../game/settings'
import { songs } from '../songs/catalog'
import { HomeMusic } from './HomeMusic'
import { HowToPlay } from './HowToPlay'

export function HomeScreen({ settings, onPlay, onConfig }: { settings: Settings; onPlay: () => void; onConfig: () => void }) {
  const spectrum = useRef<HTMLCanvasElement>(null)
  const [modes, setModes] = useState(false), [help, setHelp] = useState(false)
  const artwork = songs.find(song => song.reactiveGuitar)?.artwork ?? songs[0].artwork
  function closeModes() { setModes(false) }
  return <main className="menu-screen home-screen" data-variant="arcade">
    <h1 className="sr-only">Riff Lab · Juego de guitarra</h1>
    <img className="menu-backdrop" src={artwork} alt="" aria-hidden="true" />
    <div className="stage-lines" aria-hidden="true" />
    <header className="menu-header"><span className="brand">RIFF<span> / LAB</span></span><HomeMusic volume={settings.volume} canvas={spectrum} /></header>
    <section className="home-arena" aria-label="Menú principal">
      <div className="record-wrap"><div className="record-stage"><canvas ref={spectrum} className="record-spectrum" width={600} height={600} aria-hidden="true" /><button className="hero-record" aria-label="Elegir modo de juego" onClick={() => setModes(true)}><span className="record-label"><strong className="record-logo">RIFF<br /><em>LAB</em></strong></span></button></div></div>
      <nav className="home-navigation" aria-label="Opciones del juego">
        {!modes && <div className="home-main-actions"><button className="menu-ribbon play-ribbon" aria-expanded={modes} aria-controls="play-modes" onClick={() => setModes(true)} autoFocus><strong>Jugar</strong><b aria-hidden="true">↗</b></button><button className="menu-ribbon config-ribbon" onClick={onConfig}><strong>Configuración</strong><b aria-hidden="true">⚙</b></button></div>}
        {modes && <div id="play-modes" className="play-modes" onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); closeModes() } }}><button className="mode-option" onClick={onPlay} autoFocus><span><strong>Jugar solo</strong><small>Elige tu canción</small></span><b aria-hidden="true">↗</b></button><button className="mode-option friends-mode" disabled><span><strong>Con amigos</strong><small>Próximamente</small></span><b aria-hidden="true">♬</b></button><button className="mode-back" onClick={closeModes}>← Volver</button></div>}
      </nav>
    </section>
    <footer className="menu-footer home-footer">
      <p className="developer-credit">Desarrollado por <a href="https://github.com/LP-React" target="_blank" rel="noopener noreferrer">LP-React</a></p>
      <div className="home-footer-controls"><div className="fret-guide">{settings.keys.map((key, lane) => <span key={lane} style={{ '--lane-color': ['#78e455', '#ff526b', '#ffdd57', '#58baff', '#ffa24f'][lane] } as CSSProperties}><kbd>{keyLabel(key)}</kbd><i /></span>)}</div><button className="help-button" onClick={() => setHelp(true)}>Cómo jugar <span aria-hidden="true">?</span></button></div>
    </footer>
    {help && <HowToPlay keys={settings.keys} onClose={() => setHelp(false)} />}
  </main>
}
