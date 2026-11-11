interface Props {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

/* On/off switch with a text label, built on a real checkbox */
export default function ToggleSwitch({ label, checked, onChange }: Props) {
  return (
    <label className="items-center cursor-pointer flex text-[1.6rem] gap-12 relative w-fit">
      <input className="peer h-[1px] opacity-[0] pointer-events-none absolute w-[1px]" type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span
        className="bg-[#c9c9c4] rounded-[3rem] flex-none h-26 relative [transition:background_0.3s] w-46 after:bg-white after:rounded-[50%] after:content-[''] after:h-20 after:left-3 after:absolute after:top-3 after:[transition:transform_0.3s_var(--ease-saksi)] after:w-20 peer-checked:bg-blue peer-checked:after:[transform:translateX(2rem)] peer-focus-visible:[outline:0.2rem_solid_var(--color-ink)] peer-focus-visible:[outline-offset:0.2rem]"
        aria-hidden="true"
      />
      {label}
    </label>
  )
}
