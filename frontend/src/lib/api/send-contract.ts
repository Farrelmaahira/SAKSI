import type { ApiResult } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

/* POST /contracts/{id}/send (kades or perangkat desa of that village): status becomes ditinjau and the second party is notified.
   With confirmCritical the person confirms the critical findings they read. Only draf or diaudit; a critical open finding (409 CRITICAL_FINDINGS) or a locked contract come back with the server's own message. */
export const sendContract = (id: number, confirmCritical = false): Promise<ApiResult<unknown>> =>
  apiRequest<unknown>(`/contracts/${id}/send`, { method: 'POST', ...(confirmCritical ? { body: { konfirmasiTemuanKritis: true } } : {}) })
