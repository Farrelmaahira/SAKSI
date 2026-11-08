import { reportStatuses } from '@/data/report-statuses'
import type { Report } from '@/interfaces/contract'

interface Props {
  report: Report
}

export default function ReportListItem({ report: r }: Props) {
  return (
    <li>
      <div className="flex font-code text-[1.2rem] justify-between opacity-[0.6]">
        <span>{r.id}</span>
        <span>{r.date}</span>
      </div>
      <strong>{r.category}</strong>
      <p>{r.text}</p>
      <p className="mt-8 opacity-[0.6]">
        Merujuk pasal {r.clause} · {r.reporter}
      </p>
      <ol className="flex flex-wrap gap-6 list-none list-outside mt-14 [&_li]:border-[0.1rem] [&_li]:border-[rgba(15,_15,_23,_0.25)] [&_li]:border-solid [&_li]:rounded-[3rem] [&_li]:text-[1.1rem] [&_li]:opacity-[0.6] [&_li]:py-4 [&_li]:px-10 [&_li]:uppercase status-steps">
        {reportStatuses.map((s, i) => (
          <li key={s} className={i <= r.status ? '[.strength-bar_span&]:bg-blue [.status-steps_li&]:bg-blue [.status-steps_li&]:border-blue [.status-steps_li&]:text-white [.status-steps_li&]:opacity-[1] [.ticket-steps_li&]:opacity-[1] on' : ''}>
            {s}
          </li>
        ))}
      </ol>
      {r.response && <p className="bg-soft rounded-[0.8rem] mt-14 py-12 px-14">Tanggapan: {r.response}</p>}
    </li>
  )
}
