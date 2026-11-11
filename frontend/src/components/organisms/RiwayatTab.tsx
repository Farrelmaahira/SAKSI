import type { TabProps } from '@/interfaces/dash'
import Panel from '@/components/molecules/Panel'
import StatusBadge from '@/components/atoms/StatusBadge'
import { fmtDateTime } from '@/lib/dates/fmt-date-time'
import Activity from '@/components/molecules/Activity'
import ActivityFeed from '@/components/molecules/ActivityFeed'

export default function RiwayatTab({ c }: TabProps) {
  return (
    <div className="items-stretch grid gap-20 lg:grid-cols-[repeat(2,minmax(0,1fr))] [&>*]:min-w-0">
      <Panel title="Perubahan status">
        <ol className="is-status grid gap-12 list-none list-outside [&_li]:[align-items:start] [&_li]:grid [&_li]:gap-14 [&_li]:grid-cols-[6.4rem_minmax(0,1fr)] [&.is-status]:gap-x-14 [&.is-status]:grid-cols-[max-content_minmax(0,1fr)] [&.is-status_li]:[grid-column:1_/_-1] [&.is-status_li]:grid-cols-[subgrid] [&_li>strong]:text-blue [&_li>strong]:text-[2rem] [&_li>strong]:font-[350] [&_p]:text-[1.45rem] [&_p]:leading-[1.45] [&_small]:text-[1.25rem]! [&_small]:text-dim d-timeline">
          {[...c.history].reverse().map((h, i) => (
            <li key={i}>
              <StatusBadge status={h.status} />
              <div>
                <p>{h.by}</p>
                <small>{fmtDateTime(h.at)}</small>
              </div>
            </li>
          ))}
        </ol>
      </Panel>
      <Panel title="Jejak audit kontrak">
        {c.apiId ? <ActivityFeed limit={50} contractId={c.apiId} /> : <Activity logs={[]} empty="Kontrak contoh ini hanya ada di perangkat ini, jadi belum punya jejak di server." />}
      </Panel>
    </div>
  )
}
