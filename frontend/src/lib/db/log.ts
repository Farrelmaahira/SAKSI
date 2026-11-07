import type { Session } from '@/interfaces/auth'
import type { DContract } from '@/interfaces/db'
import { addAudit } from '@/lib/audit/add-audit'
import { roleLabels } from '@/data/auth'
import { regionOfContract } from '@/lib/db/region-of-contract'

/* ---------- Mutations ---------- */

export function log(s: Session, action: string, c?: DContract, detail?: string) {
  addAudit({ actor: s.name, role: roleLabels[s.role.role], action, detail, contractCode: c?.code, villageId: c?.villageId ?? s.role.villageId, regionId: c ? regionOfContract(c) : s.role.regionId })
}
