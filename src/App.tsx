'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { defaults, readSettings, saveSettings } from './game/settings'
import type { Settings } from './game/settings'
import { songs } from './songs/catalog'
import type { Difficulty } from './songs/types'
import { SettingsPanel } from './components/SettingsPanel'

interface Session {
  settings: Settings
  setSettings: (value: Settings) => void
  selected: string
  difficulty: Difficulty
  select: (id: string) => void
  setDifficulty: (value: Difficulty) => void
  configure: () => void
  menuVariant: 'arcade' | 'encore'
  setMenuVariant: (value: 'arcade' | 'encore') => void
}
const SessionContext = createContext<Session | null>(null)
export function useSession() {
  const session = useContext(SessionContext)
  if (!session) throw new Error('Game session provider is missing')
  return session
}
export default function App({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => ({ ...defaults, keys: [...defaults.keys] }))
  const [ready, setReady] = useState(false), [config, setConfig] = useState(false)
  const [selected, setSelected] = useState(songs[0].id)
  const [menuVariant, setMenuVariant] = useState<'arcade' | 'encore'>('arcade')
  const [difficulty, setDifficulty] = useState<Difficulty>(songs[0].difficulties[0])
  useEffect(() => {
    let cancelled = false
    const stored = readSettings()
    queueMicrotask(() => { if (!cancelled) { setSettings(stored); setReady(true) } })
    return () => { cancelled = true }
  }, [])
  useEffect(() => { if (ready) saveSettings(settings) }, [settings, ready])
  function select(id: string) {
    const entry = songs.find(song => song.id === id)
    if (!entry) return
    setSelected(id); setDifficulty(entry.difficulties[0])
  }
  return <SessionContext.Provider value={{ settings, setSettings, selected, difficulty, select, setDifficulty, menuVariant, setMenuVariant, configure: () => setConfig(true) }}>
    {children}
    {config && <SettingsPanel settings={settings} onSave={setSettings} onClose={() => setConfig(false)} />}
  </SessionContext.Provider>
}
