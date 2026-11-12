import Btn from '@/components/atoms/Btn'
import ErrorText from '@/components/atoms/ErrorText'
import FormAlert from '@/components/atoms/FormAlert'
import { placeholderFor } from '@/data/dash'
import type { useReportActions } from '@/hooks/use-report-actions'
import type { RoleKey } from '@/interfaces/auth'

interface Props {
  id: string
  role: RoleKey
  actions: ReturnType<typeof useReportActions>
}

/* A note field and one button per action the role may take on this report */
export default function ReportActionBox({ id, role, actions: a }: Props) {
  return (
    <div className="[&_textarea]:bg-white [&_textarea]:border-[0.15rem] [&_textarea]:border-[#d6d6d2] [&_textarea]:border-solid [&_textarea]:rounded-[1.2rem] [&_textarea]:text-ink [&_textarea]:text-[1.5rem] [&_textarea]:min-h-48 [&_textarea]:[outline:none] [&_textarea]:py-10 [&_textarea]:px-14 [&_textarea]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_textarea]:w-full [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_textarea:focus]:border-blue [&_textarea:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] border-t-[0.1rem] border-t-[#ececea] [border-top-style:solid] grid gap-10 pt-14">
      <label className="sr-only" htmlFor={`note-${id}`}>
        Catatan
      </label>
      <textarea id={`note-${id}`} rows={2} value={a.text} onChange={(e) => a.setText(e.target.value)} placeholder={placeholderFor[role]} />
      {a.hint && <ErrorText as="p">{a.hint}</ErrorText>}
      {a.error && <FormAlert>{a.error}</FormAlert>}
      <div className="items-center flex flex-wrap gap-10">
        {a.options.map((o) => (
          <Btn key={o.kind} variant={o.variant} small onClick={() => a.run(o)} disabled={a.busy}>
            {o.label}
          </Btn>
        ))}
      </div>
    </div>
  )
}
