import { statusLabels } from '@/data/db'
import type { ContractStatus } from '@/interfaces/db'

/* The server's contract status as is; only an unknown or missing one falls back to "diaudit". */
export const toContractStatus = (raw?: string | null): ContractStatus => (raw && raw in statusLabels ? (raw as ContractStatus) : 'diaudit')
