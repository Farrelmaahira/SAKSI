import type { RoleKey } from '@/interfaces/auth'
import type { ProgressEntry } from '@/interfaces/db'
import { uid } from '@/lib/dates/uid'
import { stampFromNow } from '@/lib/dates/stamp-from-now'

export const prog = (percent: number, d: number, note: string, photos: number, by: string, role: RoleKey = 'perangkat_desa'): ProgressEntry => ({
  id: uid('pg-'),
  percent,
  note,
  at: stampFromNow(d),
  by,
  role,
  photos,
})
