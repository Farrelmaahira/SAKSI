import Btn from '@/components/atoms/Btn'
import FormAlert from '@/components/atoms/FormAlert'
import FormField from '@/components/molecules/FormField'
import type { useRegionRules } from '@/hooks/use-region-rules'

interface Props {
  rules: ReturnType<typeof useRegionRules>
}

const digits = (v: string) => v.replace(/\D/g, '')

/* Form for a new procurement threshold rule */
export default function RegionRuleForm({ rules: r }: Props) {
  return (
    <form className="grid gap-12 md:grid-cols-2" noValidate onSubmit={(e) => { e.preventDefault(); r.save() }}>
      <FormField label="Ambang pembelian langsung (Rp)">
        <input inputMode="numeric" value={r.form.langsung} onChange={(e) => r.set({ langsung: digits(e.target.value) })} />
      </FormField>
      <FormField label="Ambang penawaran (Rp)">
        <input inputMode="numeric" value={r.form.penawaran} onChange={(e) => r.set({ penawaran: digits(e.target.value) })} />
      </FormField>
      <FormField label="Dasar hukum">
        <input value={r.form.dasar} onChange={(e) => r.set({ dasar: e.target.value })} placeholder="Contoh: Perbup Nomor 12 Tahun 2026" />
      </FormField>
      <FormField label="Berlaku sejak">
        <input type="date" value={r.form.sejak} onChange={(e) => r.set({ sejak: e.target.value })} />
      </FormField>
      {r.error && <div className="md:col-span-2"><FormAlert>{r.error}</FormAlert></div>}
      <div>
        <Btn type="submit" disabled={r.busy}>{r.busy ? 'Menyimpan…' : 'Tetapkan aturan baru'}</Btn>
      </div>
    </form>
  )
}
