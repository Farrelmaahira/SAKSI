'use client'

import { useEffect, useState } from 'react'
import type { ApiResult, RegionRule } from '@/interfaces/api'
import { listRegionRules } from '@/lib/api/list-region-rules'
import { createRegionRule } from '@/lib/api/create-region-rule'
import { formatRp } from '@/lib/contracts/format-rp'
import { fmtDate } from '@/lib/dates/fmt-date'
import FormField from '@/components/molecules/FormField'
import Panel from '@/components/molecules/Panel'
import RowList from '@/components/molecules/RowList'
import Empty from '@/components/molecules/Empty'
import Btn from '@/components/atoms/Btn'
import FormAlert from '@/components/atoms/FormAlert'

/* GET/POST /admin/region-rules: procurement thresholds per region. A new rule is a new row, history stays. */
export default function AdminRegionRules() {
  const [res, setRes] = useState<ApiResult<RegionRule[]> | null>(null)
  const [tick, setTick] = useState(0)
  const [form, setForm] = useState({ langsung: '', penawaran: '', dasar: '', sejak: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    listRegionRules().then((r) => active && setRes(r))
    return () => {
      active = false
    }
  }, [tick])

  const save = async () => {
    const langsung = Number(form.langsung)
    const penawaran = Number(form.penawaran)
    if (!(langsung > 0) || !(penawaran > 0)) return setError('Isi kedua ambang dengan angka rupiah.')
    if (penawaran < langsung) return setError('Ambang penawaran harus lebih besar dari ambang pembelian langsung.')
    if (form.dasar.trim().length < 5 || !form.sejak) return setError('Lengkapi dasar hukum dan tanggal berlaku.')
    setBusy(true)
    setError('')
    const r = await createRegionRule({ ambangPembelianLangsung: langsung, ambangPenawaran: penawaran, dasarHukum: form.dasar.trim(), berlakuSejak: form.sejak })
    setBusy(false)
    if (!r.ok) return setError(r.error)
    setForm({ langsung: '', penawaran: '', dasar: '', sejak: '' })
    setTick((t) => t + 1)
  }

  return (
    <Panel title="Ambang pengadaan" desc="Batas nilai pembelian langsung dan penawaran untuk desa di wilayah Anda.">
      {!res ? (
        <p className="text-[1.4rem] text-dim" role="status">Memuat aturan…</p>
      ) : !res.ok ? (
        <FormAlert>{res.error}</FormAlert>
      ) : res.data.length ? (
        <RowList>
          {res.data.map((x) => (
            <li key={x.id}>
              <div>
                <strong>{x.regionNama}</strong>
                <small>
                  Langsung sampai {formatRp(x.ambangPembelianLangsung)} · penawaran sampai {formatRp(x.ambangPenawaran)}
                </small>
                <small>
                  {x.dasarHukum} · berlaku {fmtDate(x.berlakuSejak)}
                </small>
              </div>
            </li>
          ))}
        </RowList>
      ) : (
        <Empty title="Belum ada aturan wilayah." />
      )}
      <form className="grid gap-12 md:grid-cols-2" noValidate onSubmit={(e) => { e.preventDefault(); save() }}>
        <FormField label="Ambang pembelian langsung (Rp)">
          <input inputMode="numeric" value={form.langsung} onChange={(e) => setForm({ ...form, langsung: e.target.value.replace(/\D/g, '') })} />
        </FormField>
        <FormField label="Ambang penawaran (Rp)">
          <input inputMode="numeric" value={form.penawaran} onChange={(e) => setForm({ ...form, penawaran: e.target.value.replace(/\D/g, '') })} />
        </FormField>
        <FormField label="Dasar hukum">
          <input value={form.dasar} onChange={(e) => setForm({ ...form, dasar: e.target.value })} placeholder="Contoh: Perbup Nomor 12 Tahun 2026" />
        </FormField>
        <FormField label="Berlaku sejak">
          <input type="date" value={form.sejak} onChange={(e) => setForm({ ...form, sejak: e.target.value })} />
        </FormField>
        {error && <div className="md:col-span-2"><FormAlert>{error}</FormAlert></div>}
        <div>
          <Btn type="submit" disabled={busy}>{busy ? 'Menyimpan…' : 'Tetapkan aturan baru'}</Btn>
        </div>
      </form>
    </Panel>
  )
}
