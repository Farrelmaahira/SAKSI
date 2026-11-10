'use client'

import { useEffect, useState } from 'react'
import type { ApiResult, OversightAssignment, Pengawas } from '@/interfaces/api'
import type { PublicContractSummary } from '@/lib/api/reports'
import { listPengawas } from '@/lib/api/list-pengawas'
import { listAssignments } from '@/lib/api/list-assignments'
import { assignPengawas } from '@/lib/api/assign-pengawas'
import { listPublicContracts } from '@/lib/api/list-public-contracts'
import { fmtDate } from '@/lib/dates/fmt-date'
import FormField from '@/components/molecules/FormField'
import Panel from '@/components/molecules/Panel'
import RowList from '@/components/molecules/RowList'
import Empty from '@/components/molecules/Empty'
import Badge from '@/components/atoms/Badge'
import Btn from '@/components/atoms/Btn'
import FormAlert from '@/components/atoms/FormAlert'

/* Pengawas accounts in the region (GET /admin/pengawas) and contract assignments (GET/POST /admin/oversight-assignments) */
export default function AdminOversight() {
  const [pengawas, setPengawas] = useState<ApiResult<Pengawas[]> | null>(null)
  const [assigned, setAssigned] = useState<ApiResult<OversightAssignment[]> | null>(null)
  // shortcut: contract choices come from the public list (published or running), the only contract list an admin can read; upgrade when BE adds GET /admin/contracts
  const [contracts, setContracts] = useState<PublicContractSummary[]>([])
  const [tick, setTick] = useState(0)
  const [form, setForm] = useState({ contractId: '', userId: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    listPengawas().then((r) => active && setPengawas(r))
    listPublicContracts().then((r) => active && r.ok && setContracts(r.data))
    return () => {
      active = false
    }
  }, [])
  useEffect(() => {
    let active = true
    listAssignments().then((r) => active && setAssigned(r))
    return () => {
      active = false
    }
  }, [tick])

  const people = pengawas?.ok ? pengawas.data : []
  const save = async () => {
    const who = people.find((p) => String(p.userId) === form.userId)
    if (!form.contractId || !who) return setError('Pilih kontrak dan pengawas.')
    setBusy(true)
    setError('')
    const r = await assignPengawas({ contractId: Number(form.contractId), pengawasUserId: who.userId, jenis: who.jenis })
    setBusy(false)
    if (!r.ok) return setError(r.error)
    setForm({ contractId: '', userId: '' })
    setTick((t) => t + 1)
  }

  return (
    <>
      <Panel title="Pengawas di wilayah Anda" desc="Akun BPD dan Inspektorat yang bisa ditugaskan.">
        {!pengawas ? (
          <p className="text-[1.4rem] text-dim" role="status">Memuat pengawas…</p>
        ) : !pengawas.ok ? (
          <FormAlert>{pengawas.error}</FormAlert>
        ) : people.length ? (
          <RowList>
            {people.map((p) => (
              <li key={p.userId}>
                <div>
                  <strong>{p.nama}</strong>
                  <small>
                    {p.email}
                    {p.villageName ? ` · ${p.villageName}` : ''}
                  </small>
                </div>
                <Badge tone="tint">{p.jenis === 'bpd' ? 'BPD' : 'Inspektorat'}</Badge>
              </li>
            ))}
          </RowList>
        ) : (
          <Empty title="Belum ada akun pengawas di wilayah ini." />
        )}
      </Panel>
      <Panel title="Penugasan pengawas" desc="Pengawas yang ditugaskan bisa membaca kontrak itu dan mendapat notifikasi.">
        {!assigned ? (
          <p className="text-[1.4rem] text-dim" role="status">Memuat penugasan…</p>
        ) : !assigned.ok ? (
          <FormAlert>{assigned.error}</FormAlert>
        ) : assigned.data.length ? (
          <RowList>
            {assigned.data.map((a) => (
              <li key={a.id}>
                <div>
                  <strong>{a.contractJudul}</strong>
                  <small>
                    {a.villageName} · {a.pengawasNama} · sejak {fmtDate(a.ditetapkanPada)}
                  </small>
                </div>
                <Badge tone="tint">{a.jenis === 'bpd' ? 'BPD' : 'Inspektorat'}</Badge>
              </li>
            ))}
          </RowList>
        ) : (
          <Empty title="Belum ada penugasan." />
        )}
        <form className="grid gap-12 md:grid-cols-2" noValidate onSubmit={(e) => { e.preventDefault(); save() }}>
          <FormField label="Kontrak">
            <select value={form.contractId} onChange={(e) => setForm({ ...form, contractId: e.target.value })}>
              <option value="">{contracts.length ? 'Pilih kontrak' : 'Belum ada kontrak terbit'}</option>
              {contracts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nomor} · {c.judul}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Pengawas">
            <select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}>
              <option value="">Pilih pengawas</option>
              {people.map((p) => (
                <option key={p.userId} value={p.userId}>
                  {p.nama} ({p.jenis === 'bpd' ? 'BPD' : 'Inspektorat'})
                </option>
              ))}
            </select>
          </FormField>
          {error && <div className="md:col-span-2"><FormAlert>{error}</FormAlert></div>}
          <div>
            <Btn type="submit" disabled={busy}>{busy ? 'Menyimpan…' : 'Tugaskan'}</Btn>
          </div>
        </form>
      </Panel>
    </>
  )
}
