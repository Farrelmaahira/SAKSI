import DashHomeTemplate from '@/components/organisms/DashHomeTemplate'

// The dashboard renders after a browser-side session check, so there is no static shell to validate.
export const instant = false

export default function DashboardPage() {
  return <DashHomeTemplate />
}
