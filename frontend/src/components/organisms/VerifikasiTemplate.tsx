import { Suspense } from 'react'
import VerifikasiResult from './VerifikasiResult'
import AuthShell from './AuthShell'

export default function VerifikasiTemplate() {
  return (
    <AuthShell
      label="Verifikasi email"
      title="Satu langkah lagi,"
      mark="selesai."
      lead="Setelah email terverifikasi, akun aktif dan Anda bisa masuk ke dashboard pihak kedua."
      points={['Link aktivasi berlaku 24 jam', 'Link hanya bisa dipakai sekali', 'Status akun berubah dari menunggu verifikasi menjadi aktif']}
    >
      <Suspense>
        <VerifikasiResult />
      </Suspense>
    </AuthShell>
  )
}
