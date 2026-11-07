import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { useSession } from './use-session'

/* Dashboard pages need an account: send visitors to the login page and bring them back afterwards. */
export function useRequireSession(leaving: boolean) {
  const session = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Read storage directly: right after hydration the hook can still hold the server's null.
    if (!leaving && !getSession()) router.replace(`/masuk?from=${encodeURIComponent(pathname)}`)
  }, [session, leaving, router, pathname])

  return session
}
