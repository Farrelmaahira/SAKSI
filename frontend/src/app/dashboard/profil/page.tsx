import type { Metadata } from 'next'
import ProfilTemplate from '@/components/organisms/ProfilTemplate'

export const metadata: Metadata = { title: 'Profil' }

// The dashboard renders after a browser-side session check, so there is no static shell to validate.
export const instant = false

export default function ProfilPage() {
  return <ProfilTemplate />
}
