import type { ApiResult } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

/* POST /auth/password/forgot: always the same answer. devToken only exists on development servers. */
export const forgotPassword = (email: string): Promise<ApiResult<{ message: string; devToken?: string }>> =>
  apiRequest<{ message: string; devToken?: string }>('/auth/password/forgot', { method: 'POST', body: { email } })
