'use client'

import type { Audit } from '@/interfaces/drafting'
import { fmtDate } from '@/lib/dates/fmt-date'
import Badge from '@/components/atoms/Badge'
import Btn from '@/components/atoms/Btn'

interface Props { audit: Audit; onApply?: (id: string) => void; readOnly?: boolean }

export default function AuditPanel({ audit, onApply, readOnly }: Props) {
  const open = audit.findings.filter((f) => !f.applied)
  const done = audit.findings.filter((f) => f.applied)
  return (
    <aside className="d-audit">
      <div className={`d-score ${audit.score >= 85 ? 'is-good' : audit.score >= 65 ? 'is-mid' : 'is-low'}`}>
        <strong>{audit.score}</strong>
        <span>
          Skor audit AI
          <small>Diperiksa {fmtDate(audit.at)}</small>
        </span>
      </div>
      {!open.length && <p className="d-muted">Tidak ada temuan terbuka. Draf siap dikirim.</p>}
      <ul className="d-findings">
        {open.map((f) => (
          <li key={f.id} className={`sev-${f.severity}`}>
            <Badge tone={f.severity === 'kritis' ? 'red' : 'tint'}>{f.severity === 'kritis' ? 'Kritis' : 'Saran'}</Badge>
            <strong>{f.title}</strong>
            <p>{f.text}</p>
            {!readOnly && f.fixable && onApply && (
              <Btn small variant={f.severity === 'kritis' ? 'primary' : 'ghost'} onClick={() => onApply(f.id)}>
                Terapkan saran
              </Btn>
            )}
          </li>
        ))}
        {done.map((f) => (
          <li key={f.id} className="is-applied">
            <Badge tone="done">Diperbaiki</Badge>
            <strong>{f.title}</strong>
          </li>
        ))}
      </ul>
      <p className="d-fine">Audit ini simulasi. Dasar hukum adalah contoh dan perlu diperiksa ahli hukum.</p>
    </aside>
  )
}
