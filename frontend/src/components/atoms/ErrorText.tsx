import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  as?: 'em' | 'p'
  role?: 'alert'
}

/* Red message of a field (em, inside its label) or of a whole form step (p) */
export default function ErrorText({ children, as: Tag = 'em', role }: Props) {
  return (
    <Tag role={role} className="text-red text-[1.35rem] not-italic">
      {children}
    </Tag>
  )
}
