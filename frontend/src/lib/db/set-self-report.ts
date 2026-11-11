import { update } from '@/lib/db/update'

export function setSelfReport(code: string, allowed: boolean) {
  update(code, (c) => ({ ...c, selfReport: allowed }))
}
