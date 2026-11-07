import type { DContract } from '@/interfaces/db'
import { latestVersion } from '@/lib/db/latest-version'

export const deadlineOf = (c: DContract) => latestVersion(c)?.answers?.deadline ?? ''
