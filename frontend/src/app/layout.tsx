import type { Metadata } from 'next'
import type React from 'react'
import SiteLayout from '@/components/organisms/SiteLayout'
import './globals.css'

export const metadata: Metadata = {
  title: 'SAKSI - Sistem Audit Kontrak Segel Integritas',
  description:
    'SAKSI helps village governments and small businesses create, verify, and publish digital contracts, enabling transparent project tracking and community oversight.',
  robots: { index: false, follow: false },
  icons: {
    icon: '/logo-saksi.png',
    shortcut: '/logo-saksi.png',
    apple: '/logo-saksi.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>
        <SiteLayout>{children}</SiteLayout>
      </body>
    </html>
  )
}
