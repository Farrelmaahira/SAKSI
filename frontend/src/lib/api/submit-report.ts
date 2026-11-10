import type { ApiResult } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'
import type { CreatedReportResponse } from '@/lib/api/reports'

interface Input { contractId: number; category: string; clause: string; text: string; location?: string; photos: File[] }

/* POST /reports (multipart, citizens only). The API has no clause or place field yet, so both travel inside deskripsi. */
export function submitReport({ contractId, category, clause, text, location, photos }: Input): Promise<ApiResult<CreatedReportResponse>> {
  const fd = new FormData()
  fd.append('contractId', String(contractId))
  fd.append('kategori', category)
  fd.append('deskripsi', `[${clause}] ${text.trim()}${location?.trim() ? ` - Lokasi: ${location.trim()}` : ''}`)
  for (const f of photos) fd.append('photos', f)
  return apiRequest<CreatedReportResponse>('/reports', { method: 'POST', body: fd })
}
