import { auditActions } from '@/data/audit-actions'
import type { AuditLogItem } from '@/interfaces/api'

/* Readable name of an audit-log action; unknown ones show their raw code. */
export const auditLabelOf = (l: AuditLogItem) => auditActions[l.aksi]?.label ?? l.aksi
