import type { ApiResult, RegionRule } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

interface Input { regionId?: number; ambangPembelianLangsung: number; ambangPenawaran: number; dasarHukum: string; berlakuSejak: string }

/* POST /admin/region-rules (admin_daerah). A new rule is a new row; history is kept. */
export const createRegionRule = (body: Input): Promise<ApiResult<RegionRule>> => apiRequest<RegionRule>('/admin/region-rules', { method: 'POST', body })
