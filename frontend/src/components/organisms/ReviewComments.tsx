import Hint from '@/components/atoms/Hint'
import Panel from '@/components/molecules/Panel'
import ReviewThread from '@/components/organisms/ReviewThread'
import type { Session } from '@/interfaces/auth'
import type { DContract } from '@/interfaces/db'

interface Props {
  c: DContract
  session: Session
  canAnswer: boolean
}

/* Every comment on the clauses, with its replies */
export default function ReviewComments({ c, session, canAnswer }: Props) {
  const open = c.reviews.filter((x) => !x.resolved).length
  return (
    <Panel title="Komentar per pasal" desc={`${c.reviews.length} komentar · ${open} belum selesai`}>
      {c.reviews.length ? (
        <ul className="grid gap-10 list-none list-outside [&>li]:border-[0.15rem] [&>li]:border-[#ececea] [&>li]:border-solid [&>li]:rounded-[1.4rem] [&>li]:grid [&>li]:gap-8 [&>li]:p-14 [&_header]:flex! [&_header]:flex-wrap [&_header]:gap-6! [&_p]:text-[1.45rem] [&_p]:leading-[1.5] [&_small]:text-[1.2rem]! [&_small]:text-dim">
          {c.reviews.map((rv) => (
            <ReviewThread key={rv.id} c={c} review={rv} session={session} canAnswer={canAnswer} />
          ))}
        </ul>
      ) : (
        <Hint>Belum ada komentar.</Hint>
      )}
    </Panel>
  )
}
