import { useEffect, useRef, useState } from 'react'
import { defaults, keyLabel, validKeys } from '../game/settings'
import type { Settings } from '../game/settings'
const colors = ['Verde', 'Rojo', 'Amarillo', 'Azul', 'Naranja']
export function SettingsPanel({ settings, onSave, onClose }: { settings: Settings; onSave: (value: Settings) => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [draft, setDraft] = useState(settings)
  const [message, setMessage] = useState('')
  useEffect(() => { dialog.current?.showModal() }, [])
  return <dialog ref={dialog} onCancel={onClose}><div className="dialog-title"><h2>Configuración</h2><button onClick={onClose} aria-label="Cerrar configuración">×</button></div>
    <p>Cinco colores · Pulsa un botón y luego la tecla que quieras asignar.</p>
    <div className="bindings">{draft.keys.map((key, lane) => <label key={lane}>{colors[lane]}<button onKeyDown={event => {
      event.stopPropagation()
      if (event.code === 'Tab' || event.code === 'Escape') return
      event.preventDefault()
      const keys = [...draft.keys]; keys[lane] = event.code
      if (!validKeys(keys)) { setMessage('Usa letras, números o flechas diferentes. Espacio está reservado para boost.'); return }
      setDraft({ ...draft, keys }); setMessage('')
    }}>{keyLabel(key)}</button></label>)}</div>
    <label className="setting-row">Volumen <input type="range" min="0" max="100" value={draft.volume} onChange={event => setDraft({ ...draft, volume: Number(event.target.value) })} /><strong>{draft.volume}%</strong></label>
    <label className="setting-row">Velocidad de pista <input type="range" min="0.5" max="2" step="0.1" value={draft.speed} onChange={event => setDraft({ ...draft, speed: Number(event.target.value) })} /><strong>{draft.speed.toFixed(1)}×</strong></label>
    <p>La velocidad cambia cuánto tiempo ves las notas, sin alterar la música ni la ventana de acierto. Boost: espacio, con al menos media barra.</p>
    {message && <p role="alert">{message}</p>}
    <div className="dialog-actions"><button onClick={() => { setDraft({ ...defaults, keys: [...defaults.keys] }); setMessage('') }}>Restablecer</button><button className="primary" onClick={() => { onSave(draft); onClose() }}>Guardar</button></div>
  </dialog>
}
