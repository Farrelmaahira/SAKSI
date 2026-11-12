"""Golden set: bentuk datanya valid, lapisan regex memenuhi bagian yang bisa dipastikan tanpa LLM, fungsi skor dan
runner benchmark bekerja. Kualitas LLM sungguhan diukur terpisah oleh `python -m evals.benchmark` (butuh API key)."""

import asyncio
import json

import pytest

from app import contract_ai, llm, pii
from app.gen import ai_pb2
from evals import benchmark, golden, score
from evals.score import Check
from support import fake

AUDIT = golden.load_audit_cases()
DRAFT = golden.load_draft_cases()
REDACT = golden.load_redact_cases()


def test_case_ids_are_unique_per_file():
    for cases in (AUDIT, DRAFT, REDACT):
        ids = [c.id for c in cases]
        assert len(ids) == len(set(ids))


def test_every_contract_type_has_a_draft_case():
    assert {c.request.jenis for c in DRAFT} == {ai_pb2.PENGADAAN, ai_pb2.HIBAH, ai_pb2.KERJA_SAMA_BUMDES, ai_pb2.SEWA_ASET, ai_pb2.UMKM}


@pytest.mark.parametrize("case", AUDIT, ids=lambda c: c.id)
def test_audit_case_is_consistent(case):
    kodes = {c.kode_pasal for c in case.request.clauses}
    assert set(case.kritis) | set(case.saran) | set(case.clean) <= kodes
    assert not set(case.kritis) & set(case.clean) and not set(case.saran) & set(case.kritis)
    assert set(case.request.mandatory_kode_pasal) <= kodes


@pytest.mark.parametrize("case", AUDIT, ids=lambda c: c.id)
def test_audit_golden_kritis_is_decided_by_code_not_by_the_model(case, monkeypatch):
    # LLM palsu yang menandai SEMUA pasal KRITIS: hasil KRITIS tetap persis sesuai golden.
    answer = json.dumps({"findings": [{"kode_pasal": c.kode_pasal, "tingkat": "KRITIS", "pesan": "x"} for c in case.request.clauses]})
    monkeypatch.setattr(llm, "call_provider", fake({"groq": answer}))
    res = asyncio.run(contract_ai.audit_contract(case.request))
    assert {f.kode_pasal for f in res.findings if f.tingkat == ai_pb2.KRITIS} == set(case.kritis)


@pytest.mark.parametrize("case", DRAFT, ids=lambda c: c.id)
def test_draft_case_is_consistent(case):
    assert set(case.expect) <= {c.kode_pasal for c in case.request.clause_library}
    assert all(group for groups in case.expect.values() for group in groups)


@pytest.mark.parametrize("case", REDACT, ids=lambda c: c.id)
def test_redact_case_is_consistent(case):
    assert all(s in case.text for s in case.mask_regex + case.mask_llm + case.keep)  # ekspektasi harus ada di teks
    assert not set(case.mask_regex + case.mask_llm) & set(case.keep)


@pytest.mark.parametrize("case", REDACT, ids=lambda c: c.id)
def test_regex_layer_alone_meets_its_part_of_the_golden_set(case):
    masked, _ = pii.redact_regex(case.text)
    failed = [c.detail for c in score.score_redact(case, masked, with_llm=False) if not c.ok]
    assert failed == []


# ---------- Fungsi skor ----------


def test_numbers_ignore_separators_and_references():
    assert score.numbers_in("Pasal 5 ayat (2): Rp 150.000.000,00 pada 31 Desember 2026.\n1. Denda 1/1000.") == {150000000, 31, 2026, 1, 1000}


def test_score_draft_flags_invented_numbers_and_missing_values():
    case = next(c for c in DRAFT if c.id == "sewa-harga-tidak-diisi")
    ok = ai_pb2.DraftContractResponse(clauses=[
        ai_pb2.Clause(kode_pasal="SW-01", isi="Pemerintah Desa menyewakan tanah kas desa seluas 2.000 m2 di Dusun II."),
        ai_pb2.Clause(kode_pasal="SW-02", isi="Sewa berlaku selama 3 tahun sejak penandatanganan."),
        ai_pb2.Clause(kode_pasal="SW-03", isi="Harga sewa sebesar [diisi manual] per tahun, dibayar [diisi manual]."),
    ])
    assert all(c.ok for c in score.score_draft(case, ok))

    bad = ai_pb2.DraftContractResponse(clauses=[
        ai_pb2.Clause(kode_pasal="SW-01", isi="Pemerintah Desa menyewakan sebidang tanah."),
        ai_pb2.Clause(kode_pasal="SW-02", isi="Sewa berlaku selama 3 tahun."),
        ai_pb2.Clause(kode_pasal="SW-03", isi="Harga sewa sebesar Rp 5.000.000 per tahun."),
    ])
    failed = {c.metric for c in score.score_draft(case, bad) if not c.ok}
    assert failed == {"isi_sesuai_jawaban", "tanpa_angka_karangan"}


def test_score_audit_counts_only_kritis():
    case = next(c for c in AUDIT if c.id == "pengadaan-pembayaran-kabur")
    saran_only = ai_pb2.AuditContractResponse(findings=[ai_pb2.Finding(kode_pasal="P-04", tingkat=ai_pb2.SARAN, pesan="x")])
    assert [(c.metric, c.ok) for c in score.score_audit(case, saran_only)] == [("kritis_terdeteksi", False), ("tanpa_kritis_palsu", True)]


# ---------- Runner benchmark ----------


def test_benchmark_runner_with_fake_provider(monkeypatch):
    case = next(c for c in AUDIT if c.id == "pengadaan-pembayaran-kabur")
    answer = json.dumps({"findings": [{"kode_pasal": "P-04", "tingkat": "KRITIS", "pesan": "Pembayaran tanpa skema."}]})
    monkeypatch.setattr(llm, "call_provider", fake({"groq": answer}))
    monkeypatch.setenv("AI_PROVIDERS", "groq:test")
    summary = benchmark.summarize(benchmark.TASKS["audit"], asyncio.run(benchmark.run_task(benchmark.TASKS["audit"], [case])))
    assert summary.answered == 1 and summary.metrics == {"kritis_terdeteksi": (1, 1), "tanpa_kritis_palsu": (1, 1), "saran_terdeteksi": (0, 0)}


def test_benchmark_records_failure_reason_and_redact_llm_failure(monkeypatch):
    from support import http_error
    monkeypatch.setattr(llm, "call_provider", fake({"groq": http_error(429)}))
    monkeypatch.setenv("AI_PROVIDERS", "groq:test")
    for name in ("audit", "redact"):  # redact tidak melempar saat LLM gagal; tetap harus tercatat gagal
        task = benchmark.TASKS[name]
        s = benchmark.summarize(task, asyncio.run(benchmark.run_task(task, task.load()[:1])))
        assert s.answered == 0 and dict(s.failures) == {"429": 1}


def test_render_is_markdown_table():
    task = benchmark.TASKS["redact"]
    outcomes = [benchmark.Outcome("a", 1.5, [Check("data_tersamar", True), Check("tidak_berlebihan", False, "'x' ikut tersamar")]),
                benchmark.Outcome("b", 0, None, "503")]
    text = benchmark.render({"groq:test": {"redact": (2, benchmark.summarize(task, outcomes))}})
    assert "| groq:test | 1/2 | 503×1 | 1/1 | 0/1 | 1.5 | 1.5 |" in text and "'x' ikut tersamar" in text
