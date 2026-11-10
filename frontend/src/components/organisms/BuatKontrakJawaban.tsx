import StepTitle from '@/components/atoms/StepTitle'
import FormField from '@/components/molecules/FormField'
import Hint from '@/components/atoms/Hint'
import Segmented from '@/components/molecules/Segmented'
import type { Answers, TemplateKey, TemplateInfo } from '@/interfaces/drafting'
import { methods } from '@/data/drafting'
import { regionRules } from '@/data/master'
import { daysFromNow } from '@/lib/dates/days-from-now'
import { formatRp } from '@/lib/contracts/format-rp'

interface Props {
  info: TemplateInfo
  template: TemplateKey
  answers: Answers
  valueText: string
  errors: Record<string, string>
  regionId: string
  onChange: (patch: Partial<Answers>) => void
  onValue: (raw: string) => void
}

/* Wizard step 3: the few questions the draft is written from */
export default function BuatKontrakJawaban({ info, template, answers, valueText, errors, regionId, onChange, onValue }: Props) {
  const rule = regionRules[regionId]
  return (
    <div>
      <StepTitle>Beberapa pertanyaan</StepTitle>
      <div className="grid gap-16 md:grid-cols-[repeat(2,minmax(0,1fr))]">
        <FormField label={info.workLabel} error={errors.work} className="md:[grid-column:span_2]">
          <textarea rows={2} value={answers.work} onChange={(e) => onChange({ work: e.target.value })} placeholder={info.workPlaceholder} />
        </FormField>
        <FormField label={`Nilai kontrak${template === 'sewa' ? ' per tahun' : ''}`} error={errors.value}>
          <div className="items-center flex relative [&_b]:text-[1.4rem] [&_b]:font-[400] [&_b]:left-14 [&_b]:text-dim [&_b]:absolute [&_input]:pl-42!">
            <b>Rp</b>
            <input inputMode="numeric" value={valueText} onChange={(e) => onValue(e.target.value)} placeholder="0" />
          </div>
        </FormField>
        <FormField label="Tenggat selesai" error={errors.deadline}>
          <input type="date" value={answers.deadline} min={daysFromNow(1)} onChange={(e) => onChange({ deadline: e.target.value })} />
        </FormField>
        <FormField group label="Cara pembayaran">
          <Segmented options={['Sekaligus', 'Termin'] as const} value={answers.scheme} onChange={(scheme) => onChange({ scheme })} />
        </FormField>
        {answers.scheme === 'Termin' && (
          <FormField label="Jumlah termin" error={errors.terms}>
            <input type="number" min={2} max={6} value={answers.terms} onChange={(e) => onChange({ terms: Number(e.target.value) })} />
          </FormField>
        )}
        {template === 'pengadaan' && (
          <FormField label="Metode pengadaan">
            <select value={answers.method} onChange={(e) => onChange({ method: e.target.value })}>
              {methods.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
            {rule && <Hint as="small">Batas pengadaan langsung di wilayah ini {formatRp(rule.directMax)}.</Hint>}
          </FormField>
        )}
      </div>
    </div>
  )
}
