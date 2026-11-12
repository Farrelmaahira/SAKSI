interface Props {
  label: string
  value: string
  onChange: (value: string) => void
  min?: string
  max?: string
}

/* A date field in a rounded pill, with its label in front */
export default function DateFilter({ label, value, onChange, min, max }: Props) {
  return (
    <label className="items-center bg-white border-[0.15rem] border-[#dcdcd8] border-solid rounded-[3rem] flex flex-[0_1_20rem] gap-8 max-w-240 min-h-42 py-0 px-14 [transition:border-color_0.2s,_box-shadow_0.2s] focus-within:border-blue focus-within:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_input]:[background:none] [&_input]:border-0 [&_input]:border-none [&_input]:flex-1 [&_input]:text-[1.4rem] [&_input]:min-w-0 [&_input]:[outline:0]">
      <span className="text-[1.2rem] text-dim">{label}</span>
      <input type="date" value={value} min={min} max={max} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}
