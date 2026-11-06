import type { AuditLog } from '@/interfaces/audit'
import { createStore } from '@/lib/store/create-store'
import { seedAuditLogs } from './seed-audit-logs'

/* audit_logs: every important action is recorded here and shown in "Jejak Audit" */
export const auditStore = createStore<AuditLog[]>('saksi:audit-logs', seedAuditLogs)
