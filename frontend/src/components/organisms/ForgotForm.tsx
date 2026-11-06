'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import PillButton from '@/components/atoms/PillButton'
import MailPreview from '@/components/molecules/MailPreview'
import StepIndicator from '@/components/molecules/StepIndicator'
import TextField from '@/components/molecules/TextField'
import { resetSteps } from '@/data/auth'
import { isEmail } from '@/lib/auth/is-email'
import { requestPasswordReset } from '@/lib/auth/request-password-reset'

interface Props {
  initialEmail: string
}

interface Sent {
  token: string | null
}

export default function ForgotForm({ initialEmail }: Props) {
  const [email, setEmail] = useState(initialEmail)
  const [error, setError] = useState<string | undefined>()
  const [sent, setSent] = useState<Sent | null>(null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!isEmail(email)) return setError('Format email belum benar, contoh: nama@desa.id')
    setError(undefined)
    setSent(requestPasswordReset(email))
  }

  return (
    <>
      <h2 className="auth-card-title">{sent ? 'Cek email Anda' : 'Lupa kata sandi'}</h2>
      <p className="auth-card-sub">
        {sent ? (
          <>
            Jika <strong>{email}</strong> terdaftar, link atur ulang sudah dikirim.
          </>
        ) : (
          <>
            Ingat kata sandi? <Link href="/masuk">Kembali masuk</Link>
          </>
        )}
      </p>
      <StepIndicator steps={resetSteps} current={sent ? 1 : 0} />

      {!sent ? (
        <form className="auth-form" onSubmit={submit} noValidate>
          <div className="auth-step">
            <TextField
              id="forgot-email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="nama@desa.id"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
            />
            <PillButton type="submit" tone="blue">
              Kirim link atur ulang
            </PillButton>
          </div>
        </form>
      ) : (
        <div className="auth-step">
          {sent.token ? (
            <MailPreview
              to={email}
              subject="Atur ulang kata sandi SAKSI"
              body="Ada permintaan untuk mengganti kata sandi akun Anda. Klik tombol di bawah dalam 30 menit. Abaikan email ini jika bukan Anda."
              action="Buat kata sandi baru"
              href={`/atur-ulang-sandi?token=${sent.token}`}
            />
          ) : (
            <p className="auth-info">
              Di prototipe ini, email tersebut tidak ditemukan sehingga tidak ada email yang dikirim. Di sistem asli, pesan yang tampil tetap sama supaya orang lain tidak bisa menebak email yang terdaftar.
            </p>
          )}
          <button type="button" className="text-btn" onClick={() => setSent(null)}>
            Pakai email lain
          </button>
        </div>
      )}
    </>
  )
}
