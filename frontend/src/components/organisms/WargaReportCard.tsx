import Link from 'next/link'
import Icon from '@/components/atoms/Icon'
import FlowBadge from '@/components/atoms/FlowBadge'
import ReportThread from '@/components/molecules/ReportThread'
import type { DReport } from '@/interfaces/db'
import { reportDate } from '@/lib/db/report-date'

interface Props { report: DReport; contractTitle?: string }

/* A citizen's own report: what was sent and how each party has handled it so far */
export default function WargaReportCard({ report: r, contractTitle }: Props) {
  return (
    <article className="bg-white border-[0.15rem] border-transparent border-solid rounded-[2rem] grid gap-10 p-20 [&.is-flagged]:border-red [&_h3]:text-[2rem] [&_h3]:font-[380] [&_h3]:tracking-[-0.015em]">
      <header className="items-center flex flex-wrap gap-10 [&_code]:text-[1.25rem] [&_code]:text-dim">
        <code>{r.id}</code>
        <FlowBadge flow={r.flow} warga />
        <span className="text-[1.25rem] ml-auto text-dim">{reportDate(r.date)}</span>
      </header>
      <h3>{r.category}</h3>
      <p className="text-[1.5rem] leading-[1.55] max-w-800">{r.text}</p>
      <ul className="grid text-[1.3rem] gap-8 list-none list-outside text-dim [&_li]:items-start [&_li]:flex [&_li]:gap-8 [&_li]:leading-[1.5] [&_a]:text-blue [&_a]:font-code [&_a]:whitespace-nowrap d-report-meta">
        <li>
          <Icon name="file" />
          <Link href={`/lacak?q=${r.contractCode}`}>{r.contractCode}</Link>
          {contractTitle && <span>· {contractTitle}</span>}
        </li>
        <li>
          <Icon name="doc" />
          <span>Pasal: {r.clause}</span>
        </li>
        {r.location && (
          <li>
            <Icon name="pin" />
            <span>Lokasi: {r.location}</span>
          </li>
        )}
        <li>
          <Icon name="image" />
          <span>{r.photos} foto bukti</span>
        </li>
      </ul>
      {r.actions.length ? <ReportThread actions={r.actions} /> : <p className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">Laporan Anda sudah diterima. Belum ada tanggapan, kami kabari lewat notifikasi.</p>}
    </article>
  )
}
