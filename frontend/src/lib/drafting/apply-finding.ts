import type { Answers, Clause, TemplateKey } from "@/interfaces/drafting";
import { legal, objectText, sanctionFix } from "@/data/drafting";
import { findClause } from "@/lib/drafting/find-clause";

/* "Terapkan saran": returns updated answers and clauses for one finding */
export function applyFinding(
  t: TemplateKey,
  a: Answers,
  clauses: Clause[],
  id: string,
): { answers: Answers; clauses: Clause[] } {
  const insertBefore = (before: Clause | undefined, clause: Clause) => {
    const i = before ? clauses.indexOf(before) : -1;
    const list = [...clauses];
    list.splice(i < 0 ? list.length : i, 0, clause);
    return list;
  };
  if (id === "sanksi") {
    const found = findClause(clauses, "sanksi");
    // A deleted sanction clause is added back; an existing one gets the concrete text.
    return {
      answers: a,
      clauses: found
        ? clauses.map((c) => (c === found ? { ...c, text: sanctionFix[t] } : c))
        : insertBefore(findClause(clauses, "sengketa"), {
            key: "sanksi",
            title: "Sanksi Keterlambatan",
            text: sanctionFix[t],
            plain: "Hukuman bila kewajiban terlambat dipenuhi.",
            legal: legal.wanprestasi,
          }),
    };
  }
  if (id === "ambang") {
    const answers = { ...a, method: "Lelang terbatas" };
    return {
      answers,
      clauses: clauses.map((c) =>
        c.key === "objek" ? { ...c, text: objectText[t](answers) } : c,
      ),
    };
  }
  if (id === "kahar")
    return {
      answers: a,
      clauses: insertBefore(findClause(clauses, "sengketa"), {
        key: "kahar",
        title: "Keadaan Kahar",
        text: "Bila terjadi bencana alam, wabah, atau kejadian di luar kendali, pihak yang terdampak memberi tahu paling lambat 7 hari dan jadwal disesuaikan bersama.",
        plain:
          "Apa yang terjadi bila ada kejadian di luar kendali kedua pihak.",
        legal: legal.kahar,
      }),
    };
  if (id === "retensi")
    return {
      answers: a,
      clauses: insertBefore(findClause(clauses, "sanksi"), {
        key: "retensi",
        title: "Retensi",
        text: "Sebesar 5 persen dari pembayaran terakhir ditahan sampai masa pemeliharaan 30 hari selesai tanpa kerusakan.",
        plain: "Sebagian kecil uang ditahan dulu untuk menjamin kualitas.",
        legal: legal.pbjDesa,
      }),
    };
  return { answers: a, clauses };
}
