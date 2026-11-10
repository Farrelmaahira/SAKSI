import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { NAV_KEY } from '@/data/dash-nav'
import { isDesktop } from '@/lib/dash/is-desktop'

/* Sidebar state of the dashboard: a drawer on small screens, collapsible on desktop (remembered). */
export function useDashNav() {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(NAV_KEY) === '1')
  const [lastPath, setLastPath] = useState(path)

  // the drawer closes when the page changes
  if (path !== lastPath) {
    setLastPath(path)
    setOpen(false)
  }

  // the page behind an open drawer must not scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // One button: hides/shows the sidebar on desktop, opens the drawer on smaller screens
  const toggle = () => {
    if (!isDesktop()) return setOpen(true)
    setCollapsed((c) => {
      localStorage.setItem(NAV_KEY, c ? '0' : '1')
      return !c
    })
  }

  return { path, open, collapsed, toggle, close: () => setOpen(false) }
}
