import Link from 'next/link'
import type { ReactNode } from 'react'

interface Props {
  href: string
  children: ReactNode
}

/* Small underlined link for a panel header, e.g. "Lihat semua kontrak" */
export default function TextLink({ href, children }: Props) {
  return (
    <Link href={href} className="border-b-[0.1rem] border-b-current [border-bottom-style:solid] text-blue text-[1.3rem] whitespace-nowrap [&:hover]:text-ink">
      {children}
    </Link>
  )
}
