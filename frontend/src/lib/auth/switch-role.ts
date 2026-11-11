import { getSession } from './get-session'
import { setSession } from './set-session'

export function switchRole(roleId: string) {
  const s = getSession()
  const role = s?.roles.find((r) => r.id === roleId)
  if (!s || !role) return
  setSession({ ...s, role })
}
