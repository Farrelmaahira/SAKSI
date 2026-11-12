import type { Metadata } from 'next'
import BuatKontrakTemplate from "@/components/organisms/BuatKontrakTemplate";

export const metadata: Metadata = { title: 'Buat kontrak' }

// The dashboard renders after a browser-side session check, so there is no static shell to validate.
export const instant = false

export default function BuatKontrakPage() {
  return <BuatKontrakTemplate />;
}
