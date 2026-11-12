import json
from pathlib import Path

import grpc
import httpx
import pytest
from grpc_health.v1 import health_pb2

from app import grpc_server, llm, pii
from app.gen import ai_pb2
from support import clauses, code_of, fake, rpc

GOLDEN = json.loads((Path(__file__).parent / "golden" / "audit_missing_mandatory.json").read_text())
NO_FINDINGS = json.dumps({"findings": []})
DOWN = httpx.ConnectError("mati")


AUDIT = ai_pb2.AuditContractRequest(
    jenis=ai_pb2.PENGADAAN,
    clauses=clauses([("P-01", "Para Pihak", "Desa dan CV."), ("P-02", "Sanksi", "Sanksi diatur kemudian.")]),
    mandatory_kode_pasal=["P-01", "P-02"],
)


# ---------- Golden set: pasal wajib yang hilang selalu terdeteksi, apa pun jawaban LLM ----------


@pytest.mark.parametrize("case", GOLDEN, ids=[c["jenis"] for c in GOLDEN])
def test_golden_missing_mandatory(monkeypatch, case):
    monkeypatch.setattr(llm, "call_provider", fake({"groq": NO_FINDINGS}))
    res = rpc("AuditContract", ai_pb2.AuditContractRequest(
        jenis=ai_pb2.ContractType.Value(case["jenis"]), clauses=clauses(case["clauses"]), mandatory_kode_pasal=case["mandatory"],
    ))
    kritis = {f.kode_pasal for f in res.findings if f.tingkat == ai_pb2.KRITIS}
    assert kritis == set(case["missing"])
    assert res.skor == case["skor"] and res.model == "groq:test"


# ---------- AuditContract ----------


def test_audit_score_counts_critical_clauses(monkeypatch):
    # P-02 "Sanksi diatur kemudian" tidak memuat besaran: KRITIS dari cek pasti. Tingkat KRITIS dari LLM diabaikan.
    answer = json.dumps({"findings": [{"kode_pasal": "P-01", "tingkat": "KRITIS", "pesan": "Pihak kurang jelas."}]})
    monkeypatch.setattr(llm, "call_provider", fake({"groq": answer}))
    res = rpc("AuditContract", AUDIT)
    assert res.skor == 50.0
    assert sorted((f.kode_pasal, f.tingkat) for f in res.findings) == [("P-01", ai_pb2.SARAN), ("P-02", ai_pb2.KRITIS)]


def test_audit_unknown_kode_from_llm_counts_as_failure(monkeypatch):
    bad = json.dumps({"findings": [{"kode_pasal": "P-99", "tingkat": "SARAN", "pesan": "x"}]})
    monkeypatch.setattr(llm, "call_provider", fake({"groq": bad, "gemini": NO_FINDINGS}))
    assert rpc("AuditContract", AUDIT).model == "gemini:test"


def test_audit_flags_legal_reference_not_sent(monkeypatch):
    monkeypatch.setattr(llm, "call_provider", fake({"groq": NO_FINDINGS}))
    req = ai_pb2.AuditContractRequest(jenis=ai_pb2.HIBAH, clauses=clauses([("H-01", "Dasar", "isi")], ref=99),
                                      legal_references=[ai_pb2.LegalReference(id=1, peraturan="Perlem LKPP 12/2019")])
    assert [f.tingkat for f in rpc("AuditContract", req).findings] == [ai_pb2.KRITIS]


@pytest.mark.parametrize("method,request_", [
    ("AuditContract", AUDIT),
    ("DraftContract", ai_pb2.DraftContractRequest(jenis=ai_pb2.UMKM, clause_library=clauses([("U-01", "Pihak", "isi")]))),
])
def test_all_providers_down_is_unavailable(monkeypatch, method, request_):
    monkeypatch.setattr(llm, "call_provider", fake({"groq": DOWN, "gemini": "bukan json"}))
    assert code_of(method, request_) == grpc.StatusCode.UNAVAILABLE


def test_no_provider_configured_is_unavailable(monkeypatch):
    monkeypatch.setenv("AI_PROVIDERS", "")
    assert code_of("AuditContract", AUDIT) == grpc.StatusCode.UNAVAILABLE


# ---------- Validasi input ----------


@pytest.mark.parametrize("request_", [
    ai_pb2.AuditContractRequest(clauses=AUDIT.clauses),  # jenis kosong
    ai_pb2.AuditContractRequest(jenis=ai_pb2.HIBAH),  # tanpa pasal
    ai_pb2.AuditContractRequest(jenis=ai_pb2.HIBAH, clauses=clauses([("A", "a", "x"), ("A", "b", "y")])),  # kode ganda
    ai_pb2.AuditContractRequest(jenis=ai_pb2.HIBAH, clauses=clauses([("A", "a", "x" * (200 * 1024 + 1))])),  # > 200 KB
])
def test_invalid_audit_input(request_):
    assert code_of("AuditContract", request_) == grpc.StatusCode.INVALID_ARGUMENT


def test_redact_over_limit_is_invalid():
    assert code_of("RedactText", ai_pb2.RedactTextRequest(text="x" * (200 * 1024 + 1))) == grpc.StatusCode.INVALID_ARGUMENT


# ---------- Auth metadata ----------


@pytest.mark.parametrize("key", [None, "", "salah"])
def test_rejects_bad_api_key(key):
    assert code_of("AuditContract", AUDIT, key=key) == grpc.StatusCode.UNAUTHENTICATED


def test_health_needs_no_key():
    res = rpc("Health", health_pb2.HealthCheckRequest(service=grpc_server.SERVICE))
    assert res.status == health_pb2.HealthCheckResponse.SERVING


# ---------- DraftContract ----------

LIBRARY = clauses([("P-01", "Nilai", "Nilai kontrak Rp {nilai}."), ("P-02", "Sanksi", "Denda per hari.")])
LIBRARY[0].legal_reference_id = 7
DRAFT = ai_pb2.DraftContractRequest(
    jenis=ai_pb2.PENGADAAN, jawaban={"nilai": "150000000"}, clause_library=LIBRARY,
    legal_references=[ai_pb2.LegalReference(id=7, peraturan="Perlem LKPP 12/2019"), ai_pb2.LegalReference(id=8, peraturan="KUHPerdata")],
)


def draft_json(*rows):
    return json.dumps({"clauses": [{"kode_pasal": k, "isi": i, "legal_reference_id": r} for k, i, r in rows]})


def test_draft_keeps_every_clause_and_order(monkeypatch):
    out = draft_json(("P-02", "Denda 1/1000 per hari.", 8), ("P-01", "Nilai kontrak Rp 150.000.000.", 0))
    monkeypatch.setattr(llm, "call_provider", fake({"groq": out}))
    res = rpc("DraftContract", DRAFT)
    assert [(c.kode_pasal, c.judul, c.urutan, c.legal_reference_id) for c in res.clauses] == [("P-01", "Nilai", 1, 7), ("P-02", "Sanksi", 2, 8)]
    assert res.clauses[0].isi == "Nilai kontrak Rp 150.000.000." and res.model == "groq:test"


@pytest.mark.parametrize("bad", [
    draft_json(("P-01", "isi", 0)),  # pasal P-02 hilang
    draft_json(("P-01", "isi", 0), ("P-02", "isi", 0), ("P-03", "tambahan", 0)),  # pasal bertambah
    draft_json(("P-01", "isi", 0), ("P-02", "isi", 99)),  # dasar hukum karangan
])
def test_draft_invalid_output_falls_back_then_unavailable(monkeypatch, bad):
    good = draft_json(("P-01", "a", 0), ("P-02", "b", 0))
    monkeypatch.setattr(llm, "call_provider", fake({"groq": bad, "gemini": good}))
    assert rpc("DraftContract", DRAFT).model == "gemini:test"
    monkeypatch.setattr(llm, "call_provider", fake({"groq": bad, "gemini": bad}))
    assert code_of("DraftContract", DRAFT) == grpc.StatusCode.UNAVAILABLE


def _draft_with(template_isi, llm_isi, monkeypatch):
    request = ai_pb2.DraftContractRequest(jenis=ai_pb2.PENGADAAN, clause_library=clauses([("P-02", "Nilai", template_isi)]))
    monkeypatch.setattr(llm, "call_provider", fake({"groq": draft_json(("P-02", llm_isi, 0))}))
    return rpc("DraftContract", request).clauses[0].isi


def test_draft_keeps_concrete_template_text_the_llm_blanked(monkeypatch):
    template = "1. Nilai Rp 150.000.000.\n2. Dibebankan pada APBDes tahun berjalan."
    assert _draft_with(template, "1. Nilai Rp 150.000.000. 2. Dibebankan pada [diisi manual].", monkeypatch) == template


def test_draft_restores_line_breaks_when_only_whitespace_changed(monkeypatch):
    template = "1. Pihak pertama membayar.\n2. Pihak kedua bekerja."
    assert _draft_with(template, "1. Pihak pertama membayar. 2. Pihak kedua bekerja.", monkeypatch) == template


def test_draft_drops_copied_title_line(monkeypatch):
    # Judul pasal ("Nilai") ikut tersalin sebagai baris pertama isi; harus dibuang.
    assert _draft_with("Nilai kontrak Rp 1.000.", "Nilai\nNilai kontrak Rp 1.000.", monkeypatch) == "Nilai kontrak Rp 1.000."


def test_draft_uses_llm_text_for_empty_fields(monkeypatch):
    # Kolom kosong yang diisi (atau ditandai [diisi manual]) harus dipakai, bukan dibuang.
    assert _draft_with("Nilai sebesar [nilai kontrak].", "Nilai sebesar Rp 85.000.000.", monkeypatch) == "Nilai sebesar Rp 85.000.000."
    assert _draft_with("Harga [harga sewa] per tahun.", "Harga [diisi manual] per tahun.", monkeypatch) == "Harga [diisi manual] per tahun."


# ---------- RedactText ----------

PERSONAL = "Penyewa Budi Santoso, NIK 3201234567890001, HP 0812-3456-7890, tinggal di Jl. Melati 5 RT 01."


def test_redact_regex_then_llm(monkeypatch):
    answer = json.dumps({"items": [{"jenis": "nama", "teks": "Budi Santoso"}, {"jenis": "alamat", "teks": "Jl. Melati 5 RT 01"},
                                {"jenis": "nama", "teks": "Tidak Ada Di Teks"}]})
    monkeypatch.setattr(llm, "call_provider", fake({"groq": answer}))
    res = rpc("RedactText", ai_pb2.RedactTextRequest(text=PERSONAL))
    assert res.text == "Penyewa [NAMA], NIK [NIK], HP [NO-HP], tinggal di [ALAMAT]."
    assert sorted(res.redacted_kinds) == ["alamat", "nama", "nik", "no_hp"]


def test_redact_returns_regex_result_when_llm_down(monkeypatch):
    monkeypatch.setattr(llm, "call_provider", fake({"groq": DOWN, "gemini": DOWN}))
    res = rpc("RedactText", ai_pb2.RedactTextRequest(text=PERSONAL))
    assert "3201234567890001" not in res.text and "Budi Santoso" in res.text
    assert list(res.redacted_kinds) == ["no_hp", "nik"]


def test_regex_keeps_money_and_masks_bank_account():
    text, kinds = pii.redact_regex("Nilai Rp 1500000000. Transfer ke No. Rek: BRI 0123-4567-8901 a.n. desa.")
    assert "1500000000" in text and "0123-4567-8901" not in text and kinds == ["rekening"]
