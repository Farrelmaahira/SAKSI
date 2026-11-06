import type { ContractStatus, DContract } from '@/interfaces/db'
import { nowIso } from '@/lib/dates/now-iso'

export const withStatus = (c: DContract, status: ContractStatus, by: string): DContract =>
  c.status === status ? c : { ...c, status, history: [...c.history, { status, at: nowIso(), by }] }
