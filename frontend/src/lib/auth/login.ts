import { MAX_ATTEMPTS, LOCK_MINUTES } from '@/data/auth'
import type { LoginResult, RoleKey, StoredUser, UserRole } from '@/interfaces/auth'
import { addAudit } from '@/lib/audit/add-audit'
import { setAuthToken } from '@/lib/api/reports'
import { findUser } from './find-user'
import { ensureSeedUsers, users } from './users-store'
import { isEmail } from './is-email'
import { passwordMatches } from './password-matches'
import { startSession } from './start-session'
import { updateUser } from './update-user'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

const roleMap: Record<string, RoleKey> = {
  kades: 'perangkat_desa',
  perangkat_desa: 'perangkat_desa',
  penyedia: 'pihak_kedua',
  pihak_kedua: 'pihak_kedua',
  bpd: 'bpd',
  inspektorat: 'inspektorat',
  warga: 'warga',
}

const titleMap: Record<RoleKey, string> = {
  perangkat_desa: 'Kepala Desa',
  pihak_kedua: 'Penyedia',
  bpd: 'BPD',
  inspektorat: 'Auditor Inspektorat',
  warga: 'Pelapor',
}

export async function login(emailInput: string, password: string): Promise<LoginResult> {
  if (!isEmail(emailInput)) return { ok: false, field: 'email', error: 'Format email belum benar, contoh: nama@desa.id' }
  if (!password) return { ok: false, field: 'password', error: 'Masukkan kata sandi.' }

  // 1. Coba autentikasi ke Backend API (Database PostgreSQL)
  try {
    const apiRes = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailInput, password }),
    })

    if (apiRes.ok) {
      const data = await apiRes.json()
      if (data.token) {
        setAuthToken(data.token)
      }

      const roleKey: RoleKey = roleMap[data.role] || 'warga'
      const villageIdMap: Record<string, string> = {
        '1': 'sukamaju',
        '2': 'cibodas',
        '3': 'mekarsari',
      }
      const rawVillageId = data.villageId ? String(data.villageId) : 'sukamaju'
      const normalizedVillageId = villageIdMap[rawVillageId] || rawVillageId

      const userRole: UserRole = {
        id: `r-${data.userId}`,
        role: roleKey,
        title: titleMap[roleKey] || 'Pengguna',
        villageId: normalizedVillageId,
      }

      const storedUser: StoredUser = {
        id: `u-${data.userId}`,
        name: data.nama || emailInput,
        email: data.email || emailInput,
        passwordHash: 'seed',
        status: (data.status === 'aktif' || data.status === 'menunggu_verifikasi' || data.status === 'dikunci') ? data.status : 'aktif',
        failedAttempts: 0,
        createdAt: new Date().toISOString(),
        roles: [userRole],
      }

      // Simpan / update di users store agar sinkron dengan state frontend
      users.set((all) => {
        const idx = all.findIndex((x) => x.email.toLowerCase() === storedUser.email.toLowerCase())
        if (idx >= 0) {
          const updated = [...all]
          updated[idx] = { ...updated[idx], ...storedUser }
          return updated
        }
        return [...all, storedUser]
      })

      startSession(storedUser, userRole)
      return { ok: true, userId: storedUser.id, name: storedUser.name, roles: storedUser.roles }
    }

    if (apiRes.status === 401) {
      return { ok: false, field: 'password', error: 'Email atau kata sandi salah.' }
    }
    if (apiRes.status === 403) {
      const errData = await apiRes.json().catch(() => ({}))
      return { ok: false, code: 'unverified', error: errData.error || 'Akun belum aktif atau dikunci.' }
    }
  } catch {
    // Fallback bila backend API sedang tidak aktif
  }

  // 2. Fallback mock auth (bila backend tidak dapat dihubungi)
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
