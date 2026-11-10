import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  children: ReactNode
  as?: 'p' | 'small'
  className?: string
}

/* Muted explanation under a heading or field */
export default function Hint({ children, as: Tag = 'p', className }: Props) {
  return <Tag className={cn('text-[1.4rem] leading-[1.5] text-dim', className)}>{children}</Tag>
}
