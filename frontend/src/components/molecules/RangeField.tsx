interface Props {
  label: string
  value: number
  onChange: (value: number) => void
}

/* A labelled slider from 0 to 100 in steps of 5 */
export default function RangeField({ label, value, onChange }: Props) {
  return (
    <label className="grid gap-6 min-w-0 [&>span]:text-[1.25rem] [&>span]:tracking-[0.04em] [&>span]:text-dim [&>span]:uppercase">
      <span>{label}</span>
      <input className="[accent-color:var(--color-blue)] w-full" type="range" min={0} max={100} step={5} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  )
}
