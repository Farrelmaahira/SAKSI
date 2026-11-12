import type { ReactNode } from 'react'

interface Props {
  label: string
  children: ReactNode
}

/* Table cell for a money or count value: right-aligned on desktop, plain on phones */
export default function NumCell({ label, children }: Props) {
  return (
    <td className="tabular-nums text-right whitespace-nowrap max-md:text-left max-md:whitespace-normal" data-label={label}>
      {children}
    </td>
  )
}
