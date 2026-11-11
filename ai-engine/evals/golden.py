"""Memuat golden set (tests/golden/*.json) menjadi request protobuf beserta ekspektasinya."""

import json
from dataclasses import dataclass
from pathlib import Path

from app.gen import ai_pb2

GOLDEN_DIR = Path(__file__).resolve().parents[1] / "tests" / "golden"


@dataclass(frozen=True)
class AuditCase:
    id: str
    request: ai_pb2.AuditContractRequest
    kritis: list[str]  # pasal yang harus mendapat temuan KRITIS
    clean: list[str]  # pasal yang tidak boleh mendapat temuan KRITIS


@dataclass(frozen=True)
class DraftCase:
    id: str
    request: ai_pb2.DraftContractRequest
    # kode_pasal -> daftar grup; tiap grup lolos bila SALAH SATU alternatifnya ada di isi pasal (tanpa membedakan huruf besar)
    expect: dict[str, list[list[str]]]


@dataclass(frozen=True)
class RedactCase:
    id: str
    text: str
    mask_regex: list[str]  # harus hilang oleh regex saja (tanpa LLM)
    mask_llm: list[str]  # harus hilang setelah lapisan LLM (nama, alamat)
    keep: list[str]  # harus tetap ada (jabatan, instansi, angka kontrak)


def _load(name: str) -> list[dict]:
    return json.loads((GOLDEN_DIR / f"{name}.json").read_text(encoding="utf-8"))


def _clauses(rows: list[list]) -> list[ai_pb2.Clause]:
    """Baris = [kode_pasal, judul, isi, legal_reference_id (opsional)]; urutan mengikuti posisi."""
    return [
        ai_pb2.Clause(kode_pasal=r[0], judul=r[1], isi=r[2], urutan=n, legal_reference_id=r[3] if len(r) > 3 else 0)
        for n, r in enumerate(rows, 1)
    ]


def load_audit_cases() -> list[AuditCase]:
    return [
        AuditCase(
            c["id"],
            ai_pb2.AuditContractRequest(
                jenis=ai_pb2.ContractType.Value(c["jenis"]), clauses=_clauses(c["clauses"]), mandatory_kode_pasal=c["mandatory"],
            ),
            c["kritis"],
            c["clean"],
        )
        for c in _load("audit_quality")
    ]


def load_draft_cases() -> list[DraftCase]:
    return [
        DraftCase(
            c["id"],
            ai_pb2.DraftContractRequest(
                jenis=ai_pb2.ContractType.Value(c["jenis"]),
                jawaban=c["jawaban"],
                clause_library=_clauses(c["clauses"]),
                legal_references=[ai_pb2.LegalReference(**r) for r in c["legal_references"]],
            ),
            c["expect"],
        )
        for c in _load("draft")
    ]


def load_redact_cases() -> list[RedactCase]:
    return [RedactCase(c["id"], c["text"], c["mask_regex"], c["mask_llm"], c["keep"]) for c in _load("redact")]
