import type { ApiResult, Me } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

/* GET /auth/me: noHp for warga, usaha for penyedia. */
export const getMe = (): Promise<ApiResult<Me>> => apiRequest<Me>('/auth/me')
