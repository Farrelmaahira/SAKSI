import FormField from '@/components/molecules/FormField'
import type { Version } from '@/interfaces/db'

interface Props {
  versions: Version[]
  value: number
  latestNo: number
  onChange: (no: number) => void
}

/* Dropdown to read an older version of a contract; each option says who wrote it (AI or manual) */
export default function VersionSelect({ versions, value, latestNo, onChange }: Props) {
  return (
    <FormField label="Pilih versi" hideLabel>
      <select value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {versions.map((v) => (
          <option key={v.no} value={v.no}>
            Versi {v.no}
            {v.source ? ` · ${v.source === 'ai' ? 'AI' : 'Manual'}` : ''}
            {v.no === latestNo ? ' (terbaru)' : ''}
          </option>
        ))}
      </select>
    </FormField>
  )
}
