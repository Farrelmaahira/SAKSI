import { SESSION_KEY } from '@/data/auth'
import type { Session } from '@/interfaces/auth'

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}
