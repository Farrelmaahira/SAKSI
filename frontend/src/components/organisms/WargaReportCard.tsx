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
    <article className="d-report">
      <header className="d-report-top">
        <code>{r.id}</code>
        <FlowBadge flow={r.flow} warga />
        <span className="d-report-date">{reportDate(r.date)}</span>
      </header>
      <h3>{r.category}</h3>
      <p className="d-report-text">{r.text}</p>
      <ul className="d-report-meta">
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
      {r.actions.length ? <ReportThread actions={r.actions} /> : <p className="d-muted">Laporan Anda sudah diterima. Belum ada tanggapan, kami kabari lewat notifikasi.</p>}
    </article>
  )
}
