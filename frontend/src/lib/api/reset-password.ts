import type { ApiResult } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

/* POST /auth/password/reset (204). 400 TOKEN_INVALID = wrong, expired or used token. */
export const resetPassword = (token: string, password: string): Promise<ApiResult<unknown>> =>
  apiRequest('/auth/password/reset', { method: 'POST', body: { token, password } })
