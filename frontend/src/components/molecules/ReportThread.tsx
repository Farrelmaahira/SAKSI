import type { ReportAction } from '@/interfaces/db'
import { actionLabels } from '@/data/db'
import { roleLabels } from '@/data/auth'
import { timeAgo } from '@/lib/dates/time-ago'

interface Props { actions: ReportAction[] }

/* Who did what on a report, oldest first */
export default function ReportThread({ actions }: Props) {
  if (!actions.length) return null
  return (
    <ol className="d-thread">
      {actions.map((a) => (
        <li key={a.id} className={`kind-${a.kind}`}>
          <p>
            <strong>{actionLabels[a.kind]}</strong> oleh {a.by} ({roleLabels[a.role]}) · {timeAgo(a.at)}
          </p>
          {a.text && <p className="d-thread-text">{a.text}</p>}
        </li>
      ))}
    </ol>
  )
}
