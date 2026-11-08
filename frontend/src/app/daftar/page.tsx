import DaftarTemplate from '@/components/organisms/DaftarTemplate'
import { pageMetadata } from '@/lib/seo/page-metadata'

export const metadata = pageMetadata({
  title: 'Daftar pihak kedua',
  description: 'Penyedia, UMKM, BUMDes, penerima hibah, dan penyewa bisa mendaftar di SAKSI untuk meninjau, menandatangani, dan memantau kontrak dengan desa.',
  path: '/daftar',
})

export default function DaftarPage() {
  return <DaftarTemplate />
}
