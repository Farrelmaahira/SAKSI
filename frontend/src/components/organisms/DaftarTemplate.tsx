'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import StepIndicator from '@/components/molecules/StepIndicator'
import { fieldStep, registerSteps } from '@/data/auth'
import { useQueryParam } from '@/hooks/use-query-param'
import { useRedirectIfSignedIn } from '@/hooks/use-redirect-if-signed-in'
import type { AuthError } from '@/interfaces/auth'
import type { CounterpartyType } from '@/interfaces/master'
import { checkAccount } from '@/lib/auth/check-account'
import { checkBusiness } from '@/lib/auth/check-business'
import { checkPassword } from '@/lib/auth/check-password'
import { registerCounterparty } from '@/lib/auth/register-counterparty'
import { withFrom } from '@/lib/auth/with-from'
import AuthShell from './AuthShell'
import RegisterAccountStep from './RegisterAccountStep'
import RegisterBusinessStep from './RegisterBusinessStep'
import RegisterDone from './RegisterDone'
import RegisterPasswordStep from './RegisterPasswordStep'

interface Done {
  token: string
  email: string
}

export default function DaftarTemplate() {
  const fromParam = useQueryParam('from')
  const signedIn = useRedirectIfSignedIn('/dashboard')
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [business, setBusiness] = useState('')
  const [type, setType] = useState<CounterpartyType | null>(null)
  const [npwp, setNpwp] = useState('')
  const [address, setAddress] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<Done | null>(null)

  if (signedIn) return null

  const fail = (res: AuthError) => {
    setError(res)
    if (res.field && fieldStep[res.field] !== undefined) setStep(fieldStep[res.field])
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (step === 0) {
      const res = checkAccount(name, email)
      if (!res.ok) return fail(res)
    } else if (step === 1) {
      const res = checkBusiness(business, type, npwp, address)
      if (!res.ok) return fail(res)
    } else {
      const res = checkPassword(password, confirm)
      if (!res.ok) return fail(res)
      if (!agree) return fail({ ok: false, field: 'agree', error: 'Centang dulu persetujuan di atas.' })
      setBusy(true)
      const reg = await registerCounterparty({ name, email, business, type, npwp, address, password, confirm })
      setBusy(false)
      if (!reg.ok) return fail(reg)
      setError(null)
      setDone({ token: reg.token, email: reg.email })
      return
    }
    setError(null)
    setStep(step + 1)
  }

  const back = () => {
    setError(null)
    setStep((s) => Math.max(0, s - 1))
  }

  return (
    <AuthShell
      label="Daftar pihak kedua"
      title="Daftar sebagai"
      mark="mitra desa."
      lead="Untuk penyedia, UMKM, BUMDes, penerima hibah, dan penyewa. Setelah mendaftar, aktifkan akun lewat email."
      points={['Tinjau dan beri komentar per pasal', 'Tanda tangani kontrak secara digital', 'Pantau status termin pembayaran']}
    >
      {done ? (
        <RegisterDone email={done.email} token={done.token} firstName={name.split(' ')[0]} type={type ?? ''} business={business} />
      ) : (
        <>
          <h2 className="auth-card-title">Daftar akun pihak kedua</h2>
          <p className="auth-card-sub">
            Sudah punya akun? <Link href={withFrom('/masuk', fromParam)}>Masuk di sini</Link>
          </p>
          <p className="auth-info">Akun perangkat desa, BPD, dan Inspektorat tidak bisa didaftarkan sendiri. Akun tersebut dibuat lewat undangan Admin Daerah.</p>
          <StepIndicator steps={registerSteps} current={step} />

          <form className="auth-form" onSubmit={submit} noValidate>
            {step === 0 && <RegisterAccountStep name={name} email={email} error={error} onName={setName} onEmail={setEmail} />}
            {step === 1 && (
              <RegisterBusinessStep
                business={business}
                type={type}
                npwp={npwp}
                address={address}
                error={error}
                onBusiness={setBusiness}
                onType={(t) => {
                  setType(t)
                  if (error?.field === 'type') setError(null)
                }}
                onNpwp={setNpwp}
                onAddress={setAddress}
                onBack={back}
              />
            )}
            {step === 2 && (
              <RegisterPasswordStep
                password={password}
                confirm={confirm}
                agree={agree}
                busy={busy}
                error={error}
                onPassword={setPassword}
                onConfirm={setConfirm}
                onAgree={setAgree}
                onBack={back}
              />
            )}
          </form>
        </>
      )}
    </AuthShell>
  )
}
