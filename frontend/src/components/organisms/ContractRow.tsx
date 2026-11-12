import Link from 'next/link'
import Badge from '@/components/atoms/Badge'
import Bar from '@/components/atoms/Bar'
import Icon from '@/components/atoms/Icon'
import StatusBadge from '@/components/atoms/StatusBadge'
import ContractLink from '@/components/molecules/ContractLink'
import NumCell from '@/components/molecules/NumCell'
import { statusLabels } from '@/data/db'
import { templates } from '@/data/drafting'
import type { RoleKey } from '@/interfaces/auth'
import type { DContract } from '@/interfaces/db'
import { formatRp } from '@/lib/contracts/format-rp'
import { fmtDate } from '@/lib/dates/fmt-date'
import { deadlineOf } from '@/lib/db/deadline-of'
import { isActive } from '@/lib/db/is-active'
import { isEditable } from '@/lib/db/is-editable'
import { isLate } from '@/lib/db/is-late'
import { nextStep } from '@/lib/db/next-step'
import { openCritical } from '@/lib/db/open-critical'
import { progressOf } from '@/lib/db/progress-of'
import { valueOf } from '@/lib/db/value-of'
import { counterpartyById } from '@/lib/master/counterparty-by-id'
import { villageById } from '@/lib/master/village-by-id'
import { cn } from '@/lib/utils'

interface Props {
  c: DContract
  role: RoleKey
  mine: boolean
}

const MUTED = 'text-[1.4rem] leading-[1.5] text-dim'

/* One contract in the list: what it is, who it is with, its value, progress and the next step */
export default function ContractRow({ c, role, mine }: Props) {
  const step = nextStep(c)
  const critical = role === 'perangkat_desa' && isEditable(c) ? openCritical(c) : 0
  const partyLabel = role === 'pihak_kedua' ? 'Desa' : 'Pihak kedua'
  return (
    <tr>
      <td>
        <ContractLink href={`/dashboard/kontrak/${c.code}`} code={c.code} title={c.title} sub={`${templates[c.template].label} · tenggat ${fmtDate(deadlineOf(c))}`} />
        {!c.apiId && <Badge tone="muted">Contoh lokal</Badge>}
      </td>
      {role === 'inspektorat' && <td data-label="Desa">{villageById(c.villageId)?.name}</td>}
      <td data-label={partyLabel}>{role === 'pihak_kedua' ? villageById(c.villageId)?.name : counterpartyById(c.counterpartyId)?.name}</td>
      <NumCell label="Nilai">{formatRp(valueOf(c))}</NumCell>
      <td data-label="Status">
        <StatusBadge status={c.status} />
      </td>
      <td data-label="Progres">
        {isActive(c) || c.status === 'selesai' ? (
          <div className="items-center flex text-[1.3rem] gap-10 flex-wrap min-w-140">
            <Bar value={progressOf(c)} tone={isLate(c) ? 'red' : 'blue'} />
            <span>{progressOf(c)}%</span>
            {isLate(c) && <em className="text-red text-[1.2rem] not-italic">Terlambat</em>}
          </div>
        ) : (
          <span className={MUTED}>-</span>
        )}
      </td>
      <td data-label="Berikutnya">
        {step ? (
          <Link className={cn('items-start inline-flex text-[1.35rem] gap-6 leading-[1.35] max-w-260 [&:hover]:[text-decoration:underline] d-step', mine ? 'text-blue font-[450]' : 'text-dim')} href={`/dashboard/kontrak/${c.code}?tab=${step.tab}`}>
            {mine && <Icon name="arrow" />}
            {step.text}
          </Link>
        ) : (
          <span className={MUTED}>{statusLabels[c.status]}</span>
        )}
        {critical > 0 && <small className="text-red block">{critical} temuan kritis</small>}
      </td>
    </tr>
  )
}
