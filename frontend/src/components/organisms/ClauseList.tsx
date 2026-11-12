import { useState } from 'react'
import Icon from '@/components/atoms/Icon'
import Hint from '@/components/atoms/Hint'
import type { Audit, Clause } from '@/interfaces/drafting'

interface Props {
  clauses: Clause[]
  audit: Audit
  onEdit: (key: string, text: string) => void
  /* a clause the audit panel wants opened */
  focus?: { key: string } | null
}

/* Clauses of an AI draft; click one to read its explanation and edit its text */
export default function ClauseList({ clauses, audit, onEdit, focus }: Props) {
  const [open, setOpen] = useState<string | null>(focus?.key ?? null)
  // each request from the audit panel is a new object, so asking for the same clause again reopens it
  const [seen, setSeen] = useState(focus)
  if (focus !== seen) {
    setSeen(focus)
    if (focus) setOpen(focus.key)
  }
  return (
    <ol className="[&_textarea]:bg-white [&_textarea]:border-[0.15rem] [&_textarea]:border-[#d6d6d2] [&_textarea]:border-solid [&_textarea]:rounded-[1.2rem] [&_textarea]:text-ink [&_textarea]:text-[1.5rem] [&_textarea]:min-h-48 [&_textarea]:[outline:none] [&_textarea]:py-10 [&_textarea]:px-14 [&_textarea]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_textarea]:w-full [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_textarea:focus]:border-blue [&_textarea:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] grid gap-8 list-none list-outside [&>li]:border-[0.15rem] [&>li]:border-solid [&>li]:rounded-[1.4rem] [&>li]:grid [&>li]:gap-8 [&>li]:py-14 [&>li]:px-16 [&>li_p]:text-[1.5rem] [&>li_p]:leading-[1.6]">
      {clauses.map((c, i) => {
        const critical = audit.findings.some((f) => f.clauseKey === c.key && !f.applied && f.severity === 'kritis')
        return (
          <li key={c.key} className={critical ? 'border-red' : 'border-[#ececea]'}>
            <button type="button" className="items-center [background:none] border-0 border-none [color:inherit] flex gap-10 p-0 text-left w-full [&_span]:text-[1.2rem] [&_span]:tracking-[0.04em] [&_span]:text-dim [&_span]:uppercase [&_strong]:flex-1 [&_strong]:font-[450] [&:hover_strong]:text-blue" aria-expanded={open === c.key} onClick={() => setOpen(open === c.key ? null : c.key)}>
              <span>Pasal {i + 1}</span>
              <strong>{c.title}</strong>
              <Icon name={open === c.key ? 'close' : 'doc'} />
            </button>
            {open === c.key ? (
              <div className="grid gap-6">
                <textarea id={`judul-${c.key}`} rows={4} value={c.text} onChange={(e) => onEdit(c.key, e.target.value)} aria-label={`Isi pasal ${c.title}`} />
                <Hint>
                  {c.plain}
                  {c.legal && ` Dasar: ${c.legal}.`}
                </Hint>
              </div>
            ) : (
              <p>{c.text}</p>
            )}
          </li>
        )
      })}
    </ol>
  )
}
