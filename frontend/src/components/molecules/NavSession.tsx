'use client'

import Link from 'next/link'
import { useSession } from '@/hooks/use-session'

/* "Masuk" link, or the first-name avatar when signed in. */
export default function NavSession() {
  const session = useSession()

  if (!session)
    return (
      <Link className="nav-login" href="/masuk">
        Masuk
      </Link>
    )

  return (
    <Link className="nav-account" href="/dashboard" aria-label={`Dashboard ${session.name}`}>
      <span className="nav-avatar">{session.name.slice(0, 1).toUpperCase()}</span>
      <span className="nav-account-name">{session.name.split(/\s+/)[0]}</span>
    </Link>
  )
}
