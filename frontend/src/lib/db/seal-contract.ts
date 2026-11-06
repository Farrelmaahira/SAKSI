import type { Session } from '@/interfaces/auth'
import { find } from '@/lib/db/find'
import { sha256 } from '@/lib/contracts/sha256'
import { canonicalText } from '@/lib/db/canonical-text'
import { update } from '@/lib/db/update'
import { nowIso } from '@/lib/dates/now-iso'
import { latestVersion } from '@/lib/db/latest-version'
import { log } from '@/lib/db/log'

export async function sealContract(code: string, s: Session) {
  const c = find(code)
  if (!c) return
  const hash = await sha256(canonicalText(c))
  update(code, (x) => ({ ...x, seals: [...x.seals, { hash, at: nowIso(), prev: x.seals[x.seals.length - 1]?.hash ?? null, versionNo: latestVersion(x).no }] }))
  log(s, 'Menyegel dokumen kontrak', c, `${hash.slice(0, 12)}…`)
}
