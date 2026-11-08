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
    <div className="grid gap-20 [&>*]:min-w-0">
      {revising && isDesa && (
        <p className="items-start rounded-[1.2rem] flex text-[1.4rem] gap-10 leading-[1.45] py-12 px-14 bg-red text-white d-callout">
          <Icon name="alert" />
          Pihak kedua meminta revisi{c.reviewNote ? `: “${c.reviewNote}”` : ''}. Ubah pasal lalu kirim versi baru.
        </p>
      )}
      <Panel
        title={editing ? `Mengubah versi ${latest.no}` : `Versi ${ver.no}`}
        desc={editing ? (revising ? 'Simpan akan membuat versi baru dan mengirimkannya untuk ditinjau ulang.' : 'Perubahan langsung diaudit ulang oleh AI.') : `Dibuat ${fmtDateTime(ver.at)}${ver.note ? ` · ${ver.note}` : ''}`}
        action={
          !editing && (
            <div className="items-center flex flex-wrap gap-10">
              {c.versions.length > 1 && (
                <label className="[&_select]:bg-white [&_select]:border-[0.15rem] [&_select]:border-[#d6d6d2] [&_select]:border-solid [&_select]:rounded-[1.2rem] [&_select]:text-ink [&_select]:[outline:none] [&_select]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_select:focus]:border-blue [&_select:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_select]:text-[1.3rem] [&_select]:min-h-36 [&_select]:py-4 [&_select]:px-12 [&_select]:w-auto [&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)] [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%] [&_select]:[background-repeat:no-repeat] [&_select]:[background-size:0.55rem_0.55rem] [&_select]:pr-46 [&_select]:text-ellipsis">
                  <span className="[clip:rect(0_0_0_0)] h-[1px] overflow-hidden absolute whitespace-nowrap w-[1px] sr-only">Pilih versi</span>
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
            <ol className="is-editing [&_textarea]:bg-white [&_textarea]:border-[0.15rem] [&_textarea]:border-[#d6d6d2] [&_textarea]:border-solid [&_textarea]:rounded-[1.2rem] [&_textarea]:text-ink [&_textarea]:text-[1.5rem] [&_textarea]:min-h-48 [&_textarea]:[outline:none] [&_textarea]:py-10 [&_textarea]:px-14 [&_textarea]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_textarea]:w-full [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_textarea:focus]:border-blue [&_textarea:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] grid gap-8 list-none list-outside [&>li]:border-[0.15rem]! [&>li]:border-[#ececea]! [&>li]:border-solid! [&>li]:rounded-[1.4rem]! [&>li]:grid [&>li]:gap-8 [&>li]:py-14! [&>li]:px-16! [&>li_p]:text-[1.5rem] [&>li_p]:leading-[1.6] [&.is-editing>li]:[border-style:dashed] [&.is-editing_label]:grid [&.is-editing_label]:gap-8 d-clauses">
              {draft.map((cl, i) => (
                <li key={cl.key}>
                  <label>
                    <span className="text-[1.25rem] tracking-[0.04em] text-dim uppercase">
                      Pasal {i + 1} · {cl.title}
                    </span>
                    <textarea rows={3} value={cl.text} onChange={(e) => setDraft(draft.map((x) => (x.key === cl.key ? { ...x, text: e.target.value } : x)))} />
                  </label>
                </li>
              ))}
            </ol>
            {revising && (
              <label className="[.d-form>&]:w-full border-0 border-none grid gap-6 min-w-0 [&>span]:text-[1.25rem] [&>span]:tracking-[0.04em] [&>span]:text-dim [&>span]:uppercase [&>legend]:text-[1.25rem]! [&>legend]:tracking-[0.04em]! [&>legend]:text-dim! [&>legend]:uppercase! [&>legend]:mb-6 [&_input:not([type='range'])]:bg-white [&_input:not([type='range'])]:border-[0.15rem] [&_input:not([type='range'])]:border-[#d6d6d2] [&_input:not([type='range'])]:border-solid [&_input:not([type='range'])]:rounded-[1.2rem] [&_input:not([type='range'])]:text-ink [&_input:not([type='range'])]:text-[1.5rem] [&_input:not([type='range'])]:min-h-48 [&_input:not([type='range'])]:[outline:none] [&_input:not([type='range'])]:py-10 [&_input:not([type='range'])]:px-14 [&_input:not([type='range'])]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_input:not([type='range'])]:w-full [&_select]:bg-white [&_select]:border-[0.15rem] [&_select]:border-[#d6d6d2] [&_select]:border-solid [&_select]:rounded-[1.2rem] [&_select]:text-ink! [&_select]:text-[1.5rem]! [&_select]:min-h-48 [&_select]:[outline:none] [&_select]:py-10 [&_select]:px-14 [&_select]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_select]:w-full [&_textarea]:bg-white! [&_textarea]:border-[0.15rem]! [&_textarea]:border-[#d6d6d2]! [&_textarea]:border-solid! [&_textarea]:rounded-[1.2rem]! [&_textarea]:text-ink! [&_textarea]:text-[1.5rem]! [&_textarea]:min-h-48! [&_textarea]:[outline:none]! [&_textarea]:py-10! [&_textarea]:px-14! [&_textarea]:[transition:border-color_0.2s,_box-shadow_0.2s]! [&_textarea]:w-full! [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_input:focus]:border-blue! [&_input:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_select:focus]:border-blue! [&_select:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_textarea:focus]:border-blue! [&_textarea:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_input[readonly]]:bg-soft! [&_input[readonly]]:text-dim! [&_input[type='range']]:[accent-color:var(--color-blue)] [&_input[type='range']]:w-full! [&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)]! [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%]! [&_select]:[background-repeat:no-repeat]! [&_select]:[background-size:0.55rem_0.55rem]! [&_select]:pr-46! [&_select]:text-ellipsis">
                <span>Catatan perubahan untuk pihak kedua</span>
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: Tenggat termin 2 dimundurkan sesuai permintaan." />
              </label>
            )}
            <div className="items-center flex flex-wrap gap-10">
              <Btn onClick={save}>{revising ? `Kirim versi ${latest.no + 1}` : 'Simpan perubahan'}</Btn>
              <Btn variant="ghost" onClick={() => setEditing(false)}>
                Batal
              </Btn>
            </div>
          </>
        ) : (
          <ol className="[&_textarea]:bg-white [&_textarea]:border-[0.15rem] [&_textarea]:border-[#d6d6d2] [&_textarea]:border-solid [&_textarea]:rounded-[1.2rem] [&_textarea]:text-ink [&_textarea]:text-[1.5rem] [&_textarea]:min-h-48 [&_textarea]:[outline:none] [&_textarea]:py-10 [&_textarea]:px-14 [&_textarea]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_textarea]:w-full [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_textarea:focus]:border-blue [&_textarea:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] grid gap-8 list-none list-outside [&>li]:border-[0.15rem]! [&>li]:border-[#ececea]! [&>li]:border-solid! [&>li]:rounded-[1.4rem]! [&>li]:grid [&>li]:gap-8 [&>li]:py-14! [&>li]:px-16! [&>li_p]:text-[1.5rem] [&>li_p]:leading-[1.6] [&.is-editing>li]:[border-style:dashed] [&.is-editing_label]:grid [&.is-editing_label]:gap-8 d-clauses">
            {ver.clauses.map((cl, i) => (
              <li key={cl.key} className={changedFrom(prev?.clauses, cl) ? '[.d-clauses>li&]:border-blue' : ''}>
                <div className="is-static items-center [background:none] border-0 border-none [color:inherit] flex gap-10 p-0 text-left w-full [&_span]:text-[1.2rem] [&_span]:tracking-[0.04em] [&_span]:text-dim [&_span]:uppercase [&_strong]:flex-1 [&_strong]:font-[450] [&:not(.is-static):hover_strong]:text-blue">
                  <span>Pasal {i + 1}</span>
                  <strong>{cl.title}</strong>
                  {changedFrom(prev?.clauses, cl) && <Badge tone="tint">Berubah dari versi {prev!.no}</Badge>}
                </div>
                <p>{cl.text}</p>
                <small className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">{cl.plain}</small>
              </li>
            ))}
          </ol>
        )}
      </Panel>

      {isDesa && (c.status === 'draf' || c.status === 'diaudit') && !editing && (
        <Panel title="Kirim ke pihak kedua" desc="Setelah dikirim, pihak kedua bisa memberi komentar per pasal. Isi kontrak dikunci kecuali mereka meminta revisi.">
          {critical > 0 ? (
            <p className="items-start rounded-[1.2rem] flex text-[1.4rem] gap-10 leading-[1.45] py-12 px-14 bg-red text-white d-callout">
              <Icon name="alert" />
              Masih ada {critical} temuan kritis.{' '}
              <button type="button" className="[background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] text-blue text-[1.3rem] p-0 whitespace-nowrap [&:hover]:text-ink [.d-callout_&]:[color:inherit]! [.d-integrity_&]:inline-block [.d-integrity_&]:mt-6 [.d-integrity_&]:text-white! [.app-notif-panel_header_&:disabled]:text-dim [.app-notif-panel_header_&:disabled]:cursor-default" onClick={() => go('audit')}>
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
