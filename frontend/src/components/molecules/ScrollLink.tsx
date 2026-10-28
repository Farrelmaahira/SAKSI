import Arrow from '@/components/atoms/Arrow'

export interface ScrollLinkProps {
  href: string
  children: string
}

export default function ScrollLink({ href, children }: ScrollLinkProps) {
  return (
    <a className="scroll-link" href={href}>
      <span className="round-icon">
        <Arrow dir="down" />
      </span>
      {children}
    </a>
  )
}
