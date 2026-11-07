'use client'

import { useDash } from '@/hooks/use-dash'
import { counterpartyStore } from '@/lib/master/counterparty-store'
import { FormEvent, useState } from 'react'
import { updateCounterparty } from '@/lib/master/update-counterparty'
import { addAudit } from '@/lib/audit/add-audit'
import Panel from '@/components/molecules/Panel'
import Notice from '@/components/molecules/Notice'
import Btn from '@/components/atoms/Btn'

export default function ProfilUsaha() {
  const { session } = useDash()
  const parties = counterpartyStore.use()
  const cp = parties.find((p) => p.id === session.role.counterpartyId)
  const [form, setForm] = useState({ name: cp?.name ?? '', contact: cp?.contact ?? '', npwp: cp?.npwp ?? '', address: cp?.address ?? '' })
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  if (!cp) return null

  const save = (e: FormEvent) => {
    e.preventDefault()
    if (form.name.trim().length < 3) return setMsg({ ok: false, text: 'Nama usaha minimal 3 huruf.' })
    if (form.npwp && !/^[\d.-]{15,20}$/.test(form.npwp.trim())) return setMsg({ ok: false, text: 'Format NPWP belum benar. Contoh: 01.234.567.8-405.000' })
    if (form.address.trim().length < 5) return setMsg({ ok: false, text: 'Alamat terlalu pendek.' })
    updateCounterparty(cp.id, { name: form.name.trim(), contact: form.contact.trim(), npwp: form.npwp.trim() || undefined, address: form.address.trim() })
    addAudit({ actor: session.name, role: 'Pihak Kedua', action: 'Memperbarui profil usaha', detail: form.name.trim() })
    setMsg({ ok: true, text: 'Profil usaha tersimpan. Kontrak baru memakai data ini.' })
  }

  return (
    <Panel title="Profil usaha" desc="Data ini dipakai desa saat menyusun kontrak baru. Kontrak yang sudah disegel tidak berubah.">
      <form onSubmit={save} className="d-form">
        <div className="d-form-grid">
          <label className="d-field">
            <span>Nama usaha</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="d-field">
            <span>Tipe</span>
            <input value={cp.type} readOnly aria-readonly="true" />
          </label>
          <label className="d-field">
            <span>Penanggung jawab</span>
            <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
          </label>
          <label className="d-field">
            <span>NPWP (opsional)</span>
            <input value={form.npwp} onChange={(e) => setForm({ ...form, npwp: e.target.value })} placeholder="01.234.567.8-405.000" />
          </label>
          <label className="d-field d-span-2">
            <span>Alamat</span>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </label>
        </div>
        <Notice msg={msg} />
        <Btn type="submit">Simpan profil usaha</Btn>
      </form>
    </Panel>
  )
}
