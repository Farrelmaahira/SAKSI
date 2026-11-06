import type { DContract } from '@/interfaces/db'
import type { KontrakFilter } from '@/interfaces/dash'

export const groupOf = (c: DContract): Exclude<KontrakFilter, 'semua' | 'tindakan'> =>
  c.status === 'draf' || c.status === 'diaudit' ? 'draf' : c.status === 'ditinjau' || c.status === 'ditandatangani' ? 'proses' : c.status === 'selesai' ? 'selesai' : 'aktif'
