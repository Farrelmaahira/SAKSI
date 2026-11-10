import type { ApiResult, RegionRule } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

/* GET /admin/region-rules: procurement thresholds of the account's regions, newest first. */
export const listRegionRules = (): Promise<ApiResult<RegionRule[]>> => apiRequest<RegionRule[]>('/admin/region-rules')
