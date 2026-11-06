import Icon from '@/components/atoms/Icon'
import DashUserMenu from '@/components/molecules/DashUserMenu'
import { roleLabels } from '@/data/auth'
import type { Session } from '@/interfaces/auth'
import Notifications from './Notifications'

interface Props {
  session: Session
  collapsed: boolean
  onToggleNav: () => void
  onSignOut: () => void
}

export default function DashTopbar({ session, collapsed, onToggleNav, onSignOut }: Props) {
  return (
    <header className="app-top">
      <button
        className="app-icon-btn app-menu-btn"
        type="button"
        onClick={onToggleNav}
        aria-label={collapsed ? 'Tampilkan navigasi' : 'Sembunyikan navigasi'}
        aria-expanded={!collapsed}
        title={collapsed ? 'Tampilkan navigasi' : 'Sembunyikan navigasi'}
      >
        <Icon name="sidebar" />
      </button>
      <p className="app-crumb">
        Dashboard <span>{roleLabels[session.role.role]}</span>
      </p>
      <Notifications session={session} />
      <DashUserMenu session={session} onSignOut={onSignOut} />
    </header>
  )
}
