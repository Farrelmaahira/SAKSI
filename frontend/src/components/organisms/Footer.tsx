'use client'

import Link from 'next/link'
import PillButton from '@/components/atoms/PillButton'
import Underline from '@/components/atoms/Underline'
import { useNavLinks } from '@/hooks/use-nav-links'

export default function Footer() {
  const navLinks = useNavLinks()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-lead">
            <p className="footer-statement">
              Kontrak yang jelas adalah awal dari{' '}
              <span className="marked">
                pengawasan.
                <Underline className="footer-underline" />
              </span>
            </p>
            <PillButton onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Kembali ke atas</PillButton>
          </div>
          <nav className="footer-nav" aria-label="Navigasi footer">
            {navLinks.map(({ label, href }) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="footer-base">
          <p className="footer-word">saksi</p>
          <p className="footer-meta">
            Sistem Audit Kontrak
            <br />
            Segel Integritas
          </p>
        </div>
      </div>
    </footer>
  )
}
