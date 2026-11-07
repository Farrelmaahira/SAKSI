import Link from 'next/link'
import FlowBadge from '@/components/atoms/FlowBadge'
import type { DReport } from '@/interfaces/db'
import { reportDate } from '@/lib/db/report-date'

interface Props { r: DReport }

/* Compact report card for a citizen, same look as ContractMini */
export default function ReportMini({ r }: Props) {
  return (
    <Link className="d-mini" href="/dashboard/laporan">
      <div className="d-mini-top">
        <code>{r.id}</code>
        <FlowBadge flow={r.flow} warga />
      </div>
      <strong>{r.category}</strong>
      <div className="d-mini-progress">
        <span>
          {reportDate(r.date)} · {r.contractCode}
        </span>
      </div>
    </Link>
  )
}
