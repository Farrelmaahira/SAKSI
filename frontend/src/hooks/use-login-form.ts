import { useState, type FormEvent } from 'react'
import type { AuthError, UserRole } from '@/interfaces/auth'
import { chooseRole } from '@/lib/auth/choose-role'
import { login } from '@/lib/auth/login'
import { resendVerification } from '@/lib/auth/resend-verification'

interface Pending {
  userId: string
  name: string
  roles: UserRole[]
}

/* The two-step sign-in: email and password, then (for accounts with several roles) which role to use. */
export function useLoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<AuthError | null>(null)
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState<Pending | null>(null)
  const [roleId, setRoleId] = useState<string | null>(null)
  const [resent, setResent] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (pending) {
      if (!roleId) return setError({ ok: false, error: 'Pilih salah satu peran dulu.' })
      return chooseRole(pending.userId, roleId)
    }
    setBusy(true)
    setResent(null)
    const res = await login(email, password)
    setBusy(false)
    if (!res.ok) return setError(res)
    setError(null)
    // a successful single-role login sets the session, which sends the user on from the page
    if (res.roles.length > 1) {
      setPending({ userId: res.userId, name: res.name, roles: res.roles })
      setRoleId(res.roles[0].id)
    }
  }

  const pickDemo = (e: string, p: string) => {
    setEmail(e)
    setPassword(p)
    setError(null)
  }

  const backToCredentials = () => {
    setPending(null)
    setError(null)
  }

  return { email, setEmail, password, setPassword, error, busy, pending, roleId, setRoleId, resent, submit, pickDemo, backToCredentials, resend: () => setResent(resendVerification(email)) }
}
