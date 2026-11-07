import type { Session } from '@/interfaces/auth'
import { update } from '@/lib/db/update'
import { log } from '@/lib/db/log'
import { find } from '@/lib/db/find'

export function setSelfReport(code: string, allowed: boolean, s: Session) {
  update(code, (c) => ({ ...c, selfReport: allowed }))
  log(s, allowed ? 'Mengizinkan pihak kedua melapor progres' : 'Menutup laporan progres oleh pihak kedua', find(code))
}
