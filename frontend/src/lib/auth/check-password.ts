import type { Result } from '@/interfaces/auth'

export function checkPassword(password: string, confirm: string): Result {
  if (password.length < 8) return { ok: false, field: 'password', error: 'Kata sandi minimal 8 karakter.' }
  if (confirm !== password) return { ok: false, field: 'confirm', error: 'Konfirmasi belum sama dengan kata sandi.' }
  return { ok: true }
}
