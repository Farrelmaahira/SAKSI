import type { NavLink } from '@/interfaces/content'
import { buildNavLinks } from '@/lib/nav/build-nav-links'
import { useSession } from './use-session'

export function useNavLinks(): NavLink[] {
  return buildNavLinks(useSession())
}
