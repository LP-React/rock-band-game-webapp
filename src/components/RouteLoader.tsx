'use client'
import { useSession } from '../App'
import { songs } from '../songs/catalog'
import { GameLoader } from './GameLoader'
export function RouteLoader() {
  const session = useSession()
  return <GameLoader song={songs.find(song => song.id === session.selected)} message="Preparando vista…" />
}
