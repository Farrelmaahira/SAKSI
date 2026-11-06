import type { DContract } from '@/interfaces/db'
import { withStatus } from '@/lib/db/with-status'

export const completeSigning = (c: DContract, by: string) => (c.signatures.desa && c.signatures.pihak && c.signatures.meterai ? withStatus(c, 'ditandatangani', by) : c)
