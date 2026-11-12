import Hint from '@/components/atoms/Hint'
import BigProgress from '@/components/molecules/BigProgress'
import type { ProgressEntry } from '@/interfaces/db'
import { fmtDateTime } from '@/lib/dates/fmt-date-time'

interface Props {
  last: number
  entries: ProgressEntry[]
}

/* Current progress as a big number and bar, with every report below it, newest first */
export default function ProgressHistory({ last, entries }: Props) {
  return (
    <>
      <BigProgress label="Progres saat ini" value={`${last}%`} percent={last} />
      {entries.length ? (
        <ol className="grid gap-12 list-none list-outside [&_li]:[align-items:start] [&_li]:grid [&_li]:gap-14 [&_li]:grid-cols-[6.4rem_minmax(0,1fr)] [&.is-status]:gap-x-14 [&.is-status]:grid-cols-[max-content_minmax(0,1fr)] [&.is-status_li]:[grid-column:1_/_-1] [&.is-status_li]:grid-cols-[subgrid] [&_li>strong]:text-blue [&_li>strong]:text-[2rem] [&_li>strong]:font-[350] [&_p]:text-[1.45rem] [&_p]:leading-[1.45] [&_small]:text-[1.25rem]! [&_small]:text-dim d-timeline">
          {[...entries].reverse().map((p) => (
            <li key={p.id}>
              <strong>{p.percent}%</strong>
              <div>
                <p>{p.note}</p>
                <small>
                  {p.by} · {fmtDateTime(p.at)} · {p.photos} foto
                </small>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <Hint>Belum ada laporan progres.</Hint>
      )}
    </>
  )
}
