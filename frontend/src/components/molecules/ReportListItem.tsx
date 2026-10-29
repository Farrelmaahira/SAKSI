import { reportStatuses } from '@/data/report-statuses'
import type { Report } from '@/interfaces/contract'

export interface ReportListItemProps {
  report: Report
}

export default function ReportListItem({ report: r }: ReportListItemProps) {
  return (
    <li>
      <div className="report-top">
        <span>{r.id}</span>
        <span>{r.date}</span>
      </div>
      <strong>{r.category}</strong>
      <p>{r.text}</p>
      <p className="report-ref">
        Merujuk pasal {r.clause} · {r.reporter}
      </p>
      <ol className="status-steps">
        {reportStatuses.map((s, i) => (
          <li key={s} className={i <= r.status ? 'on' : ''}>
            {s}
          </li>
        ))}
      </ol>
      {r.response && <p className="report-response">Tanggapan: {r.response}</p>}
    </li>
  )
}
