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
    <div className="d-grid-2 d-grid-wide">
      <Panel title="Riwayat progres" desc="Riwayat ini juga menjadi tonggak pekerjaan di portal warga.">
        <div className="d-big-progress">
          <div>
            <span>Progres saat ini</span>
            <strong>{last}%</strong>
          </div>
          <Bar value={last} />
        </div>
        {c.progress.length ? (
          <ol className="d-timeline">
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
          <p className="d-muted">Belum ada laporan progres.</p>
        )}
      </Panel>
      <div className="d-stack">
        {canReport ? (
          <Panel title="Catat progres">
            <label className="d-field">
              <span>Persentase selesai: {pct}%</span>
              <input type="range" min={0} max={100} step={5} value={pct} onChange={(e) => setPct(Number(e.target.value))} />
            </label>
            <label className="d-field">
              <span>Catatan</span>
              <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: Pemasangan pipa ruas 2 selesai, tinggal uji aliran." />
            </label>
            <label className="d-field">
              <span>Jumlah foto bukti (simulasi)</span>
              <input type="number" min={0} max={20} value={photos} onChange={(e) => setPhotos(Math.max(0, Number(e.target.value)))} />
            </label>
            {err && <p className="d-field-error">{err}</p>}
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
            <label className="d-confirm">
              <input type="checkbox" checked={c.selfReport} onChange={(e) => setSelfReport(c.code, e.target.checked, session)} />
              <span>Izinkan pihak kedua mencatat progres sendiri</span>
            </label>
          </Panel>
        )}
      </div>
    </div>
  )
}
