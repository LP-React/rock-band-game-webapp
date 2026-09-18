import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { keyLabel } from '../game/settings'
import { themeStyle } from '../songs/presentation'
import type { SongTheme } from '../songs/presentation'

export function HowToPlay({ keys, theme, onClose }: { keys: string[]; theme?: SongTheme; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => { dialog.current?.showModal() }, [])
  function close() { dialog.current?.close(); onClose() }
  return <dialog ref={dialog} className="how-to-play" style={themeStyle(theme) as CSSProperties} aria-labelledby="help-title" onCancel={event => { event.preventDefault(); close() }}>
    <div className="dialog-title"><div><span className="help-eyebrow">GUÍA DE JUEGO / GUITARRA</span><h2 id="help-title">Cómo jugar</h2></div><button className="help-close" aria-label="Cerrar ayuda" onClick={close}>×</button></div>
    <section className="help-inputs" aria-labelledby="help-input-title"><div className="help-section-heading"><h3 id="help-input-title">Tu guitarra, cinco teclas</h3><span>CONTROLES ACTUALES</span></div>
      <div className="help-frets">{keys.map((key, lane) => <div key={lane} style={{ '--lane-color': ['#78e455', '#ff526b', '#ffdd57', '#58baff', '#ffa24f'][lane] } as CSSProperties}><i aria-hidden="true" /><kbd>{keyLabel(key)}</kbd><span>{['Verde', 'Rojo', 'Amarillo', 'Azul', 'Naranja'][lane]}</span></div>)}</div>
      <p>Pulsa directamente cada color. No necesitas una tecla adicional para rasguear.</p>
    </section>
    <section className="help-note-types" aria-label="Tipos de notas">
      <article><span className="help-rule-number">01</span><h3>Pulsa a tiempo</h3><p>Acierta cuando el disco llegue a la línea de los cinco colores.</p></article>
      <article><span className="help-rule-number">02</span><h3>Mantén el ritmo</h3><p>Si la nota tiene una cola, mantén su tecla presionada hasta el final.</p></article>
      <article><span className="help-rule-number">03</span><h3>Combina colores</h3><p>En los acordes, pulsa las teclas de todas las notas juntas.</p></article>
    </section>
    <div className="help-details">
      <section aria-labelledby="help-score-title"><h3 id="help-score-title">Haz que cada nota cuente</h3><dl className="help-scoring"><div><dt>Racha / ×4</dt><dd>Cada 10 aciertos seguidos sube el multiplicador, hasta ×4. Un fallo rompe la racha.</dd></div><div><dt>Boost / <kbd>Espacio</kbd></dt><dd>Completa frases con estrellas para cargar energía. Con media barra puedes activar el boost y duplicar el multiplicador.</dd></div><div><dt>Vida</dt><dd>Los aciertos recuperan vida; los fallos la reducen. Si se agota, termina la partida.</dd></div></dl></section>
      <section aria-labelledby="help-menu-title"><h3 id="help-menu-title">Muévete con el teclado</h3><dl className="help-shortcuts"><div><dt><kbd>Esc</kbd></dt><dd>Pausa o continúa sin reiniciar.</dd></div><div><dt><kbd>↑</kbd> <kbd>↓</kbd></dt><dd>Selecciona una canción.</dd></div><div><dt><kbd>Enter</kbd></dt><dd>Toca la canción seleccionada.</dd></div><div><dt><kbd>Tab</kbd> <kbd>Enter</kbd></dt><dd>Recorre y activa los botones del menú.</dd></div></dl></section>
    </div>
    <div className="help-bottom"><p>Personaliza las teclas, el volumen y la velocidad visual en Configuración.</p><button className="primary" onClick={close}>Entendido <span aria-hidden="true">↗</span></button></div>
  </dialog>
}
