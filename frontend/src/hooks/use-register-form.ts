import { useState, type FormEvent } from 'react'
import { fieldStep } from '@/data/auth'
import type { AuthError } from '@/interfaces/auth'
import type { RegisterForm } from '@/interfaces/register'
import { checkRegisterStep } from '@/lib/auth/check-register-step'
import { registerCounterparty } from '@/lib/auth/register-counterparty'

const BLANK: RegisterForm = { name: '', email: '', business: '', type: null, npwp: '', address: '', password: '', confirm: '', agree: false }
const LAST_STEP = 2

/* State and actions of the three-step registration form for a second party. */
export function useRegisterForm() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(BLANK)
  const [error, setError] = useState<AuthError | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<{ token: string; email: string } | null>(null)

  // an error also jumps back to the step that owns the field
  const fail = (res: AuthError) => {
    setError(res)
    if (res.field && fieldStep[res.field] !== undefined) setStep(fieldStep[res.field])
  }

  const on = <K extends keyof RegisterForm>(key: K) => (value: RegisterForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    // picking a type answers the "type" error straight away
    if (key === 'type' && error?.field === 'type') setError(null)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const res = checkRegisterStep(step, form)
    if (!res.ok) return fail(res)
    if (step < LAST_STEP) {
      setError(null)
      return setStep(step + 1)
    }
    setBusy(true)
    const reg = await registerCounterparty(form)
    setBusy(false)
    if (!reg.ok) return fail(reg)
    setError(null)
    setDone({ token: reg.token, email: reg.email })
  }

  const back = () => {
    setError(null)
    setStep((s) => Math.max(0, s - 1))
  }

  return { step, form, error, busy, done, on, submit, back }
}
