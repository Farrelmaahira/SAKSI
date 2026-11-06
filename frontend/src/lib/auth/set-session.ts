import { AUTH_EVENT, SESSION_KEY } from '@/data/auth'
import type { Session } from '@/interfaces/auth'

export function setSession(s: Session | null) {
  if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s))
  else localStorage.removeItem(SESSION_KEY)
  window.dispatchEvent(new Event(AUTH_EVENT))
}
