import type { Clause } from "@/interfaces/drafting";

/* First problem that blocks saving a hand-written clause list, or null when it is complete. */
export function clauseError(clauses: Clause[]): string | null {
  if (!clauses.length) return "Tambahkan minimal satu pasal.";
  const i = clauses.findIndex(
    (c) => c.title.trim().length < 3 || !c.text.trim(),
  );
  return i < 0 ? null : `Pasal ${i + 1} perlu judul (minimal 3 huruf) dan isi.`;
}
