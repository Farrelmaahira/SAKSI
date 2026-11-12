import Link from 'next/link'
import Badge from '@/components/atoms/Badge'
import Btn from '@/components/atoms/Btn'
import Icon from '@/components/atoms/Icon'
import StatusBadge from '@/components/atoms/StatusBadge'
import CancelContractButton from '@/components/organisms/CancelContractButton'
import { templates } from '@/data/drafting'
import type { Session } from '@/interfaces/auth'
import type { DContract } from '@/interfaces/db'
import { formatRp } from '@/lib/contracts/format-rp'
import { isPublic } from '@/lib/db/is-public'
import { nextStep } from '@/lib/db/next-step'
import { valueOf } from '@/lib/db/value-of'
import { counterpartyById } from '@/lib/master/counterparty-by-id'
import { villageById } from '@/lib/master/village-by-id'

interface Props {
  c: DContract
  session: Session
  tab: string
  go: (tab: string) => void
}

/* Back link, title block (code, type, village, status, party, value) and the actions of a contract page */
export default function ContractHeader({ c, session, tab, go }: Props) {
  const step = nextStep(c)
  const role = session.role.role
  return (
    <>
      <nav className="[&_a]:items-center [&_a]:inline-flex [&_a]:text-[1.3rem] [&_a]:gap-8 [&_a]:tracking-[0.04em] [&_a]:text-dim [&_a]:pt-10 [&_a]:uppercase [&_a:hover]:text-blue">
        <Link href="/dashboard/kontrak">
          <Icon name="arrow" className="flip" />
          Kontrak
        </Link>
      </nav>
      <header className="items-center flex flex-wrap gap-y-16 gap-x-24 justify-between px-0 pb-4 pt-0">
        <div>
          <p className="text-[1.25rem] tracking-[0.06em] text-dim uppercase [&_code]:font-code [&_code]:tracking-[0]">
            <code>{c.code}</code> · {templates[c.template].label} · {villageById(c.villageId)?.name}
          </p>
          <h1 className="text-[3.6rem] font-[320] tracking-[-0.035em] leading-[1.05] mt-6 max-w-800 md:text-[4.4rem]">{c.title}</h1>
          <div className="items-center flex flex-wrap text-[1.4rem] gap-y-6 gap-x-16 mt-14">
            <StatusBadge status={c.status} />
            {!c.apiId && <Badge tone="muted">Contoh lokal</Badge>}
            <span>{counterpartyById(c.counterpartyId)?.name}</span>
            <span>{formatRp(valueOf(c))}</span>
            {(role === 'bpd' || role === 'inspektorat') && (
              <span className="items-center inline-flex gap-6 text-dim">
                <Icon name="eye" /> Hanya baca
              </span>
            )}
          </div>
        </div>
        <div className="items-center flex flex-wrap gap-10">
          {isPublic(c) && <Btn variant="ghost" icon="globe" to={`/lacak?q=${c.code}`}>Lihat di portal</Btn>}
          {step && step.who === role && tab !== step.tab && <Btn icon="arrow" onClick={() => go(step.tab)}>{step.text}</Btn>}
          <CancelContractButton c={c} session={session} />
        </div>
      </header>
    </>
  )
}
