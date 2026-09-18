import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PlayMenu } from '../../../../components/MenuRoutes'
import { songs } from '../../../../songs/catalog'
import type { Difficulty } from '../../../../songs/types'

type Props = { params: Promise<{ id: string; difficulty: string }> }
export const metadata: Metadata = { title: 'Partida', robots: { index: false, follow: false } }
export default async function PlayPage({ params }: Props) {
  const { id, difficulty } = await params
  const song = songs.find(song => song.id === id)
  if (!song || !song.difficulties.includes(difficulty as Difficulty)) notFound()
  return <PlayMenu key={`${id}/${difficulty}`} id={id} difficulty={difficulty as Difficulty} />
}
