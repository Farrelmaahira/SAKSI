import type { ReportAction } from '@/interfaces/db'
import { actionLabels } from '@/data/db'
import { roleLabels } from '@/data/auth'
import { timeAgo } from '@/lib/dates/time-ago'

interface Props { actions: ReportAction[] }

const KIND: Partial<Record<ReportAction['kind'], string>> = {
  eskalasi: "[.d-thread_&_strong]:text-red",
  klarifikasi: "[.d-thread_&_strong]:text-red",
  tanggapan: "[.d-thread_&_strong]:text-blue",
  tindak_lanjut: "[.d-thread_&_strong]:text-blue",
}

/* Who did what on a report, oldest first */
export default function ReportThread({ actions }: Props) {
  if (!actions.length) return null
  return (
    <ol className="border-l-[0.2rem] border-l-line [border-left-style:solid] grid gap-10 list-none list-outside ml-4 pl-16 [&_p]:text-[1.3rem] [&_p]:text-dim [&_strong]:font-[450] d-thread">
      {actions.map((a) => (
        <li key={a.id} className={KIND[a.kind]}>
          <p>
            <strong>{actionLabels[a.kind]}</strong> oleh {a.by} ({roleLabels[a.role]}) · {timeAgo(a.at)}
          </p>
          {a.text && <p className="[.d-thread_&]:text-[1.45rem] [.d-thread_&]:leading-[1.5] [.d-thread_&]:mt-3 [.d-thread_&]:text-ink">{a.text}</p>}
        </li>
      ))}
    </ol>
  )
}
