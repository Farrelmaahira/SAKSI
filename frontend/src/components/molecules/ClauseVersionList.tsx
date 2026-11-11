import Badge from '@/components/atoms/Badge'
import Hint from '@/components/atoms/Hint'
import type { Version } from '@/interfaces/db'
import { changedFrom } from '@/lib/dash/changed-from'
import { cn } from '@/lib/utils'

interface Props {
  version: Version
  previous?: Version
}

/* Clauses of one version; the ones that differ from the previous version are outlined and labelled */
export default function ClauseVersionList({ version, previous }: Props) {
  return (
    <ol className="grid gap-8 list-none list-outside [&>li]:border-[0.15rem] [&>li]:border-solid [&>li]:rounded-[1.4rem] [&>li]:grid [&>li]:gap-8 [&>li]:py-14 [&>li]:px-16 [&>li_p]:text-[1.5rem] [&>li_p]:leading-[1.6]">
      {version.clauses.map((cl, i) => {
        const changed = changedFrom(previous?.clauses, cl)
        return (
          <li key={cl.key} className={cn(changed ? 'border-blue' : 'border-[#ececea]')}>
            <div className="items-center flex gap-10 w-full [&_span]:text-[1.2rem] [&_span]:tracking-[0.04em] [&_span]:text-dim [&_span]:uppercase [&_strong]:flex-1 [&_strong]:font-[450]">
              <span>Pasal {i + 1}</span>
              <strong>{cl.title}</strong>
              {changed && <Badge tone="tint">Berubah dari versi {previous!.no}</Badge>}
            </div>
            <p>{cl.text}</p>
            <Hint as="small">{cl.plain}</Hint>
          </li>
        )
      })}
    </ol>
  )
}
