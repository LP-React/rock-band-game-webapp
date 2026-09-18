import { useEffect, useRef } from 'react'
import { keyLabel } from '../game/settings'

export function HowToPlay({ keys, onClose }: { keys: string[]; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => { dialog.current?.showModal() }, [])
  function close() { dialog.current?.close(); onClose() }
  return <dialog ref={dialog} className="how-to-play" aria-labelledby="help-title" onCancel={event => { event.preventDefault(); close() }}>
    <div className="dialog-title"><h2 id="help-title">Cómo jugar</h2><button aria-label="Cerrar ayuda" onClick={close}>×</button></div>
    <p>Pulsa el color cuando la nota llegue a la línea. Mantén las notas largas hasta el final; los acordes usan varias teclas.</p>
    <div className="help-frets">{keys.map((key, lane) => <kbd key={lane} style={{ color: ['#78e455', '#ff526b', '#ffdd57', '#58baff', '#ffa24f'][lane] }}>{keyLabel(key)}</kbd>)}</div>
    <dl><div><dt>Espacio</dt><dd>Activa boost con al menos media barra.</dd></div><div><dt>Escape</dt><dd>Pausa o continúa la partida.</dd></div><div><dt>↑ / ↓ · Enter</dt><dd>Selecciona una canción y empieza a tocar en el catálogo.</dd></div><div><dt>Tab · Enter</dt><dd>Recorre y activa los botones del menú.</dd></div></dl>
    <p>Puedes cambiar las cinco teclas, el volumen y la velocidad en Configuración.</p>
    <div className="dialog-actions"><button className="primary" onClick={close}>Entendido</button></div>
  </dialog>
}
