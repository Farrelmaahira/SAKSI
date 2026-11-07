'use client'

import type { DContract, DReport } from '@/interfaces/db'
import type { Session } from '@/interfaces/auth'
import { useState } from 'react'
import { optionsFor } from '@/lib/dash/options-for'
import { desaAnswered } from '@/lib/db/desa-answered'
import type { ReportOption } from '@/interfaces/dash'
import { reportAction } from '@/lib/db/report-action'
import FlowBadge from '@/components/atoms/FlowBadge'
import { reportDate } from '@/lib/db/report-date'
import Icon from '@/components/atoms/Icon'
import Link from 'next/link'
import { placeholderFor } from '@/data/dash'
import Btn from '@/components/atoms/Btn'
import ReportThread from '@/components/molecules/ReportThread'

interface Props { report: DReport; contract?: DContract; session: Session }

export default function ReportCard({ report: r, contract, session }: Props) {
  const [text, setText] = useState('')
  const [hint, setHint] = useState<string | null>(null)
  const options = optionsFor(session, r)
  const waitingClarification = session.role.role === 'perangkat_desa' && r.actions.some((a) => a.kind === 'klarifikasi') && !desaAnswered(r)

  const run = (o: ReportOption) => {
    const body = text.trim() || o.fallback || ''
    if (o.needsText && body.length < 5) return setHint('Tulis catatan singkat dulu, minimal 5 karakter.')
    reportAction(r.id, o.kind, body, session)
    setText('')
    setHint(null)
  }

  return (
    <article className={`d-report ${waitingClarification ? 'is-flagged' : ''}`}>
      <header className="d-report-top">
        <code>{r.id}</code>
        <FlowBadge flow={r.flow} />
        <span className="d-report-date">{reportDate(r.date)}</span>
      </header>
      <h3>{r.category}</h3>
      <p className="d-report-text">{r.text}</p>
      <ul className="d-report-meta">
        <li>
          <Icon name="file" />
          <Link href={`/dashboard/kontrak/${r.contractCode}?tab=laporan`}>{r.contractCode}</Link>
          {contract && <span>· {contract.title}</span>}
        </li>
        <li>
          <Icon name="doc" />
          <span>Pasal: {r.clause}</span>
        </li>
        {r.location && (
          <li>
            <Icon name="pin" />
            <span>Lokasi: {r.location}</span>
          </li>
        )}
        <li>
          <Icon name="image" />
          <span>{r.photos} foto bukti</span>
        </li>
        <li>
          <Icon name="user" />
          <span>{session.role.role === 'perangkat_desa' ? 'Pelapor: identitas dirahasiakan' : `Pelapor: ${r.reporterName ?? r.reporter}`}</span>
        </li>
      </ul>

      {waitingClarification && (
        <p className="d-callout">
          <Icon name="alert" />
          BPD meminta klarifikasi. Kirim tanggapan supaya laporan bisa dilanjutkan.
        </p>
      )}

      <ReportThread actions={r.actions} />

      {options.length > 0 && (
        <div className="d-report-act">
          <label className="sr-only" htmlFor={`note-${r.id}`}>
            Catatan
          </label>
          <textarea id={`note-${r.id}`} rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholderFor[session.role.role]} />
          {hint && <p className="d-field-error">{hint}</p>}
          <div className="d-btn-row">
            {options.map((o) => (
              <Btn key={o.kind} variant={o.variant} small onClick={() => run(o)}>
                {o.label}
              </Btn>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
