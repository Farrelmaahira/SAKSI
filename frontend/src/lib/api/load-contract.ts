import type { UserRole } from '@/interfaces/auth'
import type { DContract } from '@/interfaces/db'
import { fetchContractLifecycleAPI } from '@/lib/api/contracts'
import { fetchLatestAudit } from '@/lib/api/fetch-latest-audit'
import { toDContract } from '@/lib/contracts/to-dcontract'

/* One contract as the server has it (lifecycle + latest audit), or null when the server does not show it to this user. */
export async function loadContract(id: number, role: UserRole, code?: string): Promise<DContract | null> {
  const [life, audit] = await Promise.all([fetchContractLifecycleAPI(id), fetchLatestAudit(id)])
  return life ? toDContract(life, audit.ok ? audit.data : null, role, code) : null
}
