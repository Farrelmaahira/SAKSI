import type { Metadata } from 'next'
import LhpTemplate from '@/components/organisms/LhpTemplate'

export const metadata: Metadata = { title: 'Laporan hasil pemeriksaan' }

// The dashboard renders after a browser-side session check, so there is no static shell to validate.
export const instant = false

export default function LhpPage() {
  return <LhpTemplate />
}
