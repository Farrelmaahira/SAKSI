import type { ApiResult, TerminListItem } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

/* GET /termin: signed-or-later contracts in the account's scope with their payment terms. */
export const listTermin = (): Promise<ApiResult<TerminListItem[]>> => apiRequest<TerminListItem[]>('/termin')
