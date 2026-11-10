import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  id?: string
}

/* Heading of one wizard step */
export default function StepTitle({ children, id }: Props) {
  return (
    <h2 id={id} className="text-[2.6rem] font-[340] tracking-[-0.025em] mb-6">
      {children}
    </h2>
  )
}
