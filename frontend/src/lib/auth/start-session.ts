import { roleLabels } from '@/data/auth'
import type { StoredUser, UserRole } from '@/interfaces/auth'
import { addAudit } from '@/lib/audit/add-audit'
import { regionOf } from './region-of'
import { setSession } from './set-session'
import { wilayahLabel } from './wilayah-label'

export function startSession(u: StoredUser, role: UserRole) {
  setSession({ userId: u.id, name: u.name, email: u.email, role, roles: u.roles })
  addAudit({ actor: u.name, role: roleLabels[role.role], action: 'Masuk', detail: wilayahLabel(role), villageId: role.villageId, regionId: regionOf(role) })
}
