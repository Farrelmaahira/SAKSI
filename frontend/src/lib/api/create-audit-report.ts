import type { ApiResult, AuditReport, LhpFinding } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

interface Input { contractId: number; jenis: 'lhp' | 'uji_petik'; ringkasan: string; terbit: boolean; findings: Omit<LhpFinding, 'id'>[] }

/* POST /audit-reports (inspektorat). */
export const createAuditReport = (body: Input): Promise<ApiResult<AuditReport>> => apiRequest<AuditReport>('/audit-reports', { method: 'POST', body })
