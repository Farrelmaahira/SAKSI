import type {
  Answers,
  Audit,
  Clause,
  Finding,
  TemplateKey,
} from "@/interfaces/drafting";
import { VAGUE_SANCTION } from "@/data/drafting";
import { regionRules } from "@/data/master";
import { formatRp } from "@/lib/contracts/format-rp";
import { daysUntil } from "@/lib/dates/days-until";
import { nowIso } from "@/lib/dates/now-iso";
import { findClause } from "@/lib/drafting/find-clause";
import { scoreOf } from "@/lib/drafting/score-of";

export function auditDraft(
  t: TemplateKey,
  a: Answers,
  clauses: Clause[],
  regionId: string,
): Audit {
  const findings: Finding[] = [];
  const sanction = findClause(clauses, "sanksi");
  if (!sanction || sanction.text === VAGUE_SANCTION)
    findings.push({
      id: "sanksi",
      severity: "kritis",
      title: "Sanksi belum jelas",
      text: "Besaran sanksi belum ditulis. Tanpa angka pasti, sanksi sulit ditagih bila terjadi keterlambatan.",
      clauseKey: sanction?.key ?? "sanksi",
      fixable: true,
    });
  const rule = regionRules[regionId];
  if (
    t === "pengadaan" &&
    rule &&
    a.value > rule.directMax &&
    a.method === "Pengadaan langsung"
  )
    findings.push({
      id: "ambang",
      severity: "kritis",
      title: "Melewati ambang pengadaan langsung",
      text: `Nilai ${formatRp(a.value)} di atas batas ${formatRp(rule.directMax)} (${rule.basis}). Gunakan lelang terbatas.`,
      clauseKey: findClause(clauses, "objek")?.key ?? "objek",
      fixable: true,
    });
  if (!findClause(clauses, "kahar"))
    findings.push({
      id: "kahar",
      severity: "saran",
      title: "Belum ada pasal keadaan kahar",
      text: "Tambahkan aturan bila terjadi bencana atau kejadian di luar kendali, supaya tidak langsung dianggap ingkar janji.",
      fixable: true,
    });
  if (
    t === "pengadaan" &&
    a.scheme === "Termin" &&
    a.terms >= 2 &&
    !findClause(clauses, "retensi")
  )
    findings.push({
      id: "retensi",
      severity: "saran",
      title: "Tambahkan retensi",
      text: "Tahan 5 persen pembayaran terakhir sampai masa pemeliharaan selesai, untuk menjamin kualitas pekerjaan.",
      clauseKey: findClause(clauses, "pembayaran")?.key ?? "pembayaran",
      fixable: true,
    });
  if (a.deadline && daysUntil(a.deadline) < 14)
    findings.push({
      id: "tenggat",
      severity: "saran",
      title: "Tenggat sangat singkat",
      text: "Tenggat kurang dari 14 hari. Pastikan waktunya masuk akal, atau ubah tenggat di langkah Pertanyaan.",
      clauseKey: findClause(clauses, "jangka_waktu")?.key ?? "jangka_waktu",
      fixable: false,
    });
  return { at: nowIso(), score: scoreOf(findings), findings };
}
