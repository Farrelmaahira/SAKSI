'use client'

import { useSearchParams } from 'next/navigation'
import FormAlert from '@/components/atoms/FormAlert'
import PillButton from '@/components/atoms/PillButton'
import SuccessMark from '@/components/atoms/SuccessMark'
import StepIndicator from '@/components/molecules/StepIndicator'
import { verifySteps } from '@/data/auth'
import { verifyOutcome } from '@/lib/auth/verify-outcome'
import AuthShell from './AuthShell'

export default function VerifikasiTemplate() {
  const res = verifyOutcome(useSearchParams().get('token') ?? '')

  return (
    <AuthShell
      label="Verifikasi email"
      title="Satu langkah lagi,"
      mark="selesai."
      lead="Setelah email terverifikasi, akun aktif dan Anda bisa masuk ke dashboard pihak kedua."
      points={['Link aktivasi berlaku 24 jam', 'Link hanya bisa dipakai sekali', 'Status akun berubah dari menunggu verifikasi menjadi aktif']}
    >
      <StepIndicator steps={verifySteps} current={res.ok ? 4 : 3} />
      {res.ok ? (
        <div className="[animation:pop_0.35s_ease-out] grid gap-20">
          <div className="grid gap-10 justify-items-start">
            <SuccessMark />
            <h2 className="text-[3rem] font-[350] tracking-[-0.03em] leading-[1.1] md:text-[3.6rem]">Akun Anda sudah aktif</h2>
            <p className="text-[1.5rem] mt-8 mx-0 mb-28 [&_a]:border-b-[0.1rem] [&_a]:border-b-current [&_a]:[border-bottom-style:solid] [&_a]:text-blue">
              Email <strong>{res.email}</strong> terverifikasi. Silakan masuk dengan kata sandi yang Anda buat.
            </p>
          </div>
          <PillButton to="/masuk" tone="blue">
            Masuk sekarang
          </PillButton>
        </div>
      ) : (
        <div className="[animation:pop_0.35s_ease-out] grid gap-20">
          <h2 className="text-[3rem] font-[350] tracking-[-0.03em] leading-[1.1] md:text-[3.6rem]">Link tidak bisa dipakai</h2>
          <FormAlert>{res.error}</FormAlert>
          <p className="text-[1.5rem] mt-8 mx-0 mb-28 [&_a]:border-b-[0.1rem] [&_a]:border-b-current [&_a]:[border-bottom-style:solid] [&_a]:text-blue">Coba masuk dengan email Anda. Jika akun belum aktif, Anda bisa meminta link aktivasi baru dari halaman masuk.</p>
          <PillButton to="/masuk" tone="blue">
            Ke halaman masuk
          </PillButton>
        </div>
      )}
    </AuthShell>
  )
}
