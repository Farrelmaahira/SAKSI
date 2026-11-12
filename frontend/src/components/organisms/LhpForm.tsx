'use client'

import Btn from '@/components/atoms/Btn'
import FormAlert from '@/components/atoms/FormAlert'
import FindingFields from '@/components/molecules/FindingFields'
import FormField from '@/components/molecules/FormField'
import Panel from '@/components/molecules/Panel'
import { MAX_FINDINGS, useLhpForm } from '@/hooks/use-lhp-form'
import type { AuditReport, TerminListItem } from '@/interfaces/api'

interface Props { contracts: TerminListItem[]; onCreated: (r: AuditReport) => void }

/* POST /audit-reports: an LHP or uji petik on one contract in the inspektorat's scope, with up to 50 findings */
export default function LhpForm({ contracts, onCreated }: Props) {
  const f = useLhpForm(contracts, onCreated)

  return (
    <Panel title="Susun LHP" desc="Temuan atas SPK, termin, atau pasal kontrak. Draf hanya terlihat oleh Anda sampai diterbitkan.">
      <form className="grid gap-16" noValidate onSubmit={(e) => { e.preventDefault(); f.save() }}>
        <div className="grid gap-16 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <FormField label="Kontrak">
            <select value={f.contractId} onChange={(e) => f.setContractId(Number(e.target.value))}>
              {contracts.map((c) => (
                <option key={c.contractId} value={c.contractId}>
                  {c.nomor} · {c.judul}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Jenis">
            <select value={f.jenis} onChange={(e) => f.setJenis(e.target.value as 'lhp' | 'uji_petik')}>
              <option value="lhp">LHP</option>
              <option value="uji_petik">Uji petik</option>
            </select>
          </FormField>
        </div>
        <FormField label="Ringkasan">
          <textarea rows={3} value={f.ringkasan} onChange={(e) => f.setRingkasan(e.target.value)} />
        </FormField>
        {f.findings.map((x, i) => (
          <FindingFields key={i} index={i} finding={x} onChange={(p) => f.patch(i, p)} onRemove={f.findings.length > 1 ? () => f.removeFinding(i) : undefined} />
        ))}
        <div className="items-center flex flex-wrap gap-10">
          <Btn small variant="ghost" icon="plus" onClick={f.addFinding} disabled={f.findings.length >= MAX_FINDINGS}>
            Tambah temuan
          </Btn>
        </div>
        <label className="items-start cursor-pointer flex text-[1.45rem] gap-10 leading-[1.45] [&_input]:[accent-color:var(--color-blue)] [&_input]:flex-none [&_input]:h-18 [&_input]:mt-2 [&_input]:w-18 bg-soft rounded-[1.2rem] py-12 px-14">
          <input type="checkbox" checked={f.terbit} onChange={(e) => f.setTerbit(e.target.checked)} />
          <span>Langsung terbitkan (desa dan BPD bisa membaca, pembuat kontrak mendapat notifikasi)</span>
        </label>
        {f.error && <FormAlert>{f.error}</FormAlert>}
        <div>
          <Btn type="submit" disabled={f.busy}>{f.busy ? 'Menyimpan…' : f.terbit ? 'Simpan dan terbitkan' : 'Simpan draf'}</Btn>
        </div>
      </form>
    </Panel>
  )
}
