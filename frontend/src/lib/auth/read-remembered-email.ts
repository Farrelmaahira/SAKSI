import { REMEMBERED_EMAIL_KEY } from '@/data/auth'

export function readRememberedEmail() {
  try {
    return sessionStorage.getItem(REMEMBERED_EMAIL_KEY) ?? ''
  } catch {
    return ''
  }
}
