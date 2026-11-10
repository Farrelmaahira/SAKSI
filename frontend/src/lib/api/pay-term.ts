import type { ApiResult, PaymentTerm } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

/* POST /contracts/{id}/termin/{termId}/bayar (desa). Without a body the server books the full nominal today. */
export const payTerm = (id: number, termId: number): Promise<ApiResult<PaymentTerm>> =>
  apiRequest<PaymentTerm>(`/contracts/${id}/termin/${termId}/bayar`, { method: 'POST' })
