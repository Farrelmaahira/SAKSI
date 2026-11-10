import type { ApiResult, Me } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

interface Input { nama?: string; noHp?: string; usaha?: { nama?: string; npwp?: string; alamat?: string } }

/* PUT /auth/me: every field optional (noHp only for warga, usaha only for penyedia). */
export const updateMe = (body: Input): Promise<ApiResult<Me>> => apiRequest<Me>('/auth/me', { method: 'PUT', body })
