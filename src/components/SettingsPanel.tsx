import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { defaults, keyLabel, validKeys } from '../game/settings'
import type { Settings } from '../game/settings'
import { themeStyle } from '../songs/presentation'
import type { SongTheme } from '../songs/presentation'
const colors = ['Verde', 'Rojo', 'Amarillo', 'Azul', 'Naranja']
const laneColors = ['#78e455', '#ff526b', '#ffdd57', '#58baff', '#ffa24f']
export function SettingsPanel({ settings, theme, onSave, onClose }: { settings: Settings; theme?: SongTheme; onSave: (value: Settings) => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [draft, setDraft] = useState(settings)
  const [editing, setEditing] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  useEffect(() => { dialog.current?.showModal() }, [])
  function close() { dialog.current?.close(); onClose() }
  return <dialog ref={dialog} className="settings-panel" style={themeStyle(theme) as CSSProperties} aria-labelledby="settings-title" onKeyDown={event => event.stopPropagation()} onCancel={event => { event.preventDefault(); if (editing !== null) { setEditing(null); setMessage('') } else close() }}>
    <div className="dialog-title"><div><span className="settings-eyebrow">AJUSTA TU SESIÓN</span><h2 id="settings-title">Configuración</h2></div><button onClick={close} aria-label="Cerrar configuración">×</button></div>
    <section className="settings-section"><div className="settings-heading"><h3>Tu guitarra</h3><span>CINCO COLORES</span></div><p>Selecciona un control y pulsa la tecla que quieras asignar.</p>
      <div className="bindings">{draft.keys.map((key, lane) => <label key={lane} style={{ '--lane-color': laneColors[lane] } as CSSProperties}>{colors[lane]}<button type="button" data-editing={editing === lane} aria-label={`Cambiar tecla de ${colors[lane]}: ${keyLabel(key)}`} aria-pressed={editing === lane} aria-describedby="binding-status" onClick={() => { setEditing(lane); setMessage('') }} onBlur={() => { setEditing(null); setMessage('') }} onKeyDown={event => {
        event.stopPropagation()
        if (event.code === 'Tab') return
        if (editing !== lane) return
        event.preventDefault()
        if (event.code === 'Escape') { setEditing(null); setMessage(''); return }
        const duplicate = draft.keys.findIndex((value, index) => index !== lane && value === event.code)
        if (duplicate >= 0) { setMessage(`${keyLabel(event.code)} ya está asignada a ${colors[duplicate]}. Elige otra tecla.`); return }
        const keys = [...draft.keys]; keys[lane] = event.code
        if (!validKeys(keys)) { setMessage('Usa letras, números o flechas. Espacio está reservado para boost.'); return }
        setDraft({ ...draft, keys }); setEditing(null); setMessage('')
      }}>{editing === lane ? '···' : keyLabel(key)}<small>{editing === lane ? 'PULSA UNA TECLA' : 'CAMBIAR'}</small></button></label>)}</div>
      <div id="binding-status" className="binding-status" role="status" data-error={!!message}>{message || (editing !== null ? `Asignando ${colors[editing]} · Pulsa una tecla. Esc cancela.` : 'Espacio: boost · Esc: pausa. Cada color necesita una tecla diferente.')}</div>
    </section>
    <section className="settings-section"><div className="settings-heading"><h3>Tu pista</h3><span>A TU RITMO</span></div>
      <label className="setting-row"><span>Velocidad de pista<small>0.5–4.0×</small></span><input type="range" min="0.5" max="4" step="0.1" value={draft.speed} onChange={event => setDraft({ ...draft, speed: Number(event.target.value) })} /><output>{draft.speed.toFixed(1)}×</output></label>
      <p>La velocidad cambia cuánto tiempo ves las notas; la música y la ventana de acierto se mantienen.</p>
    </section>
    <div className="dialog-actions"><button onClick={() => { setDraft({ ...defaults, volume: settings.volume, keys: [...defaults.keys] }); setEditing(null); setMessage('') }}>Restablecer</button><button className="settings-save" onClick={() => { onSave({ ...draft, volume: settings.volume }); close() }}>Guardar cambios ↗</button></div>
  </dialog>
}
