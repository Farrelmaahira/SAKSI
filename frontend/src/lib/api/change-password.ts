import type { ApiResult } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

/* POST /auth/password/change (204). 400 WRONG_PASSWORD = the old password is wrong. */
export const changePassword = (passwordLama: string, passwordBaru: string): Promise<ApiResult<unknown>> =>
  apiRequest('/auth/password/change', { method: 'POST', body: { passwordLama, passwordBaru } })
