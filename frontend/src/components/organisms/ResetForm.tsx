'use client'

import { useState, type FormEvent } from 'react'
import FormAlert from '@/components/atoms/FormAlert'
import PillButton from '@/components/atoms/PillButton'
import SuccessMark from '@/components/atoms/SuccessMark'
import PasswordField from '@/components/molecules/PasswordField'
import StepIndicator from '@/components/molecules/StepIndicator'
import { resetSteps } from '@/data/auth'
import type { AuthError } from '@/interfaces/auth'
import { checkResetToken } from '@/lib/auth/check-reset-token'
import { resetPassword } from '@/lib/auth/reset-password'

interface Props {
  token: string
}

export default function ResetForm({ token }: Props) {
  const [check] = useState(() => (token ? checkResetToken(token) : ({ ok: false, error: 'Link atur ulang tidak lengkap.' } as AuthError)))
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<AuthError | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    const res = await resetPassword(token, password, confirm)
    setBusy(false)
    if (!res.ok) return setError(res)
    setDone(true)
  }

  const fieldError = (f: string) => (error?.field === f ? error.error : undefined)

  return (
    <>
      <StepIndicator steps={resetSteps} current={done ? 3 : 2} />
      {!check.ok ? (
        <div className="auth-step">
          <h2 className="auth-card-title">Link tidak bisa dipakai</h2>
          <FormAlert>{check.error}</FormAlert>
          <PillButton to="/lupa-sandi" tone="blue">
            Minta link baru
          </PillButton>
        </div>
      ) : done ? (
        <div className="auth-step">
          <div className="auth-success">
            <SuccessMark />
            <h2 className="auth-card-title">Kata sandi sudah diganti</h2>
            <p className="auth-card-sub">Silakan masuk dengan kata sandi baru Anda.</p>
          </div>
          <PillButton to="/masuk" tone="blue">
            Masuk sekarang
          </PillButton>
        </div>
      ) : (
        <form className="auth-form" onSubmit={submit} noValidate>
          <div className="auth-step">
            <h2 className="auth-card-title">Kata sandi baru</h2>
            <p className="auth-card-sub">
              Untuk akun <strong>{check.email}</strong>
            </p>
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
