import { useState, type FormEvent } from 'react'
import { forgotPassword } from '@/lib/api/forgot-password'
import { isEmail } from '@/lib/auth/is-email'

interface Sent {
  message: string
  /* only development servers send it; never relied on in production */
  token: string | null
}

/* Asks the server to send a reset link; the screen then switches to "check your email". */
export function useForgotForm(initialEmail: string) {
  const [email, setEmail] = useState(initialEmail)
  const [error, setError] = useState<string | undefined>()
  const [sent, setSent] = useState<Sent | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isEmail(email)) return setError('Format email belum benar, contoh: nama@desa.id')
    setError(undefined)
    setBusy(true)
    const r = await forgotPassword(email.trim())
    setBusy(false)
    if (!r.ok) return setError(r.error)
    const dev = process.env.NODE_ENV !== 'production' && typeof r.data?.devToken === 'string' ? r.data.devToken : null
    setSent({ message: r.data?.message || 'Jika email terdaftar, instruksi atur ulang sandi sudah dikirim.', token: dev })
  }

  return { email, setEmail, error, sent, busy, submit, reset: () => setSent(null) }
}
