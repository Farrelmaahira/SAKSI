import Tabs from '@/components/molecules/Tabs'
import ContractHeader from '@/components/organisms/ContractHeader'
import { useContractTabs } from '@/hooks/use-contract-tabs'
import type { Session } from '@/interfaces/auth'
import type { DContract } from '@/interfaces/db'

interface Props {
  c: DContract
  session: Session
}

/* A found contract: its header, the tab strip and the tab picked in the address */
export default function ContractView({ c, session }: Props) {
  const { tab, items, go, Active } = useContractTabs(c, session)
  return (
    <>
      <ContractHeader c={c} session={session} tab={tab} go={go} />
      <Tabs items={items} value={tab} onChange={go} />
      <div className="[animation:pop_0.3s_ease-out] grid gap-20" role="tabpanel">
        <Active c={c} session={session} go={go} />
      </div>
    </>
  )
}
