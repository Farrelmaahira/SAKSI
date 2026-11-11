import type { Session } from '@/interfaces/auth'
import { update } from '@/lib/db/update'
import { uid } from '@/lib/dates/uid'
import { nowIso } from '@/lib/dates/now-iso'
import { withStatus } from '@/lib/db/with-status'

export function addProgress(code: string, entry: { percent: number; note: string; photos: number }, s: Session) {
  update(code, (c) => {
    const next = { ...c, progress: [...c.progress, { ...entry, id: uid('pg-'), at: nowIso(), by: s.name, role: s.role.role }] }
    return entry.percent >= 100 && c.status === 'berjalan' ? withStatus(next, 'selesai', s.name) : next
  })
}
