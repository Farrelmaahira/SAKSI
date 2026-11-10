import type { ApiResult, ReportActionResult } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

interface Input { tindakan: 'klarifikasi' | 'eskalasi' | 'selesai'; catatan: string; status?: string; diteruskanKeRole?: 'bpd' | 'inspektorat' }

/* POST /reports/{id}/actions (desa, BPD, Inspektorat). Returns the new action and the report's new status. */
export const addReportAction = (id: number, body: Input): Promise<ApiResult<ReportActionResult>> =>
  apiRequest<ReportActionResult>(`/reports/${id}/actions`, { method: 'POST', body })
