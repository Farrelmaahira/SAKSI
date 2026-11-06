'use client'

import type { TabProps } from '@/interfaces/dash'
import { auditStore } from '@/lib/audit/audit-store'
import { nextStep } from '@/lib/db/next-step'
import { counterpartyById } from '@/lib/master/counterparty-by-id'
import { villageById } from '@/lib/master/village-by-id'
import { latestVersion } from '@/lib/db/latest-version'
import { statusLabels, statusOrder } from '@/data/db'
import { isLate } from '@/lib/db/is-late'
import Icon from '@/components/atoms/Icon'
import { whoLabel } from '@/data/dash'
import Btn from '@/components/atoms/Btn'
import Panel from '@/components/molecules/Panel'
import { fmtDate } from '@/lib/dates/fmt-date'
import { templates } from '@/data/drafting'
import { villageHeads } from '@/data/master'
import { formatRp } from '@/lib/contracts/format-rp'
import { valueOf } from '@/lib/db/value-of'
import { deadlineOf } from '@/lib/db/deadline-of'
import { daysUntil } from '@/lib/dates/days-until'
import { isActive } from '@/lib/db/is-active'
import { progressOf } from '@/lib/db/progress-of'
import Bar from '@/components/atoms/Bar'
import { paidOf } from '@/lib/db/paid-of'
import Activity from '@/components/molecules/Activity'

export default function RingkasanTab({ c, session, go }: TabProps) {
  const logs = auditStore.use()
  const step = nextStep(c)
  const mine = step?.who === session.role.role
  const cp = counterpartyById(c.counterpartyId)
  const v = villageById(c.villageId)
  const ver = latestVersion(c)
  const at = statusOrder.indexOf(c.status)
  const late = isLate(c)

  return (
    <div className="d-stack">
      {step ? (
        <div className={`d-next ${mine ? 'is-mine' : ''}`}>
          <Icon name={mine ? 'arrow' : 'clock'} />
          <div>
            <p className="d-next-label">{mine ? 'Langkah berikutnya untuk Anda' : `Menunggu ${whoLabel[step.who].toLowerCase()}`}</p>
            <strong>{step.text}</strong>
          </div>
          <Btn variant={mine ? 'light' : 'ghost'} onClick={() => go(step.tab)}>
            {mine ? 'Kerjakan' : 'Lihat'}
          </Btn>
        </div>
      ) : (
        <div className="d-next is-done">
          <Icon name="check" />
          <div>
            <p className="d-next-label">Kontrak selesai</p>
            <strong>Semua tahap sudah dilalui. Dokumen tetap bisa diperiksa warga.</strong>
          </div>
        </div>
      )}

      <Panel title="Tahapan kontrak">
        <ol className="d-lifecycle">
          {statusOrder.map((s, i) => {
            const h = [...c.history].reverse().find((x) => x.status === s)
            return (
              <li key={s} className={i < at ? 'is-done' : i === at ? 'is-on' : ''}>
                <span>{i < at || (i === at && s === 'selesai') ? <Icon name="check" /> : i + 1}</span>
                <strong>{statusLabels[s]}</strong>
                <small>{h ? fmtDate(h.at) : '-'}</small>
              </li>
            )
          })}
        </ol>
      </Panel>

      <div className="d-grid-2">
        <Panel title="Data kontrak">
          <dl className="d-summary">
            <div>
              <dt>Jenis</dt>
              <dd>{templates[c.template].label}</dd>
            </div>
            <div>
              <dt>Pihak pertama</dt>
              <dd>
                Pemerintah {v?.name}, Kepala Desa {villageHeads[c.villageId]}
              </dd>
            </div>
            <div>
              <dt>Pihak kedua</dt>
              <dd>
                {cp?.name} · {cp?.contact}
              </dd>
            </div>
            <div>
              <dt>Nilai</dt>
              <dd>
                {formatRp(valueOf(c))}
                {c.template === 'sewa' && ' per tahun'}
              </dd>
            </div>
            <div>
              <dt>Metode</dt>
              <dd>{ver.answers.method}</dd>
            </div>
            <div>
              <dt>Tenggat</dt>
              <dd className={late ? 'is-red' : ''}>
                {fmtDate(deadlineOf(c))}
                {late ? ` · terlambat ${-daysUntil(deadlineOf(c))} hari` : isActive(c) ? ` · ${daysUntil(deadlineOf(c))} hari lagi` : ''}
              </dd>
            </div>
            <div>
              <dt>Versi</dt>
              <dd>
                Versi {ver.no} · skor audit {ver.audit.score}
              </dd>
            </div>
          </dl>
        </Panel>
        <Panel title="Pelaksanaan">
          <div className="d-big-progress">
            <div>
              <span>Progres pekerjaan</span>
              <strong>{progressOf(c)}%</strong>
            </div>
            <Bar value={progressOf(c)} tone={late ? 'red' : 'blue'} />
          </div>
          <div className="d-big-progress">
            <div>
              <span>Sudah dibayar</span>
              <strong>
                {formatRp(paidOf(c))} <small>dari {formatRp(valueOf(c))}</small>
              </strong>
            </div>
            <Bar value={(paidOf(c) / Math.max(1, valueOf(c))) * 100} />
          </div>
          <ul className="d-checks">
            <li className={c.signatures.desa && c.signatures.pihak && c.signatures.meterai ? 'is-ok' : ''}>
              <Icon name="sign" /> Tanda tangan lengkap
            </li>
            <li className={c.seals.length ? 'is-ok' : ''}>
              <Icon name="shield" /> Disegel SHA-256
            </li>
            <li className={c.publication ? 'is-ok' : ''}>
              <Icon name="globe" /> Tampil di portal warga
            </li>
            <li className={c.spk ? 'is-ok' : ''}>
              <Icon name="doc" /> SPK terbit
            </li>
          </ul>
        </Panel>
      </div>
      <Panel title="Aktivitas terakhir" action={<button className="d-link" type="button" onClick={() => go('riwayat')}>Riwayat lengkap</button>}>
        <Activity logs={logs.filter((l) => l.contractCode === c.code).slice(0, 5)} />
      </Panel>
    </div>
  )
}
