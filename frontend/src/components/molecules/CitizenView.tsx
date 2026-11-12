import Icon from '@/components/atoms/Icon'
import Panel from '@/components/molecules/Panel'
import { pubFieldLabels, pubFields } from '@/data/db'
import type { PubField } from '@/interfaces/db'
import { cn } from '@/lib/utils'

interface Props {
  shown: PubField[]
}

/* Which parts of the contract citizens can see, and which are hidden */
export default function CitizenView({ shown }: Props) {
  return (
    <Panel title="Yang dilihat warga">
      <ul className="grid gap-6 list-none list-outside [&_li]:items-center [&_li]:flex [&_li]:text-[1.4rem] [&_li]:gap-10 [&_li]:text-dim [&_li_small]:text-[1.2rem] [&_li_small]:ml-auto [&_li_small]:text-dim d-checks">
        {pubFields.map((f) => {
          const on = shown.includes(f)
          return (
            <li key={f} className={cn(on && 'text-blue!')}>
              <Icon name={on ? 'eye' : 'lock'} />
              {pubFieldLabels[f]}
              <small>{on ? 'Tampil' : 'Disembunyikan'}</small>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
