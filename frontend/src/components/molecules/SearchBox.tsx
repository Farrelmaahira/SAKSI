import Icon from '@/components/atoms/Icon'

interface Props {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
}

/* Rounded search field with a magnifier; the label is for screen readers only */
export default function SearchBox({ label, placeholder, value, onChange }: Props) {
  return (
    <label className="items-center bg-white border-[0.15rem] border-[#dcdcd8] border-solid rounded-[3rem] flex flex-[1_1_26rem] gap-8 max-w-400 min-h-42 py-0 px-14 [transition:border-color_0.2s,_box-shadow_0.2s] focus-within:border-blue focus-within:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_input]:[background:none] [&_input]:border-0 [&_input]:border-none [&_input]:flex-1 [&_input]:text-[1.4rem] [&_input]:min-w-0 [&_input]:[outline:0]">
      <Icon name="search" />
      <span className="sr-only">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  )
}
