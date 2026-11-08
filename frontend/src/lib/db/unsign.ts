import type { DContract } from '@/interfaces/db'

/* A signature only vouches for the text it was made on, so any edit to the text removes it. */
export const unsign = (c: DContract): DContract => (c.signatures.desa || c.signatures.pihak || c.signatures.meterai ? { ...c, signatures: {} } : c)
