'use client'

import type { Session } from '@/interfaces/auth'
import { db } from '@/lib/db/db'
import { useNotifications } from '@/hooks/use-notifications'
import { notifStore } from '@/lib/notifications/notif-store'
import { toNotif } from '@/lib/notifications/to-notif'
import { markAnyRead } from '@/lib/notifications/mark-any-read'
import { useReadIds } from '@/lib/notifications/use-read-ids'
import { useCallback, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useOutsideClose } from '@/hooks/use-outside-close'
import type { Notif } from '@/interfaces/notifications'
import { notificationsFor } from '@/lib/notifications/notifications-for'
import Icon from '@/components/atoms/Icon'
import { markRead } from '@/lib/notifications/mark-read'
import Link from 'next/link'
import { when } from '@/lib/dash/when'

interface Props { session: Session }

export default function Notifications({ session }: Props) {
  const d = db.use()
  const server = useNotifications(session.userId)
  const read = useReadIds(session.userId)
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [lastPath, setLastPath] = useState(pathname)
  const [tab, setTab] = useState<Notif['kind']>(session.role.role === 'warga' ? 'aktivitas' : 'tindakan')
  const ref = useRef<HTMLDivElement>(null)

  // Perlu tindakan: derived on this device; Aktivitas: GET /notifications
  const todos = notificationsFor(session, d)
  const all = [...todos, ...server.items.map(toNotif)]
  const seen = new Set([...read, ...server.items.filter((n) => n.dibaca).map((n) => `n:${n.id}`)])
  const unread = all.filter((n) => !seen.has(n.id))
  const shown = all.filter((n) => n.kind === tab)
  const count = (k: Notif['kind']) => unread.filter((n) => n.kind === k).length

  // Close the panel when the page changes.
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  const close = useCallback(() => setOpen(false), [])
  useOutsideClose(open, ref, close)

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className={`items-center bg-transparent border-[0.15rem] border-current border-solid rounded-[50%] [color:inherit] flex h-40 justify-center [transition:background_0.2s,_color_0.2s] w-40 [.app-side_&:hover]:bg-white [.app-side_&:hover]:text-blue [.app-top_&]:bg-white [.app-top_&]:border-white [.app-top_&]:text-ink [.app-top_&:hover]:[box-shadow:0.3rem_0.3rem_0_var(--color-ink)] [.app-top_&.is-on]:[box-shadow:0.3rem_0.3rem_0_var(--color-ink)]! relative ${open ? '[.d-chips_button&]:bg-ink [.d-chips_button&]:border-ink [.d-chips_button&]:text-white [.d-tabs_button&]:border-blue! [.d-tabs_button&]:text-blue! [.d-seg_button&]:bg-white! [.d-seg_button&]:[box-shadow:0_0_0_0.15rem_var(--color-ink)] [.d-wizard-steps_li&]:text-blue! [.d-wizard-steps_li&_span]:bg-blue [.d-wizard-steps_li&_span]:border-blue [.d-wizard-steps_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)] [.d-wizard-steps_li&_span]:text-white [.d-lifecycle_li&]:text-blue! [.d-lifecycle_li&_span]:bg-blue! [.d-lifecycle_li&_span]:border-blue! [.d-lifecycle_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)]! [.d-lifecycle_li&_span]:text-white! [.d-sign_li&]:border-blue! [.d-sign_li&]:[box-shadow:0.4rem_0.4rem_0_var(--color-blue)]! [.d-chips_button&_span]:text-ink-dim! [.app-notif-tabs_button&]:border-blue! [.app-notif-tabs_button&]:text-blue! is-on' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={unread.length ? `Notifikasi, ${unread.length} belum dibaca` : 'Notifikasi'}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="bell" />
        {unread.length > 0 && <span className="items-center bg-red border-[0.2rem] border-soft border-solid rounded-[2rem] text-white flex text-[1.05rem] font-[500] h-22 justify-center min-w-22 py-0 px-4 absolute -right-6 -top-6">{unread.length > 9 ? '9+' : unread.length}</span>}
      </button>
      {open && (
        <div className="[animation:pop_0.2s_ease-out] bg-white border-[0.15rem] border-ink border-solid rounded-[1.6rem] [box-shadow:0.6rem_0.6rem_0_var(--color-ink)] grid grid-rows-[auto_auto_minmax(0,1fr)] left-12 max-h-[min(64rem,_calc(100svh_-_10rem))] fixed right-12 top-72 z-25 [&_header]:items-center [&_header]:flex [&_header]:justify-between [&_header]:pt-16 [&_header]:px-18 [&_header]:pb-10 [&_header_strong]:text-[1.8rem] [&_header_strong]:font-[420] [&_ul]:list-none [&_ul]:list-outside [&_ul]:overflow-y-auto [&_ul]:p-6! [&_li_a]:[align-items:start] [&_li_a]:rounded-[1.2rem] [&_li_a]:grid [&_li_a]:gap-12 [&_li_a]:grid-cols-[auto_minmax(0,1fr)_1rem] [&_li_a]:py-11 [&_li_a]:px-12 [&_li_a:hover]:bg-soft md:left-auto md:absolute md:-right-4 md:top-[calc(100%_+_1rem)] md:w-420 app-notif-panel" role="dialog" aria-label="Notifikasi">
          <header>
            <strong>Notifikasi</strong>
            <button type="button" className="[background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] text-blue text-[1.3rem] p-0 whitespace-nowrap [&:hover]:text-ink [.d-callout_&]:[color:inherit]! [.d-integrity_&]:inline-block [.d-integrity_&]:mt-6 [.d-integrity_&]:text-white! [.app-notif-panel_header_&:disabled]:text-dim [.app-notif-panel_header_&:disabled]:cursor-default" disabled={!unread.length} onClick={() => {
              markRead(session.userId, todos.map((n) => n.id))
              if (server.unread) notifStore.readAll()
            }}>
              Tandai semua dibaca
            </button>
          </header>
          <div className="border-b-[0.15rem] border-b-line [border-bottom-style:solid] flex gap-16 py-0 px-18 [&_button]:items-center [&_button]:[background:none] [&_button]:border-0 [&_button]:border-none [&_button]:border-b-[0.3rem] [&_button]:border-b-transparent [&_button]:[border-bottom-style:solid] [&_button]:text-dim [&_button]:inline-flex [&_button]:text-[1.35rem] [&_button]:gap-6 [&_button]:-mb-1.5 [&_button]:py-8 [&_button]:px-0 [&_span]:bg-red! [&_span]:rounded-[2rem] [&_span]:text-white! [&_span]:text-[1.05rem]! [&_span]:leading-[1.8rem] [&_span]:min-w-18 [&_span]:py-0! [&_span]:px-5! [&_span]:text-center app-notif-tabs" role="tablist">
            {(['tindakan', 'aktivitas'] as const).map((k) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? '[.d-chips_button&]:bg-ink [.d-chips_button&]:border-ink [.d-chips_button&]:text-white [.d-tabs_button&]:border-blue! [.d-tabs_button&]:text-blue! [.d-seg_button&]:bg-white! [.d-seg_button&]:[box-shadow:0_0_0_0.15rem_var(--color-ink)] [.d-wizard-steps_li&]:text-blue! [.d-wizard-steps_li&_span]:bg-blue [.d-wizard-steps_li&_span]:border-blue [.d-wizard-steps_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)] [.d-wizard-steps_li&_span]:text-white [.d-lifecycle_li&]:text-blue! [.d-lifecycle_li&_span]:bg-blue! [.d-lifecycle_li&_span]:border-blue! [.d-lifecycle_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)]! [.d-lifecycle_li&_span]:text-white! [.d-sign_li&]:border-blue! [.d-sign_li&]:[box-shadow:0.4rem_0.4rem_0_var(--color-blue)]! [.d-chips_button&_span]:text-ink-dim! [.app-notif-tabs_button&]:border-blue! [.app-notif-tabs_button&]:text-blue! is-on' : ''} onClick={() => setTab(k)}>
                {k === 'tindakan' ? 'Perlu tindakan' : 'Aktivitas'}
                {count(k) > 0 && <span>{count(k)}</span>}
              </button>
            ))}
          </div>
          {shown.length ? (
            <ul>
              {shown.map((n) => {
                const isNew = !seen.has(n.id)
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
          {shown.length > 0 && tab === 'aktivitas' && server.nextBefore ? (
            <button type="button" className="[background:none] border-0 text-blue text-[1.3rem] py-12 px-18 text-left [&:hover]:text-ink disabled:text-dim" onClick={() => notifStore.loadMore()} disabled={server.busy}>
              {server.busy ? 'Memuat…' : 'Muat notifikasi lebih lama'}
            </button>
          ) : null}
          {!shown.length && (
            <p className="text-dim text-[1.4rem] pt-24 px-18 pb-28" role={tab === 'aktivitas' && server.status === 'error' ? 'alert' : 'status'}>
              {tab === 'tindakan' ? 'Tidak ada yang menunggu Anda.' : server.status === 'loading' || server.status === 'idle' ? 'Memuat notifikasi…' : server.status === 'error' ? server.error : 'Belum ada aktivitas dari pihak lain.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
