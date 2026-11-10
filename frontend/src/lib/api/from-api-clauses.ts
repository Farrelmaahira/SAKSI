import type { Clause } from '@/interfaces/drafting'

/* Untrusted server clauses -> local clauses, sorted by urutan. Entries without a code or title are dropped. */
export function fromApiClauses(list: unknown[]): Clause[] {
  return list
    .map((x) => (x ?? {}) as Record<string, unknown>)
    .filter((x) => typeof x.kodePasal === 'string' && x.kodePasal && typeof x.judul === 'string' && x.judul)
    .sort((a, b) => Number(a.urutan) - Number(b.urutan))
    .map((x) => ({
      key: String(x.kodePasal),
      title: String(x.judul),
      text: typeof x.isi === 'string' ? x.isi : '',
      plain: '',
      legal: '',
      legalReferenceId: Number(x.legalReferenceId) || undefined,
    }))
}
