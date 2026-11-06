import { useSyncExternalStore } from 'react'
import { readRememberedEmail } from '@/lib/auth/read-remembered-email'

const noopSubscribe = () => () => {}

/* Email saved by the login form; empty on the server and until the browser reads it. */
export function useRememberedEmail() {
  return useSyncExternalStore(noopSubscribe, readRememberedEmail, () => '')
}
