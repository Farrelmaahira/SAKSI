import type { VerifyEmailResult } from '@/interfaces/auth'
import { verifyEmail } from './verify-email'

// Tokens are single use; remember the outcome so a re-render (or StrictMode) shows the same result.
const outcomes = new Map<string, VerifyEmailResult>()

export function verifyOutcome(token: string): VerifyEmailResult {
  if (!token) return { ok: false, error: 'Link aktivasi tidak lengkap.' }
  if (!outcomes.has(token)) outcomes.set(token, verifyEmail(token))
  return outcomes.get(token)!
}
