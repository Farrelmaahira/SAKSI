import { useState } from 'react'
import Badge from '@/components/atoms/Badge'
import Btn from '@/components/atoms/Btn'
import { roleLabels } from '@/data/auth'
import type { DContract, Review } from '@/interfaces/db'
import { replyReview } from '@/lib/db/reply-review'
import { resolveReview } from '@/lib/db/resolve-review'
import { timeAgo } from '@/lib/dates/time-ago'
import { cn } from '@/lib/utils'
import type { Session } from '@/interfaces/auth'

interface Props {
  c: DContract
  review: Review
  session: Session
  /* the contract is under review and this role may answer */
  canAnswer: boolean
}

/* One comment on a clause with its replies, and the box to reply or mark it done */
export default function ReviewThread({ c, review: rv, session, canAnswer }: Props) {
  const [reply, setReply] = useState('')
  const clause = c.versions.find((v) => v.no === rv.versionNo)?.clauses.find((x) => x.key === rv.clauseKey)
  return (
    <li className={cn(rv.resolved && 'bg-soft text-dim')}>
      <header>
        <Badge tone="outline">{clause?.title ?? rv.clauseKey} · v{rv.versionNo}</Badge>
        {rv.resolved ? <Badge tone="done">Selesai</Badge> : <Badge tone="tint">Terbuka</Badge>}
      </header>
      <p>{rv.text}</p>
      <small>
        {rv.author} ({roleLabels[rv.role]}) · {timeAgo(rv.at)}
      </small>
      {rv.replies.map((rp, i) => (
        <div key={i} className="bg-soft rounded-[1rem] grid gap-3 ml-16 py-10 px-12">
          <p>{rp.text}</p>
          <small>
            {rp.author} ({roleLabels[rp.role]}) · {timeAgo(rp.at)}
          </small>
        </div>
      ))}
      {!rv.resolved && canAnswer && (
        <div className="[&_input]:bg-white [&_input]:border-[0.15rem] [&_input]:border-[#d6d6d2] [&_input]:border-solid [&_input]:rounded-[1.2rem] [&_input]:text-ink [&_input]:[outline:none] [&_input]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_input:focus]:border-blue [&_input:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] items-center flex flex-wrap gap-6 [&_input]:flex-[1_1_20rem] [&_input]:text-[1.4rem] [&_input]:min-h-38 [&_input]:py-6 [&_input]:px-12 [&_input]:w-auto">
          <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Balas komentar" aria-label="Balas komentar" />
          <Btn
            small
            variant="ghost"
            disabled={!reply.trim()}
            onClick={() => {
              replyReview(c.code, rv.id, reply.trim(), session)
              setReply('')
            }}
          >
            Balas
          </Btn>
          <Btn small variant="ghost" icon="check" onClick={() => resolveReview(c.code, rv.id)}>
            Selesai
          </Btn>
        </div>
      )}
    </li>
  )
}
