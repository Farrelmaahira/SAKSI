'use client'

import { useState } from 'react'
import type { AuditReport, LhpFinding, TerminListItem } from '@/interfaces/api'
import { createAuditReport } from '@/lib/api/create-audit-report'
import FormField from '@/components/molecules/FormField'
import Panel from '@/components/molecules/Panel'
import Btn from '@/components/atoms/Btn'
import FormAlert from '@/components/atoms/FormAlert'

interface Props { contracts: TerminListItem[]; onCreated: (r: AuditReport) => void }

type Draft = Omit<LhpFinding, 'id'>
const blank = (): Draft => ({ objek: 'termin', temuan: '', tingkat: 'saran', rekomendasi: '' })

/* POST /audit-reports: an LHP or uji petik on one contract in the inspektorat's scope, with up to 50 findings */
export default function LhpForm({ contracts, onCreated }: Props) {
  const [contractId, setContractId] = useState(contracts[0]?.contractId ?? 0)
  const [jenis, setJenis] = useState<'lhp' | 'uji_petik'>('lhp')
  const [ringkasan, setRingkasan] = useState('')
  const [findings, setFindings] = useState<Draft[]>([blank()])
  const [terbit, setTerbit] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const patch = (i: number, p: Partial<Draft>) => setFindings((f) => f.map((x, j) => (j === i ? { ...x, ...p } : x)))
  const save = async () => {
    const filled = findings.filter((f) => f.temuan.trim())
    if (!contractId) return setError('Pilih kontrak.')
    if (ringkasan.trim().length < 10) return setError('Tulis ringkasan minimal 10 karakter.')
    setBusy(true)
    setError('')
    const r = await createAuditReport({ contractId, jenis, ringkasan: ringkasan.trim(), terbit, findings: filled.map((f) => ({ ...f, temuan: f.temuan.trim(), rekomendasi: f.rekomendasi.trim() })) })
    setBusy(false)
    if (!r.ok) return setError(r.error)
    setRingkasan('')
    setFindings([blank()])
    setTerbit(false)
    onCreated(r.data)
  }

  return (
    <Panel title="Susun LHP" desc="Temuan atas SPK, termin, atau pasal kontrak. Draf hanya terlihat oleh Anda sampai diterbitkan.">
      <form className="grid gap-16" noValidate onSubmit={(e) => { e.preventDefault(); save() }}>
        <div className="grid gap-16 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <FormField label="Kontrak">
            <select value={contractId} onChange={(e) => setContractId(Number(e.target.value))}>
              {contracts.map((c) => (
                <option key={c.contractId} value={c.contractId}>
                  {c.nomor} · {c.judul}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Jenis">
            <select value={jenis} onChange={(e) => setJenis(e.target.value as 'lhp' | 'uji_petik')}>
              <option value="lhp">LHP</option>
              <option value="uji_petik">Uji petik</option>
            </select>
          </FormField>
        </div>
        <FormField label="Ringkasan">
          <textarea rows={3} value={ringkasan} onChange={(e) => setRingkasan(e.target.value)} />
        </FormField>
        {findings.map((f, i) => (
          <fieldset key={i} className="border-[0.15rem] border-[#ececea] border-solid rounded-[1.6rem] grid gap-12 p-16 md:grid-cols-2">
            <legend className="text-[1.25rem] tracking-[0.04em] text-dim uppercase px-6">Temuan {i + 1}</legend>
            <FormField label="Objek">
              <select value={f.objek} onChange={(e) => patch(i, { objek: e.target.value as Draft['objek'] })}>
                <option value="spk">SPK</option>
                <option value="termin">Termin</option>
                <option value="pasal">Pasal</option>
              </select>
            </FormField>
            <FormField label="Tingkat">
              <select value={f.tingkat} onChange={(e) => patch(i, { tingkat: e.target.value as Draft['tingkat'] })}>
                <option value="saran">Saran</option>
                <option value="kritis">Kritis</option>
              </select>
            </FormField>
            <FormField label="Temuan" className="md:col-span-2">
              <textarea rows={2} value={f.temuan} onChange={(e) => patch(i, { temuan: e.target.value })} />
            </FormField>
            <FormField label="Rekomendasi" className="md:col-span-2">
              <textarea rows={2} value={f.rekomendasi} onChange={(e) => patch(i, { rekomendasi: e.target.value })} />
            </FormField>
            {findings.length > 1 && (
              <Btn small variant="ghost" onClick={() => setFindings((x) => x.filter((_, j) => j !== i))}>
                Hapus temuan
              </Btn>
            )}
          </fieldset>
        ))}
        <div className="items-center flex flex-wrap gap-10">
          <Btn small variant="ghost" icon="plus" onClick={() => setFindings((x) => [...x, blank()])} disabled={findings.length >= 50}>
            Tambah temuan
          </Btn>
        </div>
        <label className="items-start cursor-pointer flex text-[1.45rem] gap-10 leading-[1.45] [&_input]:[accent-color:var(--color-blue)] [&_input]:flex-none [&_input]:h-18 [&_input]:mt-2 [&_input]:w-18 bg-soft rounded-[1.2rem] py-12 px-14">
          <input type="checkbox" checked={terbit} onChange={(e) => setTerbit(e.target.checked)} />
          <span>Langsung terbitkan (desa dan BPD bisa membaca, pembuat kontrak mendapat notifikasi)</span>
        </label>
        {error && <FormAlert>{error}</FormAlert>}
        <div>
          <Btn type="submit" disabled={busy}>{busy ? 'Menyimpan…' : terbit ? 'Simpan dan terbitkan' : 'Simpan draf'}</Btn>
        </div>
      </form>
    </Panel>
  )
}
