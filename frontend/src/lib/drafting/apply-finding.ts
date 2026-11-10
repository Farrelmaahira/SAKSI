import type { Answers, Clause, TemplateKey } from "@/interfaces/drafting";
import { legal, objectText, sanctionFix } from "@/data/drafting";

/* "Terapkan saran": returns updated answers and clauses for one finding */
export function applyFinding(
  t: TemplateKey,
  a: Answers,
  clauses: Clause[],
  id: string,
): { answers: Answers; clauses: Clause[] } {
  if (id === "sanksi")
    return {
      answers: a,
      clauses: clauses.map((c) =>
        c.key === "sanksi" ? { ...c, text: sanctionFix[t] } : c,
      ),
    };
  if (id === "ambang") {
    const answers = { ...a, method: "Lelang terbatas" };
    return {
      answers,
      clauses: clauses.map((c) =>
        c.key === "objek" ? { ...c, text: objectText[t](answers) } : c,
      ),
    };
  }
  const insertBefore = (key: string, clause: Clause) => {
    const i = clauses.findIndex((c) => c.key === key);
    const list = [...clauses];
    list.splice(i < 0 ? list.length : i, 0, clause);
    return list;
  };
  if (id === "kahar")
    return {
      answers: a,
      clauses: insertBefore("sengketa", {
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
      clauses: insertBefore("sanksi", {
        key: "retensi",
        title: "Retensi",
        text: "Sebesar 5 persen dari pembayaran terakhir ditahan sampai masa pemeliharaan 30 hari selesai tanpa kerusakan.",
        plain: "Sebagian kecil uang ditahan dulu untuk menjamin kualitas.",
        legal: legal.pbjDesa,
      }),
    };
  return { answers: a, clauses };
}
