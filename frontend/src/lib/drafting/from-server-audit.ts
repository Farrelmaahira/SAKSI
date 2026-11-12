import type { ContractAudit } from "@/interfaces/api";
import type { Audit, Clause } from "@/interfaces/drafting";

export function fromServerAudit(
  a: ContractAudit,
  clauses: Clause[],
  original: Clause[],
  at: string,
): Audit {
  const textOf = (list: Clause[], key: string) =>
    list.find((c) => c.key === key)?.text;
  return {
    at,
    score: Math.round(a.skor),
    findings: a.findings.map((f, i) => ({
      id: `server-${i}`,
      severity: f.tingkat,
      title: f.kodePasal
        ? (clauses.find((c) => c.key === f.kodePasal)?.title ??
          `Pasal ${f.kodePasal}`)
        : "Temuan umum",
      text: f.pesan,
      clauseKey: f.kodePasal || undefined,
      fixable: Boolean(f.kodePasal),
      fix: !f.kodePasal ? undefined : textOf(original, f.kodePasal) === undefined ? 'add' : 'edit',
      applied:
        Boolean(f.kodePasal) &&
        textOf(clauses, f.kodePasal) !== textOf(original, f.kodePasal),
    })),
  };
}
