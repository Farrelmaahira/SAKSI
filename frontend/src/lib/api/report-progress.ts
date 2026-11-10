import type { ApiResult, WorkProgress } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

interface Input { persenSelesai: number; catatan: string; termId?: number; fileIds?: number[]; buktiUrl?: string[] }

/* POST /contracts/{id}/progress (penyedia or desa). 100% closes the contract. */
export const reportProgress = (id: number, body: Input): Promise<ApiResult<WorkProgress>> =>
  apiRequest<WorkProgress>(`/contracts/${id}/progress`, { method: 'POST', body })
