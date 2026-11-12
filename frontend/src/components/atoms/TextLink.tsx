import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  href: string
  children: ReactNode
  className?: string
}

/* Small underlined link for a panel header, e.g. "Lihat semua kontrak" */
export default function TextLink({ href, children, className }: Props) {
  return (
    <Link href={href} className={cn("border-b-[0.1rem] border-b-current [border-bottom-style:solid] text-blue text-[1.3rem] whitespace-nowrap [&:hover]:text-ink", className)}>
      {children}
    </Link>
  )
}
