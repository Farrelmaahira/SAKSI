'use client'

import type { TabProps } from '@/interfaces/dash'
import { latestVersion } from '@/lib/db/latest-version'
import { useState } from 'react'
import Empty from '@/components/molecules/Empty'
import { addReview } from '@/lib/db/add-review'
import { decideReview } from '@/lib/db/decide-review'
import Panel from '@/components/molecules/Panel'
import Badge from '@/components/atoms/Badge'
import { roleLabels } from '@/data/auth'
import { timeAgo } from '@/lib/dates/time-ago'
import Btn from '@/components/atoms/Btn'
import { replyReview } from '@/lib/db/reply-review'
import { resolveReview } from '@/lib/db/resolve-review'
import Icon from '@/components/atoms/Icon'

export default function PeninjauanTab({ c, session }: TabProps) {
  const ver = latestVersion(c)
  const [clauseKey, setClauseKey] = useState(ver.clauses[0]?.key ?? '')
  const [text, setText] = useState('')
  const [replies, setReplies] = useState<Record<string, string>>({})
  const [decisionNote, setDecisionNote] = useState('')
  const [err, setErr] = useState('')
  const r = session.role.role
  const isPihak = r === 'pihak_kedua'
  const isDesa = r === 'perangkat_desa'
  const open = c.status === 'ditinjau'
  const deciding = isPihak && open && !c.reviewDecision
  const openCount = c.reviews.filter((x) => !x.resolved).length

  if (c.status === 'draf' || c.status === 'diaudit') return <Empty art="writing-online_x665" title="Belum dikirim untuk ditinjau." text="Peninjauan dimulai setelah desa mengirim draf ke pihak kedua." />

  const comment = () => {
    if (text.trim().length < 5) return setErr('Tulis komentar minimal 5 karakter.')
    addReview(c.code, clauseKey, text.trim(), session)
    setText('')
    setErr('')
  }
  const decide = (d: 'setuju' | 'revisi') => {
    if (d === 'revisi' && decisionNote.trim().length < 5) return setErr('Jelaskan apa yang perlu direvisi.')
    decideReview(c.code, d, decisionNote.trim(), session)
    setDecisionNote('')
    setErr('')
  }

  return (
    <div className="d-grid-2 d-grid-wide">
      <Panel title="Komentar per pasal" desc={`${c.reviews.length} komentar · ${openCount} belum selesai`}>
        {c.reviews.length ? (
          <ul className="d-reviews">
            {c.reviews.map((rv) => {
              const cl = c.versions.find((v) => v.no === rv.versionNo)?.clauses.find((x) => x.key === rv.clauseKey)
              return (
                <li key={rv.id} className={rv.resolved ? 'is-resolved' : ''}>
                  <header>
                    <Badge tone="outline">
                      {cl?.title ?? rv.clauseKey} · v{rv.versionNo}
                    </Badge>
                    {rv.resolved ? <Badge tone="done">Selesai</Badge> : <Badge tone="tint">Terbuka</Badge>}
                  </header>
                  <p>{rv.text}</p>
                  <small>
                    {rv.author} ({roleLabels[rv.role]}) · {timeAgo(rv.at)}
                  </small>
                  {rv.replies.map((rp, i) => (
                    <div key={i} className="d-reply">
                      <p>{rp.text}</p>
                      <small>
                        {rp.author} ({roleLabels[rp.role]}) · {timeAgo(rp.at)}
                      </small>
                    </div>
                  ))}
                  {!rv.resolved && open && (isDesa || isPihak) && (
                    <div className="d-reply-form">
                      <input
                        value={replies[rv.id] ?? ''}
                        onChange={(e) => setReplies({ ...replies, [rv.id]: e.target.value })}
                        placeholder="Balas komentar"
                        aria-label="Balas komentar"
                      />
                      <Btn
                        small
                        variant="ghost"
                        disabled={!(replies[rv.id] ?? '').trim()}
                        onClick={() => {
                          replyReview(c.code, rv.id, replies[rv.id].trim(), session)
                          setReplies({ ...replies, [rv.id]: '' })
                        }}
                      >
                        Balas
                      </Btn>
                      <Btn small variant="ghost" icon="check" onClick={() => resolveReview(c.code, rv.id, session)}>
                        Selesai
                      </Btn>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="d-muted">Belum ada komentar.</p>
        )}
      </Panel>

      <div className="d-stack">
        <Panel title="Keputusan pihak kedua">
          {c.reviewDecision === 'setuju' && (
            <p className="d-ok">
              <Icon name="check" />
              Pihak kedua menyetujui versi {ver.no}. Lanjut ke tanda tangan.
            </p>
          )}
          {c.reviewDecision === 'revisi' && (
            <p className="d-callout">
              <Icon name="alert" />
              Revisi diminta{c.reviewNote ? `: “${c.reviewNote}”` : '.'} Menunggu desa mengirim versi baru.
            </p>
          )}
          {!c.reviewDecision && open && !deciding && <p className="d-muted">Menunggu pihak kedua meninjau versi {ver.no}.</p>}
          {!open && !c.reviewDecision && <p className="d-muted">Peninjauan sudah selesai.</p>}
          {deciding && (
            <>
              <p className="d-muted">Baca setiap pasal, beri komentar bila perlu, lalu ambil keputusan.</p>
              <label className="d-field">
                <span>Catatan (wajib untuk revisi)</span>
                <textarea rows={2} value={decisionNote} onChange={(e) => setDecisionNote(e.target.value)} />
              </label>
              <div className="d-btn-row">
                <Btn icon="check" onClick={() => decide('setuju')}>
                  Setujui draf
                </Btn>
                <Btn variant="ghost" onClick={() => decide('revisi')}>
                  Minta revisi
                </Btn>
              </div>
            </>
          )}
        </Panel>
        {isPihak && open && !c.reviewDecision && (
          <Panel title="Tambah komentar">
            <label className="d-field">
              <span>Pasal</span>
              <select value={clauseKey} onChange={(e) => setClauseKey(e.target.value)}>
                {ver.clauses.map((cl, i) => (
                  <option key={cl.key} value={cl.key}>
                    Pasal {i + 1} · {cl.title}
                  </option>
                ))}
              </select>
            </label>
            <p className="d-quote">{ver.clauses.find((x) => x.key === clauseKey)?.text}</p>
            <label className="d-field">
              <span>Komentar</span>
              <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Contoh: Mohon tenggat diperpanjang 7 hari karena musim hujan." />
            </label>
            <Btn onClick={comment}>Kirim komentar</Btn>
          </Panel>
        )}
        {err && <p className="d-field-error">{err}</p>}
      </div>
    </div>
  )
}
