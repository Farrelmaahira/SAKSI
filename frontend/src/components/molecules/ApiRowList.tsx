import type { ReactNode } from 'react'
import Badge from '@/components/atoms/Badge'
import Empty from '@/components/molecules/Empty'
import FormAlert from '@/components/atoms/FormAlert'
import RowList from '@/components/molecules/RowList'
import type { ApiResult } from '@/interfaces/api'

interface Row {
  key: string | number
  title: ReactNode
  sub: ReactNode
  /* a second small line */
  sub2?: ReactNode
  badge?: string
  /* Badge tone; plain tint by default */
  badgeTone?: string
}

interface Props<T> {
  /* null while the request is still running */
  result: ApiResult<T[]> | null
  loading: string
  empty: string
  emptyText?: string
  toRow: (item: T) => Row
}

/* Rows from an API list: a loading line, the error, an empty state, or one row per item */
export default function ApiRowList<T>({ result, loading, empty, emptyText, toRow }: Props<T>) {
  if (!result) return <p className="text-[1.4rem] text-dim" role="status">{loading}</p>
  if (!result.ok) return <FormAlert>{result.error}</FormAlert>
  if (!result.data.length) return <Empty title={empty} text={emptyText} />
  return (
    <RowList>
      {result.data.map((item) => {
        const { key, title, sub, sub2, badge, badgeTone } = toRow(item)
        return (
          <li key={key}>
            <div>
              {typeof title === 'string' ? <strong>{title}</strong> : title}
              <small>{sub}</small>
              {sub2 && <small>{sub2}</small>}
            </div>
            {badge && <Badge tone={badgeTone ?? "tint"}>{badge}</Badge>}
          </li>
        )
      })}
    </RowList>
  )
}
