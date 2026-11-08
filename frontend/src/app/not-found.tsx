import type { Metadata } from 'next'
import NotFoundTemplate from '@/components/organisms/NotFoundTemplate'

export const metadata: Metadata = { title: 'Halaman tidak ditemukan' }

export default function NotFound() {
  return <NotFoundTemplate />
}
