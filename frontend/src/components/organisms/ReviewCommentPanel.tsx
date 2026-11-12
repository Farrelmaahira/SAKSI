import Btn from '@/components/atoms/Btn'
import FormField from '@/components/molecules/FormField'
import Panel from '@/components/molecules/Panel'
import type { useReviewForm } from '@/hooks/use-review-form'

interface Props {
  form: ReturnType<typeof useReviewForm>
}

/* The second party picks a clause, reads it, and writes a comment on it */
export default function ReviewCommentPanel({ form }: Props) {
  return (
    <Panel title="Tambah komentar">
      <FormField label="Pasal">
        <select value={form.clauseKey} onChange={(e) => form.setClauseKey(e.target.value)}>
          {form.ver.clauses.map((cl, i) => (
            <option key={cl.key} value={cl.key}>
              Pasal {i + 1} · {cl.title}
            </option>
          ))}
        </select>
      </FormField>
      <p className="bg-soft border-l-[0.3rem] border-l-blue [border-left-style:solid] rounded-[0_1rem_1rem_0] text-[1.4rem] leading-[1.5] py-10 px-14">{form.ver.clauses.find((x) => x.key === form.clauseKey)?.text}</p>
      <FormField label="Komentar">
        <textarea rows={3} value={form.text} onChange={(e) => form.setText(e.target.value)} placeholder="Contoh: Mohon tenggat diperpanjang 7 hari karena musim hujan." />
      </FormField>
      <Btn onClick={form.comment}>Kirim komentar</Btn>
    </Panel>
  )
}
