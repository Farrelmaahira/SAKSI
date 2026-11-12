import type { Metadata } from 'next'
import BuatLaporanTemplate from "@/components/organisms/BuatLaporanTemplate";

export const metadata: Metadata = { title: 'Buat laporan' }

// The dashboard renders after a browser-side session check, so there is no static shell to validate.
export const instant = false

export default function BuatLaporanPage() {
  return <BuatLaporanTemplate />;
}
