import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from './use-session'

/* Signed-in users have no business on the login pages; send them on and tell the page to render nothing. */
export function useRedirectIfSignedIn(to: string) {
  const session = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) router.replace(to)
  }, [session, to, router])

  return Boolean(session)
}
