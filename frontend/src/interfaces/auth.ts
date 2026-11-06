import type { CounterpartyType } from './master'

export type RoleKey = 'perangkat_desa' | 'pihak_kedua' | 'bpd' | 'inspektorat'

/* One row of user_roles */
export interface UserRole {
  id: string
  role: RoleKey
  title: string
  villageId?: string
  regionId?: string
  counterpartyId?: string
}

export type UserStatus = 'aktif' | 'menunggu_verifikasi' | 'dikunci'

export interface StoredUser {
  id: string
  name: string
  email: string
  /* 'seed' means the demo password; replaced by a real hash after a reset */
  passwordHash: string
  status: UserStatus
  failedAttempts: number
  lockedUntil?: number
  createdAt: string
  roles: UserRole[]
}

export interface Session {
  userId: string
  name: string
  email: string
  role: UserRole
  roles: UserRole[]
}

export type TokenKind = 'verifikasi' | 'reset'

export interface Token {
  token: string
  userId: string
  kind: TokenKind
  expiresAt: number
  usedAt?: number
}

export type Field = 'email' | 'password' | 'confirm' | 'name' | 'business' | 'type' | 'npwp' | 'address' | 'agree' | 'token'

export interface AuthError {
  ok: false
  error: string
  field?: Field
  code?: 'unverified' | 'locked'
  remaining?: number
}

export type Result = { ok: true } | AuthError

export type LoginResult = { ok: true; userId: string; name: string; roles: UserRole[] } | AuthError

export interface RegisterInput {
  name: string
  email: string
  business: string
  type: CounterpartyType | null
  npwp: string
  address: string
  password: string
  confirm: string
}

export type RegisterResult = { ok: true; token: string; email: string } | AuthError

export type VerifyEmailResult = { ok: true; email: string } | AuthError

export interface SeedAccount {
  email: string
  label: string
  note: string
}
