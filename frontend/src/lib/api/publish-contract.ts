import type { ApiResult, Publication } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

/* POST /contracts/{id}/publish (Kepala Desa only). The server redacts personal data first and refuses to publish if that fails (503 AI_UNAVAILABLE). */
export const publishContract = (id: number): Promise<ApiResult<Publication>> => apiRequest<Publication>(`/contracts/${id}/publish`, { method: 'POST' })
