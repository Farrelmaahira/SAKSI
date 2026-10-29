import type { Metadata } from 'next'
import SiteLayout from '@/components/templates/SiteLayout'
import './globals.css'

export const metadata: Metadata = {
  title: 'SAKSI',
  description:
    'SAKSI helps village governments and small businesses create, verify, and publish digital contracts, enabling transparent project tracking and community oversight.',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="id">
      <body>
        <SiteLayout>{children}</SiteLayout>
      </body>
    </html>
  )
}
