import type { ContractStatus } from '@/interfaces/db'
import { stampFromNow } from '@/lib/dates/stamp-from-now'

export const hist = (by: string, ...steps: [ContractStatus, number][]) => steps.map(([status, d]) => ({ status, at: stampFromNow(d), by }))
