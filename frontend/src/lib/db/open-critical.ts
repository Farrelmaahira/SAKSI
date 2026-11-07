import type { DContract } from '@/interfaces/db'
import { latestVersion } from '@/lib/db/latest-version'

export const openCritical = (c: DContract) => latestVersion(c).audit.findings.filter((f) => f.severity === 'kritis' && !f.applied).length
