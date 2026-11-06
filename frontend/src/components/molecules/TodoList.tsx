import type { Todo } from '@/interfaces/dash'
import Empty from '@/components/molecules/Empty'
import Link from 'next/link'
import Icon from '@/components/atoms/Icon'

interface Props { items: Todo[]; empty: string }

export default function TodoList({ items, empty }: Props) {
  if (!items.length) return <Empty art="all-checked_d3u6" title={empty} />
  return (
    <ul className="d-todo">
      {items.map((t) => (
        <li key={t.key}>
          <Link href={`/dashboard/kontrak/${t.c.code}?tab=${t.tab}`} className={`tone-${t.tone}`}>
            <span className="d-todo-mark" aria-hidden="true">
              <Icon name={t.tone === 'red' ? 'alert' : 'arrow'} />
            </span>
            <span className="d-todo-body">
              <strong>{t.text}</strong>
              <small>
                <code>{t.c.code}</code> · {t.c.title}
              </small>
            </span>
            {t.when && <span className="d-todo-when">{t.when}</span>}
          </Link>
        </li>
      ))}
    </ul>
  )
}
