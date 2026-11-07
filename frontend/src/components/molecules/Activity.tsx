import type { AuditLog } from '@/interfaces/audit'
import Link from 'next/link'
import { timeAgo } from '@/lib/dates/time-ago'

interface Props { logs: AuditLog[]; empty?: string }

export default function Activity({ logs, empty = 'Belum ada aktivitas.' }: Props) {
  if (!logs.length) return <p className="d-muted">{empty}</p>
  return (
    <ol className="d-activity">
      {logs.map((l) => (
        <li key={l.id}>
          <span className="d-activity-dot" aria-hidden="true" />
          <div>
            <p>
              <strong>{l.actor}</strong> {l.action.charAt(0).toLowerCase() + l.action.slice(1)}
              {l.contractCode && (
                <>
                  {' '}
                  <Link href={`/dashboard/kontrak/${l.contractCode}`}>{l.contractCode}</Link>
                </>
              )}
              {l.detail && <span className="d-activity-detail"> · {l.detail}</span>}
            </p>
            <small>
              {l.role} · {timeAgo(l.at)}
            </small>
          </div>
        </li>
      ))}
    </ol>
  )
}
