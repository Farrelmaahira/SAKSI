import type { Metadata } from 'next'
import NotifikasiTemplate from '@/components/organisms/NotifikasiTemplate'

export const metadata: Metadata = { title: 'Notifikasi' }

// The dashboard renders after a browser-side session check, so there is no static shell to validate.
export const instant = false

export default function NotifikasiPage() {
  return <NotifikasiTemplate />
}
