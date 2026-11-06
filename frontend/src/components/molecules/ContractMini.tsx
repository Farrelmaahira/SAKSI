import type { DContract } from '@/interfaces/db'
import Link from 'next/link'
import StatusBadge from '@/components/atoms/StatusBadge'
import Bar from '@/components/atoms/Bar'
import { progressOf } from '@/lib/db/progress-of'
import { isLate } from '@/lib/db/is-late'

interface Props { c: DContract }

export default function ContractMini({ c }: Props) {
  return (
    <Link className="d-mini" href={`/dashboard/kontrak/${c.code}`}>
      <div className="d-mini-top">
        <code>{c.code}</code>
        <StatusBadge status={c.status} />
      </div>
      <strong>{c.title}</strong>
      <div className="d-mini-progress">
        <Bar value={progressOf(c)} tone={isLate(c) ? 'red' : 'blue'} />
        <span>{progressOf(c)}%</span>
      </div>
    </Link>
  )
}
