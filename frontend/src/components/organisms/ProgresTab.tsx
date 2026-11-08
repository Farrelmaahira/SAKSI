'use client'

import type { TabProps } from '@/interfaces/dash'
import { progressOf } from '@/lib/db/progress-of'
import { useState } from 'react'
import { addProgress } from '@/lib/db/add-progress'
import Panel from '@/components/molecules/Panel'
import Bar from '@/components/atoms/Bar'
import { fmtDateTime } from '@/lib/dates/fmt-date-time'
import Btn from '@/components/atoms/Btn'
import Locked from '@/components/atoms/Locked'
import { setSelfReport } from '@/lib/db/set-self-report'
import { useConfirm } from '@/hooks/use-confirm'

export default function ProgresTab({ c, session }: TabProps) {
  const confirm = useConfirm()
  const last = progressOf(c)
  const [pct, setPct] = useState(Math.min(100, last + 10))
  const [note, setNote] = useState('')
  const [photos, setPhotos] = useState(2)
  const [err, setErr] = useState('')
  const r = session.role.role
  const running = c.status === 'berjalan'
  const canReport = running && (r === 'perangkat_desa' || (r === 'pihak_kedua' && c.selfReport))

  const save = async () => {
    if (pct <= last) return setErr(`Progres harus lebih dari ${last}%.`)
    if (note.trim().length < 5) return setErr('Tulis catatan singkat pekerjaan yang sudah selesai.')
    if (pct === 100) {
      const ok = await confirm({
        title: 'Tandai kontrak selesai?',
        text: 'Progres 100% menandai kontrak ini selesai. Setelah itu progres tidak bisa ditambah lagi.',
        confirmLabel: 'Ya, tandai selesai',
        art: 'document-ready_o5d5',
      })
      if (!ok) return
    }
    addProgress(c.code, { percent: pct, note: note.trim(), photos }, session)
    setNote('')
    setErr('')
    setPct(Math.min(100, pct + 10))
  }

  return (
    <div className="items-stretch grid gap-20 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] [&>*]:min-w-0">
      <Panel title="Riwayat progres" desc="Riwayat ini juga menjadi tonggak pekerjaan di portal warga.">
        <div className="grid gap-8 [&>div:first-child]:items-baseline [&>div:first-child]:flex [&>div:first-child]:justify-between [&_span]:text-[1.35rem] [&_span]:text-dim [&_strong]:text-[2.6rem]! [&_strong]:font-[320] [&_strong_small]:text-[1.3rem] [&_strong_small]:text-dim d-big-progress">
          <div>
            <span>Progres saat ini</span>
            <strong>{last}%</strong>
          </div>
          <Bar value={last} />
        </div>
        {c.progress.length ? (
          <ol className="grid gap-12 list-none list-outside [&_li]:[align-items:start] [&_li]:grid [&_li]:gap-14 [&_li]:grid-cols-[6.4rem_minmax(0,1fr)] [&.is-status]:gap-x-14 [&.is-status]:grid-cols-[max-content_minmax(0,1fr)] [&.is-status_li]:[grid-column:1_/_-1] [&.is-status_li]:grid-cols-[subgrid] [&_li>strong]:text-blue [&_li>strong]:text-[2rem] [&_li>strong]:font-[350] [&_p]:text-[1.45rem] [&_p]:leading-[1.45] [&_small]:text-[1.25rem]! [&_small]:text-dim d-timeline">
            {[...c.progress].reverse().map((p) => (
              <li key={p.id}>
                <strong>{p.percent}%</strong>
                <div>
                  <p>{p.note}</p>
                  <small>
                    {p.by} · {fmtDateTime(p.at)} · {p.photos} foto
                  </small>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">Belum ada laporan progres.</p>
        )}
      </Panel>
      <div className="grid gap-20 [&>*]:min-w-0">
        {canReport ? (
          <Panel title="Catat progres">
            <label className="[.d-form>&]:w-full border-0 border-none grid gap-6 min-w-0 [&>span]:text-[1.25rem] [&>span]:tracking-[0.04em] [&>span]:text-dim [&>span]:uppercase [&>legend]:text-[1.25rem]! [&>legend]:tracking-[0.04em]! [&>legend]:text-dim! [&>legend]:uppercase! [&>legend]:mb-6 [&_input:not([type='range'])]:bg-white [&_input:not([type='range'])]:border-[0.15rem] [&_input:not([type='range'])]:border-[#d6d6d2] [&_input:not([type='range'])]:border-solid [&_input:not([type='range'])]:rounded-[1.2rem] [&_input:not([type='range'])]:text-ink [&_input:not([type='range'])]:text-[1.5rem] [&_input:not([type='range'])]:min-h-48 [&_input:not([type='range'])]:[outline:none] [&_input:not([type='range'])]:py-10 [&_input:not([type='range'])]:px-14 [&_input:not([type='range'])]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_input:not([type='range'])]:w-full [&_select]:bg-white [&_select]:border-[0.15rem] [&_select]:border-[#d6d6d2] [&_select]:border-solid [&_select]:rounded-[1.2rem] [&_select]:text-ink! [&_select]:text-[1.5rem]! [&_select]:min-h-48 [&_select]:[outline:none] [&_select]:py-10 [&_select]:px-14 [&_select]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_select]:w-full [&_textarea]:bg-white! [&_textarea]:border-[0.15rem]! [&_textarea]:border-[#d6d6d2]! [&_textarea]:border-solid! [&_textarea]:rounded-[1.2rem]! [&_textarea]:text-ink! [&_textarea]:text-[1.5rem]! [&_textarea]:min-h-48! [&_textarea]:[outline:none]! [&_textarea]:py-10! [&_textarea]:px-14! [&_textarea]:[transition:border-color_0.2s,_box-shadow_0.2s]! [&_textarea]:w-full! [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_input:focus]:border-blue! [&_input:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_select:focus]:border-blue! [&_select:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_textarea:focus]:border-blue! [&_textarea:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_input[readonly]]:bg-soft! [&_input[readonly]]:text-dim! [&_input[type='range']]:[accent-color:var(--color-blue)] [&_input[type='range']]:w-full! [&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)]! [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%]! [&_select]:[background-repeat:no-repeat]! [&_select]:[background-size:0.55rem_0.55rem]! [&_select]:pr-46! [&_select]:text-ellipsis">
              <span>Persentase selesai: {pct}%</span>
              <input type="range" min={0} max={100} step={5} value={pct} onChange={(e) => setPct(Number(e.target.value))} />
            </label>
            <label className="[.d-form>&]:w-full border-0 border-none grid gap-6 min-w-0 [&>span]:text-[1.25rem] [&>span]:tracking-[0.04em] [&>span]:text-dim [&>span]:uppercase [&>legend]:text-[1.25rem]! [&>legend]:tracking-[0.04em]! [&>legend]:text-dim! [&>legend]:uppercase! [&>legend]:mb-6 [&_input:not([type='range'])]:bg-white [&_input:not([type='range'])]:border-[0.15rem] [&_input:not([type='range'])]:border-[#d6d6d2] [&_input:not([type='range'])]:border-solid [&_input:not([type='range'])]:rounded-[1.2rem] [&_input:not([type='range'])]:text-ink [&_input:not([type='range'])]:text-[1.5rem] [&_input:not([type='range'])]:min-h-48 [&_input:not([type='range'])]:[outline:none] [&_input:not([type='range'])]:py-10 [&_input:not([type='range'])]:px-14 [&_input:not([type='range'])]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_input:not([type='range'])]:w-full [&_select]:bg-white [&_select]:border-[0.15rem] [&_select]:border-[#d6d6d2] [&_select]:border-solid [&_select]:rounded-[1.2rem] [&_select]:text-ink! [&_select]:text-[1.5rem]! [&_select]:min-h-48 [&_select]:[outline:none] [&_select]:py-10 [&_select]:px-14 [&_select]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_select]:w-full [&_textarea]:bg-white! [&_textarea]:border-[0.15rem]! [&_textarea]:border-[#d6d6d2]! [&_textarea]:border-solid! [&_textarea]:rounded-[1.2rem]! [&_textarea]:text-ink! [&_textarea]:text-[1.5rem]! [&_textarea]:min-h-48! [&_textarea]:[outline:none]! [&_textarea]:py-10! [&_textarea]:px-14! [&_textarea]:[transition:border-color_0.2s,_box-shadow_0.2s]! [&_textarea]:w-full! [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_input:focus]:border-blue! [&_input:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_select:focus]:border-blue! [&_select:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_textarea:focus]:border-blue! [&_textarea:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_input[readonly]]:bg-soft! [&_input[readonly]]:text-dim! [&_input[type='range']]:[accent-color:var(--color-blue)] [&_input[type='range']]:w-full! [&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)]! [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%]! [&_select]:[background-repeat:no-repeat]! [&_select]:[background-size:0.55rem_0.55rem]! [&_select]:pr-46! [&_select]:text-ellipsis">
              <span>Catatan</span>
              <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: Pemasangan pipa ruas 2 selesai, tinggal uji aliran." />
            </label>
            <label className="[.d-form>&]:w-full border-0 border-none grid gap-6 min-w-0 [&>span]:text-[1.25rem] [&>span]:tracking-[0.04em] [&>span]:text-dim [&>span]:uppercase [&>legend]:text-[1.25rem]! [&>legend]:tracking-[0.04em]! [&>legend]:text-dim! [&>legend]:uppercase! [&>legend]:mb-6 [&_input:not([type='range'])]:bg-white [&_input:not([type='range'])]:border-[0.15rem] [&_input:not([type='range'])]:border-[#d6d6d2] [&_input:not([type='range'])]:border-solid [&_input:not([type='range'])]:rounded-[1.2rem] [&_input:not([type='range'])]:text-ink [&_input:not([type='range'])]:text-[1.5rem] [&_input:not([type='range'])]:min-h-48 [&_input:not([type='range'])]:[outline:none] [&_input:not([type='range'])]:py-10 [&_input:not([type='range'])]:px-14 [&_input:not([type='range'])]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_input:not([type='range'])]:w-full [&_select]:bg-white [&_select]:border-[0.15rem] [&_select]:border-[#d6d6d2] [&_select]:border-solid [&_select]:rounded-[1.2rem] [&_select]:text-ink! [&_select]:text-[1.5rem]! [&_select]:min-h-48 [&_select]:[outline:none] [&_select]:py-10 [&_select]:px-14 [&_select]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_select]:w-full [&_textarea]:bg-white! [&_textarea]:border-[0.15rem]! [&_textarea]:border-[#d6d6d2]! [&_textarea]:border-solid! [&_textarea]:rounded-[1.2rem]! [&_textarea]:text-ink! [&_textarea]:text-[1.5rem]! [&_textarea]:min-h-48! [&_textarea]:[outline:none]! [&_textarea]:py-10! [&_textarea]:px-14! [&_textarea]:[transition:border-color_0.2s,_box-shadow_0.2s]! [&_textarea]:w-full! [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_input:focus]:border-blue! [&_input:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_select:focus]:border-blue! [&_select:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_textarea:focus]:border-blue! [&_textarea:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_input[readonly]]:bg-soft! [&_input[readonly]]:text-dim! [&_input[type='range']]:[accent-color:var(--color-blue)] [&_input[type='range']]:w-full! [&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)]! [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%]! [&_select]:[background-repeat:no-repeat]! [&_select]:[background-size:0.55rem_0.55rem]! [&_select]:pr-46! [&_select]:text-ellipsis">
              <span>Jumlah foto bukti (simulasi)</span>
              <input type="number" min={0} max={20} value={photos} onChange={(e) => setPhotos(Math.max(0, Number(e.target.value)))} />
            </label>
            {err && <p className="text-red text-[1.35rem] not-italic">{err}</p>}
            <Btn onClick={save}>Simpan progres</Btn>
          </Panel>
        ) : (
          <Locked
            text={
              c.status === 'selesai'
                ? 'Kontrak sudah selesai.'
                : !running
                  ? 'Progres bisa dicatat setelah kontrak berjalan.'
                  : r === 'pihak_kedua'
                    ? 'Desa belum mengizinkan pihak kedua melapor progres.'
                    : 'Progres dicatat oleh desa atau pihak kedua.'
            }
          />
        )}
        {r === 'perangkat_desa' && running && (
          <Panel title="Laporan dari pihak kedua">
            <label className="items-start cursor-pointer flex text-[1.45rem] gap-10 leading-[1.45] [&_input]:[accent-color:var(--color-blue)] [&_input]:flex-none [&_input]:h-18 [&_input]:mt-2 [&_input]:w-18 bg-soft rounded-[1.2rem] py-12 px-14">
              <input type="checkbox" checked={c.selfReport} onChange={(e) => setSelfReport(c.code, e.target.checked, session)} />
              <span>Izinkan pihak kedua mencatat progres sendiri</span>
            </label>
          </Panel>
        )}
      </div>
    </div>
  )
}
