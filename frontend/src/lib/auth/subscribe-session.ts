import { AUTH_EVENT } from '@/data/auth'

export function subscribeSession(cb: () => void) {
  window.addEventListener(AUTH_EVENT, cb)
  window.addEventListener('storage', cb)
  return () => {
    window.removeEventListener(AUTH_EVENT, cb)
    window.removeEventListener('storage', cb)
  }
}
