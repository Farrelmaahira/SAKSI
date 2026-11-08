import type { ActionKind } from '@/interfaces/db'
import type { DContract } from '@/interfaces/db'
import { scopeContracts } from '@/lib/db/scope-contracts'
import type { Session } from '@/interfaces/auth'

export interface TabItem { key: string; label: string; badge?: number; done?: boolean }

export interface ReportOption { kind: ActionKind; label: string; variant: 'primary' | 'dark' | 'ghost' | 'danger'; needsText: boolean; fallback?: string }

export interface Todo { key: string; c: DContract; text: string; tab: string; tone: 'blue' | 'red' | 'ink'; when?: string }

export type KontrakFilter = 'semua' | 'tindakan' | 'draf' | 'proses' | 'aktif' | 'selesai'

export type LaporanFilter = 'perlu' | 'semua' | 'proses' | 'selesai'

export interface TerminLine { contracts: ReturnType<typeof scopeContracts> }

export type AuditFilter = 'semua' | 'kontrak' | 'laporan' | 'akun'

export interface TabProps { c: DContract; session: Session; go: (tab: string) => void }

export interface DashCtx {
  session: Session
}

export interface NavItem {
  to: string
  label: string
  icon: string
  badge?: number
  note?: string
  end?: boolean
}

export interface NavCounts {
  reports: number
  contracts: number
}
