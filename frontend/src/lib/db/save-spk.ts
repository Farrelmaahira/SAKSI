import type { DContract } from '@/interfaces/db'
import type { Session } from '@/interfaces/auth'
import { update } from '@/lib/db/update'
import { withStatus } from '@/lib/db/with-status'
import { log } from '@/lib/db/log'
import { find } from '@/lib/db/find'

export function saveSpk(code: string, spk: NonNullable<DContract['spk']>, s: Session) {
  update(code, (c) => {
    const next = { ...c, spk }
    return c.status === 'dipublikasikan' ? withStatus(next, 'berjalan', s.name) : next
  })
  log(s, 'Menyimpan SPK', find(code), spk.number)
}
