import MasukTemplate from '@/components/organisms/MasukTemplate'
import { pageMetadata } from '@/lib/seo/page-metadata'

export const metadata = pageMetadata({
  title: 'Masuk',
  description: 'Masuk ke SAKSI dengan email dan kata sandi untuk membuka dashboard kontrak desa sesuai peran Anda: perangkat desa, BPD, Inspektorat, pihak kedua, atau warga.',
  path: '/masuk',
})

export default function MasukPage() {
  return <MasukTemplate />
}
