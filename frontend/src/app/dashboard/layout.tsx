import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import DashLayout from '@/components/organisms/DashLayout'

// Private area: keep it out of search results (robots.ts also disallows it).
export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
}

interface Props {
  children: ReactNode
}

export default function DashboardLayout({ children }: Props) {
  return <DashLayout>{children}</DashLayout>
}
