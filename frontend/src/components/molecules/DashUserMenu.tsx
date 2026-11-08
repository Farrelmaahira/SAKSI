'use client'

import { useCallback, useRef, useState } from 'react'
import Link from 'next/link'
import Icon from '@/components/atoms/Icon'
import { useOutsideClose } from '@/hooks/use-outside-close'
import type { Session } from '@/interfaces/auth'
import { initials } from '@/lib/dash/initials'

interface Props {
  session: Session
  onSignOut: () => void
}

export default function DashUserMenu({ session, onSignOut }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useOutsideClose(open, ref, close)

  return (
    <div className="relative" ref={ref}>
      <button type="button" className="items-center bg-white border-0 border-none rounded-[3rem] [color:inherit] flex gap-10 p-4 [transition:box-shadow_0.2s] [&:hover]:[box-shadow:0.3rem_0.3rem_0_var(--color-ink)] [&[aria-expanded='true']]:[box-shadow:0.3rem_0.3rem_0_var(--color-ink)]!" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="items-center bg-blue rounded-[50%] text-white flex text-[1.4rem] font-[500] h-38 justify-center w-38">{initials(session.name)}</span>
        <span className="hidden pr-14 text-left [&_strong]:block [&_strong]:leading-[1.25] [&_small]:block [&_small]:leading-[1.25]! [&_strong]:text-[1.4rem] [&_strong]:font-[450] [&_small]:text-[1.2rem]! [&_small]:text-dim md:block">
          <strong>{session.name}</strong>
          <small>{session.role.title}</small>
        </span>
      </button>
      {open && (
        <div className="[animation:pop_0.2s_ease-out] bg-white border-[0.15rem] border-ink border-solid rounded-[1.6rem] [box-shadow:0.6rem_0.6rem_0_var(--color-ink)] grid min-w-240 p-8 absolute right-0 top-[calc(100%_+_1rem)] [&_p]:border-b-[0.1rem] [&_p]:border-b-[#e3e3e0] [&_p]:[border-bottom-style:solid] [&_p]:mb-6 [&_p]:pt-8 [&_p]:px-10 [&_p]:pb-12 [&_p_strong]:block [&_p_small]:block! [&_p_strong]:font-[450] [&_p_small]:text-[1.2rem] [&_p_small]:text-dim [&_a]:items-center [&_a]:[background:none] [&_a]:border-0! [&_a]:border-none! [&_a]:rounded-[1rem] [&_a]:[color:inherit] [&_a]:flex [&_a]:text-[1.4rem] [&_a]:gap-10 [&_a]:p-10! [&_a]:text-left [&_button]:items-center! [&_button]:[background:none]! [&_button]:border-0! [&_button]:border-none! [&_button]:rounded-[1rem]! [&_button]:[color:inherit]! [&_button]:flex! [&_button]:text-[1.4rem]! [&_button]:gap-10! [&_button]:p-10! [&_button]:text-left! [&_a:hover]:bg-soft [&_button:hover]:bg-soft!" role="menu">
          <p>
            <strong>{session.name}</strong>
            <small>{session.email}</small>
          </p>
          <Link role="menuitem" href="/dashboard/profil" onClick={close}>
            <Icon name="user" />
            Profil
          </Link>
          <button role="menuitem" type="button" onClick={onSignOut}>
            <Icon name="logout" />
            Keluar
          </button>
        </div>
      )}
    </div>
  )
}
