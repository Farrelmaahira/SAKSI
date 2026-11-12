import Btn from '@/components/atoms/Btn'
import Callout from '@/components/atoms/Callout'
import Hint from '@/components/atoms/Hint'
import FormField from '@/components/molecules/FormField'
import Panel from '@/components/molecules/Panel'
import type { useReviewForm } from '@/hooks/use-review-form'
import type { DContract } from '@/interfaces/db'

interface Props {
  c: DContract
  form: ReturnType<typeof useReviewForm>
  /* the contract is under review */
  open: boolean
  /* this user can decide now */
  deciding: boolean
}

/* The second party's decision on the latest version: approve, ask for a revision, or see what was decided */
export default function ReviewDecisionPanel({ c, form, open, deciding }: Props) {
  const no = form.ver.no
  return (
    <Panel title="Keputusan pihak kedua">
      {c.reviewDecision === 'setuju' && <Callout tone="green" icon="check">Pihak kedua menyetujui versi {no}. Lanjut ke tanda tangan.</Callout>}
      {c.reviewDecision === 'revisi' && <Callout tone="red" icon="alert">Revisi diminta{c.reviewNote ? `: “${c.reviewNote}”` : '.'} Menunggu desa mengirim versi baru.</Callout>}
      {!c.reviewDecision && open && !deciding && <Hint>Menunggu pihak kedua meninjau versi {no}.</Hint>}
      {!open && !c.reviewDecision && <Hint>Peninjauan sudah selesai.</Hint>}
      {deciding && (
        <>
          <Hint>Baca setiap pasal, beri komentar bila perlu, lalu ambil keputusan.</Hint>
          <FormField label="Catatan (wajib untuk revisi)">
            <textarea rows={2} value={form.decisionNote} onChange={(e) => form.setDecisionNote(e.target.value)} />
          </FormField>
          <div className="items-center flex flex-wrap gap-10">
            <Btn icon="check" onClick={() => form.decide('setuju')}>Setujui draf</Btn>
            <Btn variant="ghost" onClick={() => form.decide('revisi')}>Minta revisi</Btn>
          </div>
        </>
      )}
    </Panel>
  )
}
