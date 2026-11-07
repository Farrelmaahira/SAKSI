import type { DContract } from '@/interfaces/db'
import { contractText } from '@/lib/contracts/contract-text'
import { toPublic } from '@/lib/db/to-public'

/* The exact text that gets sealed; identical to what the public portal hashes */
export const canonicalText = (c: DContract) => contractText(toPublic(c, []))
