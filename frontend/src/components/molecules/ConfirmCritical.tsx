interface Props {
  count: number
  checked: boolean
  onChange: (checked: boolean) => void
}

/* The person has read the open critical findings and still wants to send; the server decides whether that is allowed and records it. */
export default function ConfirmCritical({ count, checked, onChange }: Props) {
  return (
    <label className="items-start cursor-pointer flex text-[1.45rem] gap-10 leading-[1.45] [&_input]:[accent-color:var(--color-blue)] [&_input]:flex-none [&_input]:h-18 [&_input]:mt-2 [&_input]:w-18 bg-soft rounded-[1.2rem] py-12 px-14">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>Saya sudah membaca {count} temuan kritis dan tetap ingin mengirim. Konfirmasi ini dicatat di jejak audit.</span>
    </label>
  )
}
