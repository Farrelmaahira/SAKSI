import type { AuthError } from '@/interfaces/auth'
import type { RegisterForm } from '@/interfaces/register'
import { checkAccount } from '@/lib/auth/check-account'
import { checkBusiness } from '@/lib/auth/check-business'
import { checkPassword } from '@/lib/auth/check-password'

/* Validates the fields of one registration step; { ok: true } means the step may move on. */
export function checkRegisterStep(step: number, f: RegisterForm): { ok: true } | AuthError {
  if (step === 0) return checkAccount(f.name, f.email)
  if (step === 1) return checkBusiness(f.business, f.type, f.npwp, f.address)
  const res = checkPassword(f.password, f.confirm)
  if (!res.ok) return res
  return f.agree ? { ok: true } : { ok: false, field: 'agree', error: 'Centang dulu persetujuan di atas.' }
}
