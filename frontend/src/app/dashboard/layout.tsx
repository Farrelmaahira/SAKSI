import type { ReactNode } from 'react'
import DashLayout from '@/components/organisms/DashLayout'
import '@/styles/pages.css'
import '@/styles/dash.css'

interface Props {
  children: ReactNode
}

export default function DashboardLayout({ children }: Props) {
  return <DashLayout>{children}</DashLayout>
}
