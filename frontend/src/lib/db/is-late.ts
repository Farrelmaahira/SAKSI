import type { DContract } from '@/interfaces/db'
import { isActive } from '@/lib/db/is-active'
import { progressOf } from '@/lib/db/progress-of'
import { daysUntil } from '@/lib/dates/days-until'
import { deadlineOf } from '@/lib/db/deadline-of'

export const isLate = (c: DContract) => isActive(c) && progressOf(c) < 100 && daysUntil(deadlineOf(c)) < 0
