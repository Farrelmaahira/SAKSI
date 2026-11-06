import type { DContract } from '@/interfaces/db'
import { latestVersion } from '@/lib/db/latest-version'

export const valueOf = (c: DContract) => latestVersion(c).answers.value
