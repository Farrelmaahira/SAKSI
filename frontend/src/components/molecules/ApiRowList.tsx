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
  badge: string
}

interface Props<T> {
  /* null while the request is still running */
  result: ApiResult<T[]> | null
  loading: string
  empty: string
  toRow: (item: T) => Row
}

/* Rows from an API list: a loading line, the error, an empty state, or one row per item */
export default function ApiRowList<T>({ result, loading, empty, toRow }: Props<T>) {
  if (!result) return <p className="text-[1.4rem] text-dim" role="status">{loading}</p>
  if (!result.ok) return <FormAlert>{result.error}</FormAlert>
  if (!result.data.length) return <Empty title={empty} />
  return (
    <RowList>
      {result.data.map((item) => {
        const { key, title, sub, badge } = toRow(item)
        return (
          <li key={key}>
            <div>
              <strong>{title}</strong>
              <small>{sub}</small>
            </div>
            <Badge tone="tint">{badge}</Badge>
          </li>
        )
      })}
    </RowList>
  )
}
