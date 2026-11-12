import Icon from '@/components/atoms/Icon'
import { cn } from '@/lib/utils'

interface Item {
  icon: string
  label: string
  on: boolean
}

/* Yes/no checks, the ones that are met in blue */
export default function CheckList({ items }: { items: Item[] }) {
  return (
    <ul className="grid gap-6 list-none list-outside [&_li]:items-center [&_li]:flex [&_li]:text-[1.4rem] [&_li]:gap-10 [&_li]:text-dim [&_li_small]:text-[1.2rem] [&_li_small]:ml-auto [&_li_small]:text-dim">
      {items.map((i) => (
        <li key={i.label} className={cn(i.on && 'text-blue!')}>
          <Icon name={i.icon} /> {i.label}
        </li>
      ))}
    </ul>
  )
}
