import { ReactNode } from 'react'

interface Props { tone?: 'muted' | 'outline' | 'tint' | 'blue' | 'ink' | 'red' | 'done'; children: ReactNode }

export default function Badge({ tone = 'muted', children }: Props) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}
