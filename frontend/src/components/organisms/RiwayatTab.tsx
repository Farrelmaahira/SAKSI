import type { TabProps } from '@/interfaces/dash'
import { auditStore } from '@/lib/audit/audit-store'
import Panel from '@/components/molecules/Panel'
import StatusBadge from '@/components/atoms/StatusBadge'
import { fmtDateTime } from '@/lib/dates/fmt-date-time'
import Activity from '@/components/molecules/Activity'

export default function RiwayatTab({ c }: TabProps) {
  const logs = auditStore.use()
  return (
    <div className="d-grid-2">
      <Panel title="Perubahan status">
        <ol className="d-timeline is-status">
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
        <Activity logs={logs.filter((l) => l.contractCode === c.code)} />
      </Panel>
    </div>
  )
}
