import type { ApiResult } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

/* DELETE /contracts/{id} (kades or perangkat desa of that village): soft-cancel, status becomes dibatalkan. 204 without a body.
   Only before signing (draf or diaudit); anything else is 409 CONTRACT_LOCKED with the server's own message. */
export const cancelContract = (id: number): Promise<ApiResult<null>> => apiRequest<null>(`/contracts/${id}`, { method: 'DELETE' })
