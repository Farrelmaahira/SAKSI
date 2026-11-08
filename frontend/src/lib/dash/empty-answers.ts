import type { Answers } from '@/interfaces/drafting'
import { daysFromNow } from '@/lib/dates/days-from-now'

export const emptyAnswers = (): Answers => ({ work: '', value: 0, deadline: daysFromNow(60), scheme: 'Sekaligus', terms: 2, method: 'Pengadaan langsung' })
