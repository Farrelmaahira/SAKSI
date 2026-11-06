'use client'

import type { TabProps } from '@/interfaces/dash'
import { useState } from 'react'
import { daysFromNow } from '@/lib/dates/days-from-now'
import { deadlineOf } from '@/lib/db/deadline-of'
import { signedOrLater } from '@/lib/dash/signed-or-later'
import { saveSpk } from '@/lib/db/save-spk'
import Empty from '@/components/molecules/Empty'
import Panel from '@/components/molecules/Panel'
import Btn from '@/components/atoms/Btn'
import { fmtDate } from '@/lib/dates/fmt-date'

export default function SpkTab({ c, session }: TabProps) {
  const [form, setForm] = useState(c.spk ?? { number: `SPK/${c.code.slice(-3)}/${new Date().getFullYear()}`, date: daysFromNow(0), start: daysFromNow(1), end: deadlineOf(c) })
  const [editing, setEditing] = useState(false)
  const [err, setErr] = useState('')
  const isDesa = session.role.role === 'perangkat_desa'
  const ready = signedOrLater(c.status)

  const save = () => {
    if (form.number.trim().length < 4) return setErr('Isi nomor SPK.')
    if (!form.date || !form.start || !form.end) return setErr('Lengkapi semua tanggal.')
    if (form.end < form.start) return setErr('Tanggal selesai harus setelah tanggal mulai.')
    saveSpk(c.code, { ...form, number: form.number.trim() }, session)
    setEditing(false)
    setErr('')
  }

  if (!ready) return <Empty art="contract-signed_vutk" title="SPK diterbitkan setelah kontrak ditandatangani." />
  const showForm = isDesa && (editing || !c.spk)
  return (
    <Panel title="Surat Perintah Kerja" desc="SPK menandai pekerjaan resmi dimulai. Setelah kontrak dipublikasikan dan SPK terbit, status menjadi Berjalan.">
      {showForm ? (
        <>
          <div className="d-form-grid">
            <label className="d-field">
              <span>Nomor SPK</span>
              <input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
            </label>
            <label className="d-field">
              <span>Tanggal SPK</span>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </label>
            <label className="d-field">
              <span>Mulai bekerja</span>
              <input type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
            </label>
            <label className="d-field">
              <span>Selesai paling lambat</span>
              <input type="date" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
            </label>
          </div>
          {err && <p className="d-field-error">{err}</p>}
          <div className="d-btn-row">
            <Btn onClick={save}>{c.spk ? 'Simpan perubahan' : 'Terbitkan SPK'}</Btn>
            {c.spk && (
              <Btn variant="ghost" onClick={() => setEditing(false)}>
                Batal
              </Btn>
            )}
          </div>
          {c.status === 'ditandatangani' && <p className="d-fine">Kontrak belum dipublikasikan. Status berubah menjadi Berjalan setelah publikasi.</p>}
        </>
      ) : c.spk ? (
        <>
          <dl className="d-summary">
            <div>
              <dt>Nomor</dt>
              <dd>{c.spk.number}</dd>
            </div>
            <div>
              <dt>Tanggal</dt>
              <dd>{fmtDate(c.spk.date)}</dd>
            </div>
            <div>
              <dt>Mulai</dt>
              <dd>{fmtDate(c.spk.start)}</dd>
            </div>
            <div>
              <dt>Selesai</dt>
              <dd>{fmtDate(c.spk.end)}</dd>
            </div>
          </dl>
          {isDesa && c.status !== 'selesai' && (
            <Btn small variant="ghost" onClick={() => setEditing(true)}>
              Ubah SPK
            </Btn>
          )}
        </>
      ) : (
        <p className="d-muted">SPK belum diterbitkan desa.</p>
      )}
    </Panel>
  )
}
