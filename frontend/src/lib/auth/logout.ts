import { roleLabels } from '@/data/auth'
import { addAudit } from '@/lib/audit/add-audit'
import { getSession } from './get-session'
import { regionOf } from './region-of'
import { setSession } from './set-session'

export function logout() {
  const s = getSession()
  if (s) addAudit({ actor: s.name, role: roleLabels[s.role.role], action: 'Keluar', villageId: s.role.villageId, regionId: regionOf(s.role) })
  setSession(null)
}
