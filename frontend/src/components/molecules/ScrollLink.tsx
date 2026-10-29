import Arrow from '@/components/atoms/Arrow'

interface Props {
  href: string
  children: string
}

export default function ScrollLink({ href, children }: Props) {
  return (
    <a className="scroll-link" href={href}>
      <span className="round-icon">
        <Arrow dir="down" />
      </span>
      {children}
    </a>
  )
}
