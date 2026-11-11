'use client'

import Link from 'next/link'
import StepIndicator from '@/components/molecules/StepIndicator'
import { registerSteps } from '@/data/auth'
import { useQueryParam } from '@/hooks/use-query-param'
import { useRedirectIfSignedIn } from '@/hooks/use-redirect-if-signed-in'
import { useRegisterForm } from '@/hooks/use-register-form'
import { withFrom } from '@/lib/auth/with-from'
import AuthShell from './AuthShell'
import RegisterAccountStep from './RegisterAccountStep'
import RegisterBusinessStep from './RegisterBusinessStep'
import RegisterDone from './RegisterDone'
import RegisterPasswordStep from './RegisterPasswordStep'

export default function DaftarTemplate() {
  const fromParam = useQueryParam('from')
  const signedIn = useRedirectIfSignedIn('/dashboard')
  const { step, form, error, busy, done, on, submit, back } = useRegisterForm()

  if (signedIn) return null

  return (
    <AuthShell
      label="Daftar pihak kedua"
      title="Daftar sebagai"
      mark="mitra desa."
      lead="Untuk penyedia, UMKM, BUMDes, penerima hibah, dan penyewa. Setelah mendaftar, aktifkan akun lewat email."
      points={['Tinjau dan beri komentar per pasal', 'Tanda tangani kontrak secara digital', 'Pantau status termin pembayaran']}
    >
      {done ? (
        <RegisterDone email={done.email} token={done.token} firstName={form.name.split(' ')[0]} type={form.type ?? ''} business={form.business} />
      ) : (
        <>
          <h2 className="text-[3rem] font-[350] tracking-[-0.03em] leading-[1.1] md:text-[3.6rem]">Daftar akun pihak kedua</h2>
          <p className="text-[1.5rem] mt-8 mx-0 mb-28 [&_a]:border-b-[0.1rem] [&_a]:border-b-current [&_a]:[border-bottom-style:solid] [&_a]:text-blue">
            Sudah punya akun? <Link href={withFrom('/masuk', fromParam)}>Masuk di sini</Link>
          </p>
          <p className="bg-soft rounded-[1.2rem] text-[1.4rem] leading-[1.5] py-14 px-16 [.auth-card>&]:mb-32">Akun perangkat desa, BPD, dan Inspektorat tidak bisa didaftarkan sendiri. Akun tersebut dibuat lewat undangan Admin Daerah.</p>
          <StepIndicator steps={registerSteps} current={step} />

          <form className="grid gap-20 auth-form" onSubmit={submit} noValidate>
            {step === 0 && <RegisterAccountStep name={form.name} email={form.email} error={error} onName={on('name')} onEmail={on('email')} />}
            {step === 1 && (
              <RegisterBusinessStep
                business={form.business}
                type={form.type}
                npwp={form.npwp}
                address={form.address}
                error={error}
                onBusiness={on('business')}
                onType={on('type')}
                onNpwp={on('npwp')}
                onAddress={on('address')}
                onBack={back}
              />
            )}
            {step === 2 && (
              <RegisterPasswordStep
                password={form.password}
                confirm={form.confirm}
                agree={form.agree}
                busy={busy}
                error={error}
                onPassword={on('password')}
                onConfirm={on('confirm')}
                onAgree={on('agree')}
                onBack={back}
              />
            )}
          </form>
        </>
      )}
    </AuthShell>
  )
}
