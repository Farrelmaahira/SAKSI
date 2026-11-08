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
      <h2 className="text-[3rem] font-[350] tracking-[-0.03em] leading-[1.1] md:text-[3.6rem]">{sent ? 'Cek email Anda' : 'Lupa kata sandi'}</h2>
      <p className="text-[1.5rem] mt-8 mx-0 mb-28 [&_a]:border-b-[0.1rem] [&_a]:border-b-current [&_a]:[border-bottom-style:solid] [&_a]:text-blue">
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
        <form className="grid gap-20 auth-form" onSubmit={submit} noValidate>
          <div className="[animation:pop_0.35s_ease-out] grid gap-20">
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
        <div className="[animation:pop_0.35s_ease-out] grid gap-20">
          {sent.token ? (
            <MailPreview
              to={email}
              subject="Atur ulang kata sandi SAKSI"
              body="Ada permintaan untuk mengganti kata sandi akun Anda. Klik tombol di bawah dalam 30 menit. Abaikan email ini jika bukan Anda."
              action="Buat kata sandi baru"
              href={`/atur-ulang-sandi?token=${sent.token}`}
            />
          ) : (
            <p className="bg-soft rounded-[1.2rem] text-[1.4rem] leading-[1.5] py-14 px-16 [.auth-card>&]:mb-32">
              Di prototipe ini, email tersebut tidak ditemukan sehingga tidak ada email yang dikirim. Di sistem asli, pesan yang tampil tetap sama supaya orang lain tidak bisa menebak email yang terdaftar.
            </p>
          )}
          <button type="button" className="items-center [background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] [color:inherit] inline-flex text-[1.4rem] gap-8 tracking-[0.02em] py-4 px-0 uppercase [transition:color_0.3s,_opacity_0.3s] [&:hover:not(:disabled)]:text-blue [&.light:hover:not(:disabled)]:[color:inherit] [&.light:hover:not(:disabled)]:opacity-[0.7] disabled:cursor-not-allowed disabled:opacity-[0.3] [.hash-actions_&:hover]:[color:inherit] [.hash-actions_&:hover]:opacity-[0.7] [.verify-samples_&]:mt-0 [.verify-samples_&]:mr-24 [.verify-samples_&]:mb-10 [.verify-samples_&]:ml-0 [.hash-status_&]:[grid-column:2] [.hash-status_&]:[justify-self:start] [.d-panel-ink_.verify-samples_&]:mt-0 [.d-panel-ink_.verify-samples_&]:mr-20 [.d-panel-ink_.verify-samples_&]:mb-10 [.d-panel-ink_.verify-samples_&]:ml-0" onClick={() => setSent(null)}>
            Pakai email lain
          </button>
        </div>
      )}
    </>
  )
}
