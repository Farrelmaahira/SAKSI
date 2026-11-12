"""Fungsi skor murni: golden set + hasil model -> daftar Check. Tanpa jaringan, jadi bisa dites tanpa LLM.

Setiap Check masuk ke satu metrik; benchmark menjumlahkan lulus/total per metrik."""

import re
from dataclasses import dataclass

from app.gen import ai_pb2
from evals.golden import AuditCase, DraftCase, RedactCase


@dataclass(frozen=True)
class Check:
    metric: str
    ok: bool
    detail: str = ""  # diisi saat gagal, untuk ditampilkan di laporan


AUDIT_METRICS = ("kritis_terdeteksi", "tanpa_kritis_palsu", "saran_terdeteksi")
DRAFT_METRICS = ("isi_sesuai_jawaban", "tanpa_angka_karangan")
REDACT_METRICS = ("data_tersamar", "tidak_berlebihan")


def score_audit(case: AuditCase, response: ai_pb2.AuditContractResponse) -> list[Check]:
    kritis = {f.kode_pasal for f in response.findings if f.tingkat == ai_pb2.KRITIS}
    ada_saran = {f.kode_pasal for f in response.findings if f.tingkat == ai_pb2.SARAN}
    # kritis_* ditentukan kode (app/audit_rules.py), jadi harus 100% untuk model apa pun; hanya saran_terdeteksi yang bergantung pada LLM.
    return (
        [Check("kritis_terdeteksi", k in kritis, f"{k} tidak ditandai") for k in case.kritis]
        + [Check("tanpa_kritis_palsu", k not in kritis, f"{k} ditandai padahal sudah konkret") for k in case.clean]
        + [Check("saran_terdeteksi", k in ada_saran, f"{k} tidak diberi saran") for k in case.saran]
    )


# Angka rujukan ("Pasal 5", "ayat (2)", "Lampiran 1") dan nomor urut di awal baris bukan data kontrak.
_REFERENCE = re.compile(r"(?i)\b(?:pasal|ayat|huruf|butir|lampiran|angka)\s*\(?[\dIVX]+\)?|^\s*\(?\d+[.)]\s", re.MULTILINE)


def numbers_in(text: str) -> set[int]:
    """Semua angka di teks sebagai bilangan bulat; pemisah ribuan titik dibuang, angka rujukan dan 0 diabaikan."""
    text = _REFERENCE.sub(" ", text)
    text = re.sub(r"(?<=\d)\.(?=\d{3}\b)", "", text)
    return {int(n) for n in re.findall(r"\d+", text)} - {0}


def _draft_source_text(request: ai_pb2.DraftContractRequest) -> str:
    parts = [f"{c.judul} {c.isi}" for c in request.clause_library]
    parts += [f"{k} {v}" for k, v in request.jawaban.items()]
    parts += [f"{r.peraturan} {r.nomor_pasal} {r.isi}" for r in request.legal_references]
    return "\n".join(parts)


def score_draft(case: DraftCase, response: ai_pb2.DraftContractResponse) -> list[Check]:
    by_kode = {c.kode_pasal: c.isi.lower() for c in response.clauses}
    checks = []
    for kode, groups in case.expect.items():
        for alternatives in groups:
            ok = any(a.lower() in by_kode.get(kode, "") for a in alternatives)
            checks.append(Check("isi_sesuai_jawaban", ok, f"{kode}: tidak memuat {alternatives}"))
    invented = sorted(numbers_in("\n".join(c.isi for c in response.clauses)) - numbers_in(_draft_source_text(case.request)))
    return checks + [Check("tanpa_angka_karangan", not invented, f"angka tidak ada di sumber: {invented}")]


def score_redact(case: RedactCase, output: str, with_llm: bool = True) -> list[Check]:
    """with_llm=False menilai lapisan regex saja (hanya mask_regex)."""
    must_vanish = case.mask_regex + (case.mask_llm if with_llm else [])
    return [Check("data_tersamar", s not in output, f"'{s}' masih ada") for s in must_vanish] + [
        Check("tidak_berlebihan", s in output, f"'{s}' ikut tersamar") for s in case.keep
    ]
