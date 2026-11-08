import Link from 'next/link'
import FlowBadge from '@/components/atoms/FlowBadge'
import type { DReport } from '@/interfaces/db'
import { reportDate } from '@/lib/db/report-date'

interface Props { r: DReport }

/* Compact report card for a citizen, same look as ContractMini */
export default function ReportMini({ r }: Props) {
  return (
    <Link className="border-[0.15rem] border-[#ececea] border-solid rounded-[1.4rem] grid gap-8 p-14 [transition:border-color_0.2s,_box-shadow_0.2s] [&:hover]:border-ink [&:hover]:[box-shadow:0.3rem_0.3rem_0_var(--color-ink)] [&_strong]:font-[420]" href="/dashboard/laporan">
      <div className="items-center flex justify-between [&_code]:text-[1.2rem] [&_code]:text-dim">
        <code>{r.id}</code>
        <FlowBadge flow={r.flow} warga />
      </div>
      <strong>{r.category}</strong>
      <div className="items-center flex text-[1.3rem] gap-10">
        <span>
          {reportDate(r.date)} · {r.contractCode}
        </span>
      </div>
    </Link>
  )
}
