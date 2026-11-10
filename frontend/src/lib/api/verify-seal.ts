import type { ApiResult, SealVerifyResult } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

/* GET /public/seals/verify?hash= (anonymous allowed). Only a full 64-character SHA-256 hex. */
export const verifySeal = (hash: string): Promise<ApiResult<SealVerifyResult>> =>
  apiRequest<SealVerifyResult>(`/public/seals/verify?hash=${encodeURIComponent(hash.trim().toLowerCase())}`)
