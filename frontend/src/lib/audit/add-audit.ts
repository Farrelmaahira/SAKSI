import type { AuditLog } from '@/interfaces/audit'
import { nowIso } from '@/lib/dates/now-iso'
import { uid } from '@/lib/dates/uid'
import { auditStore } from './audit-store'

export function addAudit(e: Omit<AuditLog, 'id' | 'at'>) {
  auditStore.set((list) => [{ ...e, id: uid('log-'), at: nowIso() }, ...list].slice(0, 400))
}
