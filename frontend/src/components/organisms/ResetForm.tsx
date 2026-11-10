'use client'

import { useState, type FormEvent } from 'react'
import FormAlert from '@/components/atoms/FormAlert'
import PillButton from '@/components/atoms/PillButton'
import SuccessMark from '@/components/atoms/SuccessMark'
import PasswordField from '@/components/molecules/PasswordField'
import StepIndicator from '@/components/molecules/StepIndicator'
import { resetSteps } from '@/data/auth'
import type { AuthError } from '@/interfaces/auth'
import { checkPassword } from '@/lib/auth/check-password'
import { resetPassword } from '@/lib/api/reset-password'

interface Props {
  token: string
}

export default function ResetForm({ token }: Props) {
  // the token is only checked by the server when the new password is sent (POST /auth/password/reset)
  const [check, setCheck] = useState<AuthError | { ok: true }>(token ? { ok: true } : { ok: false, error: 'Link atur ulang tidak lengkap.' })
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<AuthError | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const local = checkPassword(password, confirm)
    if (!local.ok) return setError(local)
    setBusy(true)
    const res = await resetPassword(token, password)
    setBusy(false)
    if (res.ok) return setDone(true)
    if (res.code === 'TOKEN_INVALID') return setCheck({ ok: false, error: res.error })
    setError({ ok: false, error: res.error })
  }

  const fieldError = (f: string) => (error?.field === f ? error.error : undefined)

  return (
    <>
      <StepIndicator steps={resetSteps} current={done ? 3 : 2} />
      {!check.ok ? (
        <div className="[animation:pop_0.35s_ease-out] grid gap-20">
          <h2 className="text-[3rem] font-[350] tracking-[-0.03em] leading-[1.1] md:text-[3.6rem]">Link tidak bisa dipakai</h2>
          <FormAlert>{check.error}</FormAlert>
          <PillButton to="/lupa-sandi" tone="blue">
            Minta link baru
          </PillButton>
        </div>
      ) : done ? (
        <div className="[animation:pop_0.35s_ease-out] grid gap-20">
          <div className="grid gap-10 justify-items-start">
            <SuccessMark />
            <h2 className="text-[3rem] font-[350] tracking-[-0.03em] leading-[1.1] md:text-[3.6rem]">Kata sandi sudah diganti</h2>
            <p className="text-[1.5rem] mt-8 mx-0 mb-28 [&_a]:border-b-[0.1rem] [&_a]:border-b-current [&_a]:[border-bottom-style:solid] [&_a]:text-blue">Silakan masuk dengan kata sandi baru Anda.</p>
          </div>
          <PillButton to="/masuk" tone="blue">
            Masuk sekarang
          </PillButton>
        </div>
      ) : (
        <form className="grid gap-20 auth-form" onSubmit={submit} noValidate>
          <div className="[animation:pop_0.35s_ease-out] grid gap-20">
            <h2 className="text-[3rem] font-[350] tracking-[-0.03em] leading-[1.1] md:text-[3.6rem]">Kata sandi baru</h2>
            {error && !error.field && <FormAlert>{error.error}</FormAlert>}
            {error?.field === 'token' && <FormAlert>{error.error}</FormAlert>}
            <PasswordField
              id="reset-password"
              label="Kata sandi baru"
              autoComplete="new-password"
              placeholder="Minimal 8 karakter"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldError('password')}
            />
            <PasswordField
              id="reset-confirm"
              label="Konfirmasi kata sandi"
              autoComplete="new-password"
              placeholder="Ketik ulang kata sandi"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={fieldError('confirm')}
              hint={confirm && confirm === password ? 'Kata sandi sudah sama.' : undefined}
            />
            <PillButton type="submit" tone="blue" disabled={busy}>
              {busy ? 'Menyimpan…' : 'Simpan kata sandi'}
            </PillButton>
          </div>
        </form>
      )}
    </>
  )
}
