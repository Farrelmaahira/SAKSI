import type { PubField } from '@/interfaces/db'
import type { Session } from '@/interfaces/auth'
import { update } from '@/lib/db/update'
import { nowIso } from '@/lib/dates/now-iso'
import { withStatus } from '@/lib/db/with-status'
import { log } from '@/lib/db/log'
import { find } from '@/lib/db/find'

export function publishContract(code: string, fields: PubField[], s: Session) {
  update(code, (c) => {
    const next = { ...c, publication: { at: nowIso(), fields } }
    return c.status === 'ditandatangani' ? withStatus(c.spk ? withStatus(next, 'dipublikasikan', s.name) : next, c.spk ? 'berjalan' : 'dipublikasikan', s.name) : next
  })
  log(s, 'Mempublikasikan kontrak', find(code))
}
