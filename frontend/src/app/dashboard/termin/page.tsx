import type { Metadata } from 'next'
import TerminTemplate from '@/components/organisms/TerminTemplate'

export const metadata: Metadata = { title: 'Termin pembayaran' }

// The dashboard renders after a browser-side session check, so there is no static shell to validate.
export const instant = false

export default function TerminPage() {
  return <TerminTemplate />
}
