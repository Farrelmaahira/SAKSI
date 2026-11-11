import type { RegisterInput, RegisterResult, StoredUser } from '@/interfaces/auth'
import type { CounterpartyType } from '@/interfaces/master'
import { nowIso } from '@/lib/dates/now-iso'
import { uid } from '@/lib/dates/uid'
import { addCounterparty } from '@/lib/master/add-counterparty'
import { checkAccount } from './check-account'
import { checkBusiness } from './check-business'
import { checkPassword } from './check-password'
import { hashPassword } from './hash-password'
import { issueToken } from './issue-token'
import { normalizeEmail } from './normalize-email'
import { users } from './users-store'

/* Jalur A: only pihak kedua can register themselves */
export async function registerCounterparty(input: RegisterInput): Promise<RegisterResult> {
  for (const check of [checkAccount(input.name, input.email), checkBusiness(input.business, input.type, input.npwp, input.address), checkPassword(input.password, input.confirm)]) {
    if (!check.ok) return check
  }
  const email = normalizeEmail(input.email)
  const cp = addCounterparty({
    name: input.business.trim(),
    type: input.type as CounterpartyType,
    npwp: input.npwp.trim() || undefined,
    address: input.address.trim(),
    email,
    contact: input.name.trim(),
  })
  const user: StoredUser = {
    id: uid('u-'),
    name: input.name.trim(),
    email,
    passwordHash: await hashPassword(email, input.password),
    status: 'menunggu_verifikasi',
    failedAttempts: 0,
    createdAt: nowIso(),
    roles: [{ id: uid('r-'), role: 'pihak_kedua', title: cp.type, counterpartyId: cp.id }],
  }
  users.set((list) => [...list, user])
  return { ok: true, token: issueToken(user.id, 'verifikasi', 24 * 60), email }
}
