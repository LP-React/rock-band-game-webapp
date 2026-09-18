import type { Metadata } from 'next'
import { CatalogMenu } from '../../components/MenuRoutes'
export const metadata: Metadata = { title: 'Catálogo de canciones' }
export default function CatalogPage() { return <CatalogMenu /> }
