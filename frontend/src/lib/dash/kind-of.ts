import type { AuditLog } from '@/interfaces/audit'
import type { AuditFilter } from '@/interfaces/dash'

export const kindOf = (l: AuditLog): Exclude<AuditFilter, 'semua'> =>
  /laporan/i.test(l.action) ? 'laporan' : l.contractCode ? 'kontrak' : 'akun'
