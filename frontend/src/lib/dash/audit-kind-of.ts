import { auditActions } from '@/data/audit-actions'
import type { AuditLogItem } from '@/interfaces/api'

/* Which chip an audit-log row belongs to; unknown actions count as "akun & lainnya". */
export const auditKindOf = (l: AuditLogItem) => auditActions[l.aksi]?.kind ?? 'akun'
