'use client'

import { useCallback, useRef } from 'react'
import Icon from '@/components/atoms/Icon'
import NotifPanel from '@/components/organisms/NotifPanel'
import { useNotificationPanel } from '@/hooks/use-notification-panel'
import { useOutsideClose } from '@/hooks/use-outside-close'
import type { Session } from '@/interfaces/auth'

interface Props { session: Session }

export default function Notifications({ session }: Props) {
  const p = useNotificationPanel(session)
  const { open, unread, setOpen } = p
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [setOpen])
  useOutsideClose(open, ref, close)

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className={`items-center bg-transparent border-[0.15rem] border-current border-solid rounded-[50%] [color:inherit] flex h-40 justify-center [transition:background_0.2s,_color_0.2s] w-40 [.app-side_&:hover]:bg-white [.app-side_&:hover]:text-blue [.app-top_&]:bg-white [.app-top_&]:border-white [.app-top_&]:text-ink [.app-top_&:hover]:[box-shadow:0.3rem_0.3rem_0_var(--color-ink)] [.app-top_&.is-on]:[box-shadow:0.3rem_0.3rem_0_var(--color-ink)]! relative ${open ? '[.d-chips_button&]:bg-ink [.d-chips_button&]:border-ink [.d-chips_button&]:text-white [.d-tabs_button&]:border-blue! [.d-tabs_button&]:text-blue! [.d-seg_button&]:bg-white! [.d-seg_button&]:[box-shadow:0_0_0_0.15rem_var(--color-ink)] [.d-wizard-steps_li&]:text-blue! [.d-wizard-steps_li&_span]:bg-blue [.d-wizard-steps_li&_span]:border-blue [.d-wizard-steps_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)] [.d-wizard-steps_li&_span]:text-white [.d-lifecycle_li&]:text-blue! [.d-lifecycle_li&_span]:bg-blue! [.d-lifecycle_li&_span]:border-blue! [.d-lifecycle_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)]! [.d-lifecycle_li&_span]:text-white! [.d-sign_li&]:border-blue! [.d-sign_li&]:[box-shadow:0.4rem_0.4rem_0_var(--color-blue)]! [.d-chips_button&_span]:text-ink-dim! [.app-notif-tabs_button&]:border-blue! [.app-notif-tabs_button&]:text-blue! is-on' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={unread.length ? `Notifikasi, ${unread.length} belum dibaca` : 'Notifikasi'}
        onClick={p.toggle}
      >
        <Icon name="bell" />
        {unread.length > 0 && <span className="items-center bg-red border-[0.2rem] border-soft border-solid rounded-[2rem] text-white flex text-[1.05rem] font-[500] h-22 justify-center min-w-22 py-0 px-4 absolute -right-6 -top-6">{unread.length > 9 ? '9+' : unread.length}</span>}
      </button>
      {open && <NotifPanel p={p} session={session} />}
    </div>
  )
}
