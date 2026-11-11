import { setAuthToken } from '@/lib/api/reports'
import { setSession } from './set-session'

export function logout() {
  setAuthToken('')
  setSession(null)
}
