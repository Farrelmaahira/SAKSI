import { useMemo, useSyncExternalStore } from 'react'
import { SESSION_KEY } from '@/data/auth'
import type { Session } from '@/interfaces/auth'
import { getSession } from '@/lib/auth/get-session'
import { subscribeSession } from '@/lib/auth/subscribe-session'

/* Signed-in user from localStorage; null on the server and until the browser reads it. */
export function useSession(): Session | null {
  const raw = useSyncExternalStore(
    subscribeSession,
    () => localStorage.getItem(SESSION_KEY),
    () => null,
  )
  return useMemo(() => (raw ? getSession() : null), [raw])
}
