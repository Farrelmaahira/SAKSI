import type { NavItem } from '@/interfaces/dash'

// "Kontrak" stays highlighted on contract detail pages, but not on "Buat Kontrak"
export const isNavOn = (i: NavItem, path: string) =>
  i.end ? path === i.to : i.to === '/dashboard/kontrak' ? path.startsWith(i.to) && !path.startsWith('/dashboard/kontrak/baru') : path.startsWith(i.to)
