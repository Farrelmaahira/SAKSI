import type { DContract } from '@/interfaces/db'

/* ---------- Helpers ---------- */

export const latestVersion = (c: DContract) => c.versions[c.versions.length - 1]
