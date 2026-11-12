import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  /* cards per row on wide screens: 3 (default), 4 or 5 */
  cols?: 3 | 4 | 5
}

// full class names on purpose: Tailwind only generates classes it can read literally from the source
const COLS = {
  3: 'md:grid-cols-[repeat(3,minmax(0,1fr))] lg:grid-cols-[repeat(3,minmax(0,1fr))]',
  4: 'md:grid-cols-[repeat(4,minmax(0,1fr))] lg:grid-cols-[repeat(4,minmax(0,1fr))]',
  5: 'md:grid-cols-[repeat(3,minmax(0,1fr))] lg:grid-cols-[repeat(5,minmax(0,1fr))]',
}

/* Row of Stat cards: two across on phones, more from tablet width */
export default function StatGrid({ children, cols = 3 }: Props) {
  return <div className={`grid gap-12 grid-cols-[repeat(2,minmax(0,1fr))] ${COLS[cols]} d-stats`}>{children}</div>
}
