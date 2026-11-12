'use client'

import type { Audit } from '@/interfaces/drafting'
import { fmtDate } from '@/lib/dates/fmt-date'
import Badge from '@/components/atoms/Badge'
import Btn from '@/components/atoms/Btn'

interface Props { audit: Audit; onApply?: (id: string) => void; readOnly?: boolean; /* the findings come from the AI server, not the local rules */ fromServer?: boolean }

const SEV: Record<'kritis' | 'saran', string> = {
  kritis: "[.d-findings_&]:bg-red [.d-findings_&]:text-white",
  saran: "[.d-findings_&]:bg-blue [.d-findings_&]:text-white",
}

export default function AuditPanel({ audit, onApply, readOnly, fromServer }: Props) {
  const open = audit.findings.filter((f) => !f.applied)
  const done = audit.findings.filter((f) => f.applied)
  return (
    <aside className="bg-white border-[0.15rem] border-ink border-solid rounded-[2rem] [box-shadow:0.6rem_0.6rem_0_var(--color-ink)] grid gap-16 p-20 lg:[.d-draft_&]:sticky lg:[.d-draft_&]:top-90">
      <div className={`items-center flex gap-14 [&_strong]:text-[5.6rem] [&_strong]:font-[300] [&_strong]:tracking-[-0.04em] [&_strong]:leading-[1] [&_span]:grid [&_span]:text-[1.4rem]! [&_small]:text-[1.2rem]! [&_small]:text-dim [&.is-good_strong]:text-green [&.is-mid_strong]:text-blue! [&.is-low_strong]:text-red! ${audit.score >= 85 ? 'is-good' : audit.score >= 65 ? 'is-mid' : 'is-low'}`}>
        <strong>{audit.score}</strong>
        <span>
          Skor audit AI
          <small>Diperiksa {fmtDate(audit.at)}</small>
        </span>
      </div>
      {!open.length && <p className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">Tidak ada temuan terbuka. Draf siap dikirim.</p>}
      <ul className="grid gap-8 list-none list-outside [&_li]:rounded-[1.4rem] [&_li]:grid [&_li]:gap-6 [&_li]:justify-items-start [&_li]:p-14 [&_strong]:font-[450] [&_p]:text-[1.35rem] [&_p]:leading-[1.5] d-findings">
        {open.map((f) => (
          <li key={f.id} className={`${SEV[f.severity]} sev-${f.severity}`}>
            <Badge tone={f.severity === 'kritis' ? 'red' : 'tint'}>{f.severity === 'kritis' ? 'Kritis' : 'Saran'}</Badge>
            <strong>{f.title}</strong>
            <p>{f.text}</p>
            {!readOnly && f.fixable && onApply && (
              <Btn small variant={f.severity === 'kritis' ? 'primary' : 'ghost'} onClick={() => onApply(f.id)}>
                {f.fix === 'edit' ? 'Sunting pasal' : 'Terapkan saran'}
              </Btn>
            )}
          </li>
        ))}
        {done.map((f) => (
          <li key={f.id} className="[.d-findings_&]:items-center [.d-findings_&]:flex [.d-findings_&]:text-dim [.d-findings_&]:py-6 [.d-findings_&]:px-0">
            <Badge tone="done">Diperbaiki</Badge>
            <strong>{f.title}</strong>
          </li>
        ))}
      </ul>
      <p className="text-[1.25rem] leading-[1.5] text-dim [&_a]:border-b-[0.1rem] [&_a]:border-b-current [&_a]:[border-bottom-style:solid]">{fromServer ? 'Diperiksa oleh AI server. Server memeriksa ulang saat kontrak dikirim, jadi hasilnya bisa berbeda.' : 'Audit ini simulasi. Dasar hukum adalah contoh dan perlu diperiksa ahli hukum.'}</p>
    </aside>
  )
}
