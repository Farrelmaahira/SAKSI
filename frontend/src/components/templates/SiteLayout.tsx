'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Footer from '@/components/organisms/Footer'
import MenuOverlay from '@/components/organisms/MenuOverlay'
import Navbar from '@/components/organisms/Navbar'

export interface SiteLayoutProps {
  children: ReactNode
}

export default function SiteLayout({ children }: SiteLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const [lastPath, setLastPath] = useState(pathname)

  // Close the menu on navigation. Menu links also close it on click, which covers same-page /#hash links.
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setMenuOpen(false)
  }

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
  }, [menuOpen])

  const cta = pathname === '/simulasi' ? { label: 'Lacak kontrak', href: '/lacak' } : { label: 'Coba simulasi', href: '/simulasi' }

  return (
    <>
      <Navbar cta={cta} onOpenMenu={() => setMenuOpen(true)} />
      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
      {children}
      <Footer />
    </>
  )
}
