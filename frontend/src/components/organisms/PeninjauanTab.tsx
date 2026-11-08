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
    <div className="items-stretch grid gap-20 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] [&>*]:min-w-0">
      <Panel title="Komentar per pasal" desc={`${c.reviews.length} komentar · ${openCount} belum selesai`}>
        {c.reviews.length ? (
          <ul className="grid gap-10 list-none list-outside [&>li]:border-[0.15rem] [&>li]:border-[#ececea] [&>li]:border-solid [&>li]:rounded-[1.4rem] [&>li]:grid [&>li]:gap-8 [&>li]:p-14 [&_header]:flex! [&_header]:flex-wrap [&_header]:gap-6! [&_p]:text-[1.45rem] [&_p]:leading-[1.5] [&_small]:text-[1.2rem]! [&_small]:text-dim d-reviews">
            {c.reviews.map((rv) => {
              const cl = c.versions.find((v) => v.no === rv.versionNo)?.clauses.find((x) => x.key === rv.clauseKey)
              return (
                <li key={rv.id} className={rv.resolved ? '[.d-reviews>li&]:bg-soft [.d-reviews>li&]:text-dim' : ''}>
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
                    <div key={i} className="bg-soft rounded-[1rem] grid gap-3 ml-16 py-10 px-12">
                      <p>{rp.text}</p>
                      <small>
                        {rp.author} ({roleLabels[rp.role]}) · {timeAgo(rp.at)}
                      </small>
                    </div>
                  ))}
                  {!rv.resolved && open && (isDesa || isPihak) && (
                    <div className="[&_input]:bg-white [&_input]:border-[0.15rem] [&_input]:border-[#d6d6d2] [&_input]:border-solid [&_input]:rounded-[1.2rem] [&_input]:text-ink [&_input]:[outline:none] [&_input]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_input:focus]:border-blue [&_input:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] items-center flex flex-wrap gap-6 [&_input]:flex-[1_1_20rem] [&_input]:text-[1.4rem] [&_input]:min-h-38 [&_input]:py-6 [&_input]:px-12 [&_input]:w-auto">
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
          <p className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">Belum ada komentar.</p>
        )}
      </Panel>

      <div className="grid gap-20 [&>*]:min-w-0">
        <Panel title="Keputusan pihak kedua">
          {c.reviewDecision === 'setuju' && (
            <p className="items-start rounded-[1.2rem] flex text-[1.4rem] gap-10 leading-[1.45] py-12 px-14 bg-green text-white [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0 [.d-sign_li_&]:text-green [.d-form>&]:w-full d-ok">
              <Icon name="check" />
              Pihak kedua menyetujui versi {ver.no}. Lanjut ke tanda tangan.
            </p>
          )}
          {c.reviewDecision === 'revisi' && (
            <p className="items-start rounded-[1.2rem] flex text-[1.4rem] gap-10 leading-[1.45] py-12 px-14 bg-red text-white d-callout">
              <Icon name="alert" />
              Revisi diminta{c.reviewNote ? `: “${c.reviewNote}”` : '.'} Menunggu desa mengirim versi baru.
            </p>
          )}
          {!c.reviewDecision && open && !deciding && <p className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">Menunggu pihak kedua meninjau versi {ver.no}.</p>}
          {!open && !c.reviewDecision && <p className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">Peninjauan sudah selesai.</p>}
          {deciding && (
            <>
              <p className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">Baca setiap pasal, beri komentar bila perlu, lalu ambil keputusan.</p>
              <label className="[.d-form>&]:w-full border-0 border-none grid gap-6 min-w-0 [&>span]:text-[1.25rem] [&>span]:tracking-[0.04em] [&>span]:text-dim [&>span]:uppercase [&>legend]:text-[1.25rem]! [&>legend]:tracking-[0.04em]! [&>legend]:text-dim! [&>legend]:uppercase! [&>legend]:mb-6 [&_input:not([type='range'])]:bg-white [&_input:not([type='range'])]:border-[0.15rem] [&_input:not([type='range'])]:border-[#d6d6d2] [&_input:not([type='range'])]:border-solid [&_input:not([type='range'])]:rounded-[1.2rem] [&_input:not([type='range'])]:text-ink [&_input:not([type='range'])]:text-[1.5rem] [&_input:not([type='range'])]:min-h-48 [&_input:not([type='range'])]:[outline:none] [&_input:not([type='range'])]:py-10 [&_input:not([type='range'])]:px-14 [&_input:not([type='range'])]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_input:not([type='range'])]:w-full [&_select]:bg-white [&_select]:border-[0.15rem] [&_select]:border-[#d6d6d2] [&_select]:border-solid [&_select]:rounded-[1.2rem] [&_select]:text-ink! [&_select]:text-[1.5rem]! [&_select]:min-h-48 [&_select]:[outline:none] [&_select]:py-10 [&_select]:px-14 [&_select]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_select]:w-full [&_textarea]:bg-white! [&_textarea]:border-[0.15rem]! [&_textarea]:border-[#d6d6d2]! [&_textarea]:border-solid! [&_textarea]:rounded-[1.2rem]! [&_textarea]:text-ink! [&_textarea]:text-[1.5rem]! [&_textarea]:min-h-48! [&_textarea]:[outline:none]! [&_textarea]:py-10! [&_textarea]:px-14! [&_textarea]:[transition:border-color_0.2s,_box-shadow_0.2s]! [&_textarea]:w-full! [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_input:focus]:border-blue! [&_input:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_select:focus]:border-blue! [&_select:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_textarea:focus]:border-blue! [&_textarea:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_input[readonly]]:bg-soft! [&_input[readonly]]:text-dim! [&_input[type='range']]:[accent-color:var(--color-blue)] [&_input[type='range']]:w-full! [&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)]! [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%]! [&_select]:[background-repeat:no-repeat]! [&_select]:[background-size:0.55rem_0.55rem]! [&_select]:pr-46! [&_select]:text-ellipsis">
                <span>Catatan (wajib untuk revisi)</span>
                <textarea rows={2} value={decisionNote} onChange={(e) => setDecisionNote(e.target.value)} />
              </label>
              <div className="items-center flex flex-wrap gap-10">
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
            <label className="[.d-form>&]:w-full border-0 border-none grid gap-6 min-w-0 [&>span]:text-[1.25rem] [&>span]:tracking-[0.04em] [&>span]:text-dim [&>span]:uppercase [&>legend]:text-[1.25rem]! [&>legend]:tracking-[0.04em]! [&>legend]:text-dim! [&>legend]:uppercase! [&>legend]:mb-6 [&_input:not([type='range'])]:bg-white [&_input:not([type='range'])]:border-[0.15rem] [&_input:not([type='range'])]:border-[#d6d6d2] [&_input:not([type='range'])]:border-solid [&_input:not([type='range'])]:rounded-[1.2rem] [&_input:not([type='range'])]:text-ink [&_input:not([type='range'])]:text-[1.5rem] [&_input:not([type='range'])]:min-h-48 [&_input:not([type='range'])]:[outline:none] [&_input:not([type='range'])]:py-10 [&_input:not([type='range'])]:px-14 [&_input:not([type='range'])]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_input:not([type='range'])]:w-full [&_select]:bg-white [&_select]:border-[0.15rem] [&_select]:border-[#d6d6d2] [&_select]:border-solid [&_select]:rounded-[1.2rem] [&_select]:text-ink! [&_select]:text-[1.5rem]! [&_select]:min-h-48 [&_select]:[outline:none] [&_select]:py-10 [&_select]:px-14 [&_select]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_select]:w-full [&_textarea]:bg-white! [&_textarea]:border-[0.15rem]! [&_textarea]:border-[#d6d6d2]! [&_textarea]:border-solid! [&_textarea]:rounded-[1.2rem]! [&_textarea]:text-ink! [&_textarea]:text-[1.5rem]! [&_textarea]:min-h-48! [&_textarea]:[outline:none]! [&_textarea]:py-10! [&_textarea]:px-14! [&_textarea]:[transition:border-color_0.2s,_box-shadow_0.2s]! [&_textarea]:w-full! [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_input:focus]:border-blue! [&_input:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_select:focus]:border-blue! [&_select:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_textarea:focus]:border-blue! [&_textarea:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_input[readonly]]:bg-soft! [&_input[readonly]]:text-dim! [&_input[type='range']]:[accent-color:var(--color-blue)] [&_input[type='range']]:w-full! [&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)]! [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%]! [&_select]:[background-repeat:no-repeat]! [&_select]:[background-size:0.55rem_0.55rem]! [&_select]:pr-46! [&_select]:text-ellipsis">
              <span>Pasal</span>
              <select value={clauseKey} onChange={(e) => setClauseKey(e.target.value)}>
                {ver.clauses.map((cl, i) => (
                  <option key={cl.key} value={cl.key}>
                    Pasal {i + 1} · {cl.title}
                  </option>
                ))}
              </select>
            </label>
            <p className="bg-soft border-l-[0.3rem] border-l-blue [border-left-style:solid] rounded-[0_1rem_1rem_0] text-[1.4rem] leading-[1.5] py-10 px-14">{ver.clauses.find((x) => x.key === clauseKey)?.text}</p>
            <label className="[.d-form>&]:w-full border-0 border-none grid gap-6 min-w-0 [&>span]:text-[1.25rem] [&>span]:tracking-[0.04em] [&>span]:text-dim [&>span]:uppercase [&>legend]:text-[1.25rem]! [&>legend]:tracking-[0.04em]! [&>legend]:text-dim! [&>legend]:uppercase! [&>legend]:mb-6 [&_input:not([type='range'])]:bg-white [&_input:not([type='range'])]:border-[0.15rem] [&_input:not([type='range'])]:border-[#d6d6d2] [&_input:not([type='range'])]:border-solid [&_input:not([type='range'])]:rounded-[1.2rem] [&_input:not([type='range'])]:text-ink [&_input:not([type='range'])]:text-[1.5rem] [&_input:not([type='range'])]:min-h-48 [&_input:not([type='range'])]:[outline:none] [&_input:not([type='range'])]:py-10 [&_input:not([type='range'])]:px-14 [&_input:not([type='range'])]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_input:not([type='range'])]:w-full [&_select]:bg-white [&_select]:border-[0.15rem] [&_select]:border-[#d6d6d2] [&_select]:border-solid [&_select]:rounded-[1.2rem] [&_select]:text-ink! [&_select]:text-[1.5rem]! [&_select]:min-h-48 [&_select]:[outline:none] [&_select]:py-10 [&_select]:px-14 [&_select]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_select]:w-full [&_textarea]:bg-white! [&_textarea]:border-[0.15rem]! [&_textarea]:border-[#d6d6d2]! [&_textarea]:border-solid! [&_textarea]:rounded-[1.2rem]! [&_textarea]:text-ink! [&_textarea]:text-[1.5rem]! [&_textarea]:min-h-48! [&_textarea]:[outline:none]! [&_textarea]:py-10! [&_textarea]:px-14! [&_textarea]:[transition:border-color_0.2s,_box-shadow_0.2s]! [&_textarea]:w-full! [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_input:focus]:border-blue! [&_input:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_select:focus]:border-blue! [&_select:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_textarea:focus]:border-blue! [&_textarea:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_input[readonly]]:bg-soft! [&_input[readonly]]:text-dim! [&_input[type='range']]:[accent-color:var(--color-blue)] [&_input[type='range']]:w-full! [&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)]! [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%]! [&_select]:[background-repeat:no-repeat]! [&_select]:[background-size:0.55rem_0.55rem]! [&_select]:pr-46! [&_select]:text-ellipsis">
              <span>Komentar</span>
              <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Contoh: Mohon tenggat diperpanjang 7 hari karena musim hujan." />
            </label>
            <Btn onClick={comment}>Kirim komentar</Btn>
          </Panel>
        )}
        {err && <p className="text-red text-[1.35rem] not-italic">{err}</p>}
      </div>
    </div>
  )
}
