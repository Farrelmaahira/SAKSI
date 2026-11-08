import { REMEMBERED_EMAIL_KEY } from '@/data/auth'

/* Carries the typed email from the login form to "Lupa kata sandi" without putting it in the URL. */
export function rememberEmail(email: string) {
  try {
    sessionStorage.setItem(REMEMBERED_EMAIL_KEY, email)
  } catch {
    /* storage blocked: the field just starts empty */
  }
}
