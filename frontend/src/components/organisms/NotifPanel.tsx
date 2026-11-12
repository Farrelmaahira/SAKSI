import Link from 'next/link'
import Icon from '@/components/atoms/Icon'
import type { useNotificationPanel } from '@/hooks/use-notification-panel'
import type { Session } from '@/interfaces/auth'
import { when } from '@/lib/dash/when'
import { markAnyRead } from '@/lib/notifications/mark-any-read'
import { markRead } from '@/lib/notifications/mark-read'
import { notifStore } from '@/lib/notifications/notif-store'

interface Props {
  p: ReturnType<typeof useNotificationPanel>
  session: Session
}

/* The dropdown under the bell: tabs, the notifications, "mark all read" and "load older" */
export default function NotifPanel({ p, session }: Props) {
  return (
    <div className="[animation:pop_0.2s_ease-out] bg-white border-[0.15rem] border-ink border-solid rounded-[1.6rem] [box-shadow:0.6rem_0.6rem_0_var(--color-ink)] grid grid-rows-[auto_auto_minmax(0,1fr)] left-12 max-h-[min(64rem,_calc(100svh_-_10rem))] fixed right-12 top-72 z-25 [&_header]:items-center [&_header]:flex [&_header]:justify-between [&_header]:pt-16 [&_header]:px-18 [&_header]:pb-10 [&_header_strong]:text-[1.8rem] [&_header_strong]:font-[420] [&_ul]:list-none [&_ul]:list-outside [&_ul]:overflow-y-auto [&_ul]:p-6! [&_li_a]:[align-items:start] [&_li_a]:rounded-[1.2rem] [&_li_a]:grid [&_li_a]:gap-12 [&_li_a]:grid-cols-[auto_minmax(0,1fr)_1rem] [&_li_a]:py-11 [&_li_a]:px-12 [&_li_a:hover]:bg-soft md:left-auto md:absolute md:-right-4 md:top-[calc(100%_+_1rem)] md:w-420 app-notif-panel" role="dialog" aria-label="Notifikasi">
      <header>
        <strong>Notifikasi</strong>
        <button type="button" className="[background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] text-blue text-[1.3rem] p-0 whitespace-nowrap [&:hover]:text-ink [.d-callout_&]:[color:inherit]! [.d-integrity_&]:inline-block [.d-integrity_&]:mt-6 [.d-integrity_&]:text-white! [.app-notif-panel_header_&:disabled]:text-dim [.app-notif-panel_header_&:disabled]:cursor-default" disabled={!p.unread.length} onClick={() => {
          markRead(session.userId, p.todos.map((n) => n.id))
          if (p.server.unread) notifStore.readAll()
        }}>
          Tandai semua dibaca
        </button>
      </header>
      <div className="border-b-[0.15rem] border-b-line [border-bottom-style:solid] flex gap-16 py-0 px-18 [&_button]:items-center [&_button]:[background:none] [&_button]:border-0 [&_button]:border-none [&_button]:border-b-[0.3rem] [&_button]:border-b-transparent [&_button]:[border-bottom-style:solid] [&_button]:text-dim [&_button]:inline-flex [&_button]:text-[1.35rem] [&_button]:gap-6 [&_button]:-mb-1.5 [&_button]:py-8 [&_button]:px-0 [&_span]:bg-red! [&_span]:rounded-[2rem] [&_span]:text-white! [&_span]:text-[1.05rem]! [&_span]:leading-[1.8rem] [&_span]:min-w-18 [&_span]:py-0! [&_span]:px-5! [&_span]:text-center app-notif-tabs" role="tablist">
        {(['tindakan', 'aktivitas'] as const).map((k) => (
          <button key={k} type="button" role="tab" aria-selected={p.tab === k} className={p.tab === k ? '[.d-chips_button&]:bg-ink [.d-chips_button&]:border-ink [.d-chips_button&]:text-white [.d-tabs_button&]:border-blue! [.d-tabs_button&]:text-blue! [.d-seg_button&]:bg-white! [.d-seg_button&]:[box-shadow:0_0_0_0.15rem_var(--color-ink)] [.d-wizard-steps_li&]:text-blue! [.d-wizard-steps_li&_span]:bg-blue [.d-wizard-steps_li&_span]:border-blue [.d-wizard-steps_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)] [.d-wizard-steps_li&_span]:text-white [.d-lifecycle_li&]:text-blue! [.d-lifecycle_li&_span]:bg-blue! [.d-lifecycle_li&_span]:border-blue! [.d-lifecycle_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)]! [.d-lifecycle_li&_span]:text-white! [.d-sign_li&]:border-blue! [.d-sign_li&]:[box-shadow:0.4rem_0.4rem_0_var(--color-blue)]! [.d-chips_button&_span]:text-ink-dim! [.app-notif-tabs_button&]:border-blue! [.app-notif-tabs_button&]:text-blue! is-on' : ''} onClick={() => p.setTab(k)}>
            {k === 'tindakan' ? 'Perlu tindakan' : 'Aktivitas'}
            {p.count(k) > 0 && <span>{p.count(k)}</span>}
          </button>
        ))}
      </div>
      {p.shown.length ? (
        <ul>
          {p.shown.map((n) => {
            const isNew = !p.seen.has(n.id)
            return (
              <li key={n.id}>
                <Link href={n.to} className={isNew ? 'is-new' : ''} onClick={() => markAnyRead(session.userId, n.id)}>
                  <span className={`items-center rounded-[50%] text-white flex h-32 justify-center w-32 [&.tone-blue]:bg-blue [&.tone-red]:bg-red! [&.tone-ink]:bg-ink! app-notif-mark tone-${n.tone}`} aria-hidden="true">
                    <Icon name={n.kind === 'aktivitas' ? 'clock' : n.tone === 'red' ? 'alert' : 'arrow'} />
                  </span>
                  <span className="grid gap-2 min-w-0 [&_strong]:text-[1.4rem] [&_strong]:font-[400] [&_strong]:leading-[1.35] [.app-notif-panel_.is-new_&_strong]:font-[500] [&_small]:text-dim [&_small]:text-[1.2rem]! [&_small]:overflow-hidden [&_small]:text-ellipsis [&_small]:whitespace-nowrap">
                    <strong>{n.title}</strong>
                    <small>{n.text}</small>
                    <small>{when(n.at)}</small>
                  </span>
                  {isNew && <span className="bg-blue rounded-[50%] h-9 mt-6 w-9" aria-label="Belum dibaca" />}
                </Link>
              </li>
            )
          })}
        </ul>
      ) : null}
      {p.shown.length > 0 && p.tab === 'aktivitas' && p.server.nextBefore ? (
        <button type="button" className="[background:none] border-0 text-blue text-[1.3rem] py-12 px-18 text-left [&:hover]:text-ink disabled:text-dim" onClick={() => notifStore.loadMore()} disabled={p.server.busy}>
          {p.server.busy ? 'Memuat…' : 'Muat notifikasi lebih lama'}
        </button>
      ) : null}
      {!p.shown.length && (
        <p className="text-dim text-[1.4rem] pt-24 px-18 pb-28" role={p.tab === 'aktivitas' && p.server.status === 'error' ? 'alert' : 'status'}>
          {p.tab === 'tindakan' ? 'Tidak ada yang menunggu Anda.' : p.server.status === 'loading' || p.server.status === 'idle' ? 'Memuat notifikasi…' : p.server.status === 'error' ? p.server.error : 'Belum ada aktivitas dari pihak lain.'}
        </p>
      )}
    </div>
  )
}
