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
    <div className="grid gap-20 [&>*]:min-w-0">
      {step ? (
        <div className={`items-center bg-white rounded-[2rem] grid gap-14 grid-cols-[auto_minmax(0,1fr)] p-20 [&.is-mine]:bg-blue [&.is-mine]:[box-shadow:0.6rem_0.6rem_0_var(--color-ink)] [&.is-mine]:text-white [&.is-done]:bg-green! [&.is-done]:text-white! [&_strong]:text-[1.9rem] [&_strong]:font-[400] [&_strong]:leading-[1.3] md:grid-cols-[auto_minmax(0,1fr)_auto] md:py-20 md:px-24 d-next ${mine ? 'is-mine' : ''}`}>
          <Icon name={mine ? 'arrow' : 'clock'} />
          <div>
            <p className="font-hand text-[2.2rem] leading-[1] mb-4">{mine ? 'Langkah berikutnya untuk Anda' : `Menunggu ${whoLabel[step.who].toLowerCase()}`}</p>
            <strong>{step.text}</strong>
          </div>
          <Btn variant={mine ? 'light' : 'ghost'} onClick={() => go(step.tab)}>
            {mine ? 'Kerjakan' : 'Lihat'}
          </Btn>
        </div>
      ) : (
        <div className="[.auth-steps_li&]:border-blue [.auth-steps_li&]:opacity-[1] [.form-steps_li&]:opacity-[1] [.form-steps_li&>span]:bg-blue [.form-steps_li&>span]:border-blue [.form-steps_li&>span]:text-white items-center bg-white rounded-[2rem] grid gap-14 grid-cols-[auto_minmax(0,1fr)] p-20 [&.is-mine]:bg-blue [&.is-mine]:[box-shadow:0.6rem_0.6rem_0_var(--color-ink)] [&.is-mine]:text-white [&.is-done]:bg-green! [&.is-done]:text-white! [&_strong]:text-[1.9rem] [&_strong]:font-[400] [&_strong]:leading-[1.3] md:grid-cols-[auto_minmax(0,1fr)_auto] md:py-20 md:px-24 [.d-wizard-steps_li&]:text-ink [.d-wizard-steps_li&_span]:bg-ink [.d-wizard-steps_li&_span]:border-ink [.d-wizard-steps_li&_span]:text-white [.d-lifecycle_li&]:text-ink! [.d-lifecycle_li&_span]:bg-ink! [.d-lifecycle_li&_span]:border-ink! [.d-lifecycle_li&_span]:text-white! d-next is-done">
          <Icon name="check" />
          <div>
            <p className="font-hand text-[2.2rem] leading-[1] mb-4">Kontrak selesai</p>
            <strong>Semua tahap sudah dilalui. Dokumen tetap bisa diperiksa warga.</strong>
          </div>
        </div>
      )}

      <Panel title="Tahapan kontrak">
        <ol className="grid gap-6 grid-cols-[repeat(7,minmax(9rem,1fr))] list-none list-outside overflow-x-auto pb-4 [&_li]:grid [&_li]:gap-4 [&_li]:justify-items-start [&_li]:text-dim [&_li]:relative [&_li::after]:bg-line [&_li::after]:content-[''] [&_li::after]:h-1.5 [&_li::after]:left-36 [&_li::after]:absolute [&_li::after]:right-6 [&_li::after]:top-15 [&_li:last-child::after]:hidden [&_span]:items-center [&_span]:border-[0.15rem] [&_span]:border-current [&_span]:border-solid [&_span]:rounded-[50%] [&_span]:flex! [&_span]:text-[1.2rem] [&_span]:h-30 [&_span]:justify-center [&_span]:w-30 [&_strong]:text-[1.35rem]! [&_strong]:font-[420] [&_small]:text-[1.15rem]! max-md:gap-0 max-md:grid-cols-[1fr] max-md:overflow-visible max-md:pb-0 max-md:[&_li]:items-center max-md:[&_li]:gap-x-12 max-md:[&_li]:grid-cols-[3rem_minmax(0,1fr)_auto] max-md:[&_li]:py-6 max-md:[&_li]:px-0 max-md:[&_li::after]:bottom-0 max-md:[&_li::after]:h-auto max-md:[&_li::after]:left-14.25 max-md:[&_li::after]:right-auto max-md:[&_li::after]:top-36 max-md:[&_li::after]:w-1.5 d-lifecycle">
          {statusOrder.map((s, i) => {
            const h = [...c.history].reverse().find((x) => x.status === s)
            return (
              <li key={s} className={i < at ? '[.auth-steps_li&]:border-blue [.auth-steps_li&]:opacity-[1] [.form-steps_li&]:opacity-[1] [.form-steps_li&>span]:bg-blue [.form-steps_li&>span]:border-blue [.form-steps_li&>span]:text-white [.d-wizard-steps_li&]:text-ink [.d-wizard-steps_li&_span]:bg-ink [.d-wizard-steps_li&_span]:border-ink [.d-wizard-steps_li&_span]:text-white [.d-lifecycle_li&]:text-ink! [.d-lifecycle_li&_span]:bg-ink! [.d-lifecycle_li&_span]:border-ink! [.d-lifecycle_li&_span]:text-white! is-done' : i === at ? '[.d-chips_button&]:bg-ink [.d-chips_button&]:border-ink [.d-chips_button&]:text-white [.d-tabs_button&]:border-blue! [.d-tabs_button&]:text-blue! [.d-seg_button&]:bg-white! [.d-seg_button&]:[box-shadow:0_0_0_0.15rem_var(--color-ink)] [.d-wizard-steps_li&]:text-blue! [.d-wizard-steps_li&_span]:bg-blue [.d-wizard-steps_li&_span]:border-blue [.d-wizard-steps_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)] [.d-wizard-steps_li&_span]:text-white [.d-lifecycle_li&]:text-blue! [.d-lifecycle_li&_span]:bg-blue! [.d-lifecycle_li&_span]:border-blue! [.d-lifecycle_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)]! [.d-lifecycle_li&_span]:text-white! [.d-sign_li&]:border-blue! [.d-sign_li&]:[box-shadow:0.4rem_0.4rem_0_var(--color-blue)]! [.d-chips_button&_span]:text-ink-dim! [.app-notif-tabs_button&]:border-blue! [.app-notif-tabs_button&]:text-blue! is-on' : ''}>
                <span>{i < at || (i === at && s === 'selesai') ? <Icon name="check" /> : i + 1}</span>
                <strong>{statusLabels[s]}</strong>
                <small>{h ? fmtDate(h.at) : '-'}</small>
              </li>
            )
          })}
        </ol>
      </Panel>

      <div className="items-stretch grid gap-20 lg:grid-cols-[repeat(2,minmax(0,1fr))] [&>*]:min-w-0">
        <Panel title="Data kontrak">
          <dl className="grid [&>div]:border-t-[0.1rem] [&>div]:border-t-[#ececea] [&>div]:[border-top-style:solid] [&>div]:grid [&>div]:gap-3 [&>div]:py-10 [&>div]:px-0 [&>div:first-child]:border-t-0 [&>div:first-child]:[border-top-style:none] [&>div:first-child]:pt-0 [&_dt]:text-[1.25rem] [&_dt]:text-dim [&_dd]:text-[1.5rem]! [&_dd]:leading-[1.45] md:[&>div]:gap-20 md:[&>div]:grid-cols-[16rem_minmax(0,1fr)]">
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
              <dd className={late ? '[.app_&]:text-red [.app_em&]:text-[1.2rem] [.app_em&]:not-italic' : ''}>
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
          <div className="grid gap-8 [&>div:first-child]:items-baseline [&>div:first-child]:flex [&>div:first-child]:justify-between [&_span]:text-[1.35rem] [&_span]:text-dim [&_strong]:text-[2.6rem]! [&_strong]:font-[320] [&_strong_small]:text-[1.3rem] [&_strong_small]:text-dim d-big-progress">
            <div>
              <span>Progres pekerjaan</span>
              <strong>{progressOf(c)}%</strong>
            </div>
            <Bar value={progressOf(c)} tone={late ? 'red' : 'blue'} />
          </div>
          <div className="grid gap-8 [&>div:first-child]:items-baseline [&>div:first-child]:flex [&>div:first-child]:justify-between [&_span]:text-[1.35rem] [&_span]:text-dim [&_strong]:text-[2.6rem]! [&_strong]:font-[320] [&_strong_small]:text-[1.3rem] [&_strong_small]:text-dim d-big-progress">
            <div>
              <span>Sudah dibayar</span>
              <strong>
                {formatRp(paidOf(c))} <small>dari {formatRp(valueOf(c))}</small>
              </strong>
            </div>
            <Bar value={(paidOf(c) / Math.max(1, valueOf(c))) * 100} />
          </div>
          <ul className="grid gap-6 list-none list-outside [&_li]:items-center [&_li]:flex [&_li]:text-[1.4rem] [&_li]:gap-10 [&_li]:text-dim [&_li_small]:text-[1.2rem] [&_li_small]:ml-auto [&_li_small]:text-dim d-checks">
            <li className={c.signatures.desa && c.signatures.pihak && c.signatures.meterai ? '[.d-checks_li&]:text-blue is-ok' : ''}>
              <Icon name="sign" /> Tanda tangan lengkap
            </li>
            <li className={c.seals.length ? '[.d-checks_li&]:text-blue is-ok' : ''}>
              <Icon name="shield" /> Disegel SHA-256
            </li>
            <li className={c.publication ? '[.d-checks_li&]:text-blue is-ok' : ''}>
              <Icon name="globe" /> Tampil di portal warga
            </li>
            <li className={c.spk ? '[.d-checks_li&]:text-blue is-ok' : ''}>
              <Icon name="doc" /> SPK terbit
            </li>
          </ul>
        </Panel>
      </div>
      <Panel title="Aktivitas terakhir" action={<button className="[background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] text-blue text-[1.3rem] p-0 whitespace-nowrap [&:hover]:text-ink [.d-callout_&]:[color:inherit]! [.d-integrity_&]:inline-block [.d-integrity_&]:mt-6 [.d-integrity_&]:text-white! [.app-notif-panel_header_&:disabled]:text-dim [.app-notif-panel_header_&:disabled]:cursor-default" type="button" onClick={() => go('riwayat')}>Riwayat lengkap</button>}>
        <Activity logs={logs.filter((l) => l.contractCode === c.code).slice(0, 5)} />
      </Panel>
    </div>
  )
}
