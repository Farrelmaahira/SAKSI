import { roleLabels } from '@/data/auth'
import { addAudit } from '@/lib/audit/add-audit'
import { getSession } from './get-session'
import { regionOf } from './region-of'
import { setSession } from './set-session'
import { wilayahLabel } from './wilayah-label'

export function switchRole(roleId: string) {
  const s = getSession()
  const role = s?.roles.find((r) => r.id === roleId)
  if (!s || !role) return
  setSession({ ...s, role })
  addAudit({ actor: s.name, role: roleLabels[role.role], action: 'Berganti peran', detail: wilayahLabel(role), villageId: role.villageId, regionId: regionOf(role) })
}
