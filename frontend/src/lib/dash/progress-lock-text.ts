import type { RoleKey } from '@/interfaces/auth'
import type { ContractStatus } from '@/interfaces/db'

/* Why progress cannot be reported right now. */
export function progressLockText(status: ContractStatus, role: RoleKey): string {
  if (status === 'selesai') return 'Kontrak sudah selesai.'
  if (status !== 'berjalan') return 'Progres bisa dicatat setelah kontrak berjalan.'
  return role === 'pihak_kedua' ? 'Desa belum mengizinkan pihak kedua melapor progres.' : 'Progres dicatat oleh desa atau pihak kedua.'
}
