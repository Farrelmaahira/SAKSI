import { MAX_ATTEMPTS, LOCK_MINUTES } from '@/data/auth'
import type { LoginResult } from '@/interfaces/auth'
import { addAudit } from '@/lib/audit/add-audit'
import { findUser } from './find-user'
import { ensureSeedUsers } from './users-store'
import { isEmail } from './is-email'
import { passwordMatches } from './password-matches'
import { startSession } from './start-session'
import { updateUser } from './update-user'

export async function login(emailInput: string, password: string): Promise<LoginResult> {
  if (!isEmail(emailInput)) return { ok: false, field: 'email', error: 'Format email belum benar, contoh: nama@desa.id' }
  if (!password) return { ok: false, field: 'password', error: 'Masukkan kata sandi.' }

  ensureSeedUsers()
  const u = findUser(emailInput)
  if (!u) return { ok: false, field: 'email', error: 'Email belum terdaftar. Pihak kedua bisa mendaftar sendiri; akun desa, BPD, dan Inspektorat dibuat lewat undangan.' }

  if (u.status === 'dikunci') {
    if (u.lockedUntil && u.lockedUntil > Date.now()) {
      const mins = Math.ceil((u.lockedUntil - Date.now()) / 60000)
      return { ok: false, code: 'locked', error: `Akun dikunci sementara setelah ${MAX_ATTEMPTS} kali salah kata sandi. Coba lagi dalam ${mins} menit, atau atur ulang kata sandi.` }
    }
    updateUser(u.id, { status: 'aktif', failedAttempts: 0, lockedUntil: undefined })
  }

  if (!(await passwordMatches(u, password))) {
    const attempts = (findUser(u.email)?.failedAttempts ?? 0) + 1
    if (attempts >= MAX_ATTEMPTS) {
      updateUser(u.id, { status: 'dikunci', failedAttempts: attempts, lockedUntil: Date.now() + LOCK_MINUTES * 60000 })
      addAudit({ actor: u.name, role: 'Sistem', action: 'Akun dikunci sementara', detail: `${MAX_ATTEMPTS} kali salah kata sandi` })
      return { ok: false, code: 'locked', error: `Akun dikunci ${LOCK_MINUTES} menit karena ${MAX_ATTEMPTS} kali salah kata sandi. Atur ulang kata sandi untuk membuka sekarang.` }
    }
    updateUser(u.id, { failedAttempts: attempts })
    return { ok: false, field: 'password', remaining: MAX_ATTEMPTS - attempts, error: `Kata sandi salah. Sisa ${MAX_ATTEMPTS - attempts} percobaan sebelum akun dikunci sementara.` }
  }

  if (u.status === 'menunggu_verifikasi') return { ok: false, code: 'unverified', error: 'Email belum diverifikasi. Buka link aktivasi yang kami kirim ke email Anda.' }

  updateUser(u.id, { failedAttempts: 0 })
  if (u.roles.length === 1) startSession(u, u.roles[0])
  return { ok: true, userId: u.id, name: u.name, roles: u.roles }
}
