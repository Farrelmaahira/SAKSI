import Btn from '@/components/atoms/Btn'
import FormField from '@/components/molecules/FormField'
import type { FindingDraft } from '@/lib/lhp/new-finding'

interface Props {
  index: number
  finding: FindingDraft
  onChange: (patch: Partial<FindingDraft>) => void
  /* undefined when it is the only finding */
  onRemove?: () => void
}

/* The fields of one finding: what it concerns, how serious, the finding itself and the recommendation */
export default function FindingFields({ index, finding: f, onChange, onRemove }: Props) {
  return (
    <fieldset className="border-[0.15rem] border-[#ececea] border-solid rounded-[1.6rem] grid gap-12 p-16 md:grid-cols-2">
      <legend className="text-[1.25rem] tracking-[0.04em] text-dim uppercase px-6">Temuan {index + 1}</legend>
      <FormField label="Objek">
        <select value={f.objek} onChange={(e) => onChange({ objek: e.target.value as FindingDraft['objek'] })}>
          <option value="spk">SPK</option>
          <option value="termin">Termin</option>
          <option value="pasal">Pasal</option>
        </select>
      </FormField>
      <FormField label="Tingkat">
        <select value={f.tingkat} onChange={(e) => onChange({ tingkat: e.target.value as FindingDraft['tingkat'] })}>
          <option value="saran">Saran</option>
          <option value="kritis">Kritis</option>
        </select>
      </FormField>
      <FormField label="Temuan" className="md:col-span-2">
        <textarea rows={2} value={f.temuan} onChange={(e) => onChange({ temuan: e.target.value })} />
      </FormField>
      <FormField label="Rekomendasi" className="md:col-span-2">
        <textarea rows={2} value={f.rekomendasi} onChange={(e) => onChange({ rekomendasi: e.target.value })} />
      </FormField>
      {onRemove && <Btn small variant="ghost" onClick={onRemove}>Hapus temuan</Btn>}
    </fieldset>
  )
}
