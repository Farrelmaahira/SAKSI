import type { Todo } from '@/interfaces/dash'
import Empty from '@/components/molecules/Empty'
import Link from 'next/link'
import Icon from '@/components/atoms/Icon'

interface Props { items: Todo[]; empty: string }

export default function TodoList({ items, empty }: Props) {
  if (!items.length) return <Empty art="all-checked_d3u6" title={empty} />
  return (
    <ul className="grid gap-6 list-none list-outside [&_a]:items-center [&_a]:border-[0.15rem] [&_a]:border-[#ececea] [&_a]:border-solid [&_a]:rounded-[1.4rem] [&_a]:grid [&_a]:gap-12 [&_a]:grid-cols-[auto_minmax(0,1fr)_auto] [&_a]:py-11 [&_a]:px-14 [&_a]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_a:hover]:border-ink [&_a:hover]:[box-shadow:0.3rem_0.3rem_0_var(--color-ink)] max-md:[&_a]:grid-cols-[auto_minmax(0,1fr)] d-todo">
      {items.map((t) => (
        <li key={t.key}>
          <Link href={`/dashboard/kontrak/${t.c.code}?tab=${t.tab}`} className={`tone-${t.tone}`}>
            <span className="items-center bg-blue rounded-[50%] text-white flex h-34 justify-center w-34 [.tone-red_&]:bg-red [.tone-red_&]:text-white [.tone-ink_&]:bg-ink! [.tone-ink_&]:text-white!" aria-hidden="true">
              <Icon name={t.tone === 'red' ? 'alert' : 'arrow'} />
            </span>
            <span className="grid gap-2 min-w-0 [&_strong]:text-[1.45rem] [&_strong]:font-[420] [&_small]:text-[1.25rem]! [&_small]:text-dim [&_small]:overflow-hidden [&_small]:text-ellipsis [&_small]:whitespace-nowrap [.d-todo_a.is-new_&_strong]:font-[500]">
              <strong>{t.text}</strong>
              <small>
                <code>{t.c.code}</code> · {t.c.title}
              </small>
            </span>
            {t.when && <span className="text-[1.25rem] text-dim overflow-hidden text-ellipsis whitespace-nowrap max-md:[grid-column:2] max-md:-mt-8">{t.when}</span>}
          </Link>
        </li>
      ))}
    </ul>
  )
}
