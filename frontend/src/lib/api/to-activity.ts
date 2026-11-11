import { auditActions } from '@/data/audit-actions'
import type { ActivityItem } from '@/interfaces/activity'
import type { AuditLogItem } from '@/interfaces/api'
import { roleLabelOf } from '@/lib/dash/role-label-of'

/* GET /audit-logs row -> feed line. The server names the contract by id and title. */
export const toActivity = (l: AuditLogItem): ActivityItem => ({
  id: String(l.id),
  at: l.waktu,
  actor: l.aktorNama,
  role: roleLabelOf(l.aktorRole),
  action: auditActions[l.aksi]?.label ?? l.aksi,
  detail: l.contractJudul || undefined,
  contractLabel: l.contractId ? `#${l.contractId}` : undefined,
  contractHref: l.contractId ? `/dashboard/kontrak/${l.contractId}` : undefined,
})
