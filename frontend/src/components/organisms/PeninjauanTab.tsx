'use client'

import ErrorText from '@/components/atoms/ErrorText'
import Empty from '@/components/molecules/Empty'
import ReviewCommentPanel from '@/components/organisms/ReviewCommentPanel'
import ReviewComments from '@/components/organisms/ReviewComments'
import ReviewDecisionPanel from '@/components/organisms/ReviewDecisionPanel'
import { useReviewForm } from '@/hooks/use-review-form'
import type { TabProps } from '@/interfaces/dash'

export default function PeninjauanTab({ c, session }: TabProps) {
  const form = useReviewForm(c, session)
  const role = session.role.role
  const isPihak = role === 'pihak_kedua'
  const open = c.status === 'ditinjau'
  const deciding = isPihak && open && !c.reviewDecision

  if (c.status === 'draf' || c.status === 'diaudit') return <Empty art="writing-online_x665" title="Belum dikirim untuk ditinjau." text="Peninjauan dimulai setelah desa mengirim draf ke pihak kedua." />

  return (
    <div className="items-stretch grid gap-20 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] [&>*]:min-w-0">
      <ReviewComments c={c} session={session} canAnswer={open && (isPihak || role === 'perangkat_desa')} />
      <div className="grid gap-20 [&>*]:min-w-0">
        <ReviewDecisionPanel c={c} form={form} open={open} deciding={deciding} />
        {deciding && <ReviewCommentPanel form={form} />}
        {form.error && <ErrorText as="p">{form.error}</ErrorText>}
      </div>
    </div>
  )
}
