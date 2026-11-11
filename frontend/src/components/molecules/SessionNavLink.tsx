'use client'

import Link from 'next/link'
import { useSession } from '@/hooks/use-session'
import { sessionLink } from '@/lib/nav/session-link'

/* "Dashboard" or "Masuk / daftar", depending on the session the browser holds */
export default function SessionNavLink() {
  const { label, href } = sessionLink(useSession())
  return <Link href={href}>{label}</Link>
}
