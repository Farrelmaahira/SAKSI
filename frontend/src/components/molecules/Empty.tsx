import type { ReactNode } from 'react'
import Illustration from '@/components/atoms/Illustration'
import type { IllustrationName } from '@/data/illustrations'

interface Props {
  art?: IllustrationName
  title: string
  text?: string
  action?: ReactNode
}

export default function Empty({ art = 'all-checked_d3u6', title, text, action }: Props) {
  return (
    <div className="d-empty">
      <Illustration name={art} />
      <div>
        <p className="d-empty-title">{title}</p>
        {text && <p>{text}</p>}
        {action}
      </div>
    </div>
  )
}
