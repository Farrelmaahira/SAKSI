'use client'

import type { TabProps } from '@/interfaces/dash'
import { latestVersion } from '@/lib/db/latest-version'
import { useState } from 'react'
import type { Clause } from '@/interfaces/drafting'
import { isEditable } from '@/lib/db/is-editable'
import { openCritical } from '@/lib/db/open-critical'
import { saveDraft } from '@/lib/db/save-draft'
import { downloadTxt } from '@/lib/dash/download-txt'
import Icon from '@/components/atoms/Icon'
import Panel from '@/components/molecules/Panel'
import { fmtDateTime } from '@/lib/dates/fmt-date-time'
import Btn from '@/components/atoms/Btn'
import { changedFrom } from '@/lib/dash/changed-from'
import Badge from '@/components/atoms/Badge'
import { sendForReview } from '@/lib/db/send-for-review'
import { counterpartyById } from '@/lib/master/counterparty-by-id'
import Locked from '@/components/atoms/Locked'

export default function DrafVersiTab({ c, session, go }: TabProps) {
  const latest = latestVersion(c)
  const [verNo, setVerNo] = useState(latest.no)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Clause[]>(latest.clauses)
  const [note, setNote] = useState('')
  const isDesa = session.role.role === 'perangkat_desa'
  const canEdit = isDesa && isEditable(c)
  const ver = c.versions.find((v) => v.no === verNo) ?? latest
  const prev = c.versions.find((v) => v.no === ver.no - 1)
  const revising = c.status === 'ditinjau' && c.reviewDecision === 'revisi'
  const critical = openCritical(c)

  const startEdit = () => {
    setDraft(latest.clauses)
    setVerNo(latest.no)
    setEditing(true)
  }
  const save = () => {
    saveDraft(c.code, draft, session, note.trim() || undefined)
    setEditing(false)
    setNote('')
    setVerNo(revising ? latest.no + 1 : latest.no)
  }
  const download = () => {
    const lines = [
      `SIMULASI PDF · ${c.code} · Versi ${ver.no}`,
      c.title,
      '',
      ...ver.clauses.map((cl, i) => `Pasal ${i + 1}. ${cl.title}\n${cl.text}\n`),
      '',
      'Dokumen ini dibuat oleh prototipe SAKSI dan bukan dokumen resmi.',
    ]
    downloadTxt(`${c.code}-v${ver.no}-simulasi-pdf.txt`, lines.join('\n'))
  }

  return (
    <div className="d-stack">
      {revising && isDesa && (
        <p className="d-callout">
          <Icon name="alert" />
          Pihak kedua meminta revisi{c.reviewNote ? `: “${c.reviewNote}”` : ''}. Ubah pasal lalu kirim versi baru.
        </p>
      )}
      <Panel
        title={editing ? `Mengubah versi ${latest.no}` : `Versi ${ver.no}`}
        desc={editing ? (revising ? 'Simpan akan membuat versi baru dan mengirimkannya untuk ditinjau ulang.' : 'Perubahan langsung diaudit ulang oleh AI.') : `Dibuat ${fmtDateTime(ver.at)}${ver.note ? ` · ${ver.note}` : ''}`}
        action={
          !editing && (
            <div className="d-btn-row">
              {c.versions.length > 1 && (
                <label className="d-select-sm">
                  <span className="sr-only">Pilih versi</span>
                  <select value={verNo} onChange={(e) => setVerNo(Number(e.target.value))}>
                    {c.versions.map((v) => (
                      <option key={v.no} value={v.no}>
                        Versi {v.no}
                        {v.no === latest.no ? ' (terbaru)' : ''}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <Btn small variant="ghost" icon="doc" onClick={download}>
                Unduh (simulasi PDF)
              </Btn>
              {canEdit && (
                <Btn small icon="sign" onClick={startEdit}>
                  Ubah pasal
                </Btn>
              )}
            </div>
          )
        }
      >
        {editing ? (
          <>
            <ol className="d-clauses is-editing">
              {draft.map((cl, i) => (
                <li key={cl.key}>
                  <label>
                    <span className="d-clause-label">
                      Pasal {i + 1} · {cl.title}
                    </span>
                    <textarea rows={3} value={cl.text} onChange={(e) => setDraft(draft.map((x) => (x.key === cl.key ? { ...x, text: e.target.value } : x)))} />
                  </label>
                </li>
              ))}
            </ol>
            {revising && (
              <label className="d-field">
                <span>Catatan perubahan untuk pihak kedua</span>
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: Tenggat termin 2 dimundurkan sesuai permintaan." />
              </label>
            )}
            <div className="d-btn-row">
              <Btn onClick={save}>{revising ? `Kirim versi ${latest.no + 1}` : 'Simpan perubahan'}</Btn>
              <Btn variant="ghost" onClick={() => setEditing(false)}>
                Batal
              </Btn>
            </div>
          </>
        ) : (
          <ol className="d-clauses">
            {ver.clauses.map((cl, i) => (
              <li key={cl.key} className={changedFrom(prev?.clauses, cl) ? 'is-changed' : ''}>
                <div className="d-clause-head is-static">
                  <span>Pasal {i + 1}</span>
                  <strong>{cl.title}</strong>
                  {changedFrom(prev?.clauses, cl) && <Badge tone="tint">Berubah dari versi {prev!.no}</Badge>}
                </div>
                <p>{cl.text}</p>
                <small className="d-muted">{cl.plain}</small>
              </li>
            ))}
          </ol>
        )}
      </Panel>

      {isDesa && (c.status === 'draf' || c.status === 'diaudit') && !editing && (
        <Panel title="Kirim ke pihak kedua" desc="Setelah dikirim, pihak kedua bisa memberi komentar per pasal. Isi kontrak dikunci kecuali mereka meminta revisi.">
          {critical > 0 ? (
            <p className="d-callout">
              <Icon name="alert" />
              Masih ada {critical} temuan kritis.{' '}
              <button type="button" className="d-link" onClick={() => go('audit')}>
                Perbaiki di Audit AI
              </button>
            </p>
          ) : (
            <Btn icon="arrow" onClick={() => sendForReview(c.code, session)}>
              Kirim untuk ditinjau {counterpartyById(c.counterpartyId)?.name}
            </Btn>
          )}
        </Panel>
      )}
      {!canEdit && isDesa && !editing && c.status !== 'draf' && <Locked text="Isi kontrak dikunci karena sudah dikirim. Perubahan hanya bisa dilakukan bila pihak kedua meminta revisi." />}
    </div>
  )
}
