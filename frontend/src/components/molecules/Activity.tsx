import type { ActivityItem } from '@/interfaces/activity'
import Link from 'next/link'
import { timeAgo } from '@/lib/dates/time-ago'

interface Props { logs: ActivityItem[]; empty?: string }

export default function Activity({ logs, empty = 'Belum ada aktivitas.' }: Props) {
  if (!logs.length) return <p className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">{empty}</p>
  return (
    <ol className="grid list-none list-outside [&_li]:grid [&_li]:gap-12 [&_li]:grid-cols-[1rem_1fr] [&_li]:pb-14 [&_li]:relative [&_li:not(:last-child)::before]:bg-line [&_li:not(:last-child)::before]:bottom-0 [&_li:not(:last-child)::before]:content-[''] [&_li:not(:last-child)::before]:left-4.5 [&_li:not(:last-child)::before]:absolute [&_li:not(:last-child)::before]:top-16 [&_li:not(:last-child)::before]:w-1 [&_p]:text-[1.4rem] [&_p]:leading-[1.45] [&_strong]:font-[450] [&_a]:text-blue [&_a]:font-code [&_a]:text-[1.25rem]! [&_small]:text-[1.25rem]! [&_small]:text-dim!">
      {logs.map((l) => (
        <li key={l.id}>
          <span className="bg-blue rounded-[50%] h-10 mt-6 w-10" aria-hidden="true" />
          <div>
            <p>
              <strong>{l.actor}</strong> {l.action.charAt(0).toLowerCase() + l.action.slice(1)}
              {l.contractHref && (
                <>
                  {' '}
                  <Link href={l.contractHref}>{l.contractLabel}</Link>
                </>
              )}
              {l.detail && <span className="text-[1.25rem] text-dim"> · {l.detail}</span>}
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
