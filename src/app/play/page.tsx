import type { Metadata } from 'next'
import { PlayMenu } from '../../components/MenuRoutes'

export const metadata: Metadata = { title: 'Partida', robots: { index: false, follow: false } }
export default function PlayPage() { return <PlayMenu /> }
