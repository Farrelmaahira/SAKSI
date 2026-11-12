"""Cek pasti kelengkapan pasal dan jaminan stabilitas: temuan KRITIS hanya dari kode, tidak dari tingkat keparahan LLM."""

import asyncio
import json

import pytest

from app import audit_rules, contract_ai, llm
from app.audit_rules import Issue, Rule
from app.gen import ai_pb2
from evals.golden import load_draft_cases
from support import clauses, fake

# Teks nyata: pasal baku backend (RuleDraftClauses) dan perbaikan manual PM pada kontrak 125 di database lokal.
BAKU = next(c for c in load_draft_cases() if c.id == "pengadaan-pasal-baku").request.clause_library
P04_DIPERBAIKI = ("1. Pembayaran dilakukan dalam 3 (tiga) termin: Termin I sebesar 30% setelah pekerjaan mencapai 30%; Termin II sebesar 40% "
                  "setelah pekerjaan mencapai 70%; Termin III sebesar 30% setelah pekerjaan selesai 100% dan BAST ditandatangani.")
P06_DIPERBAIKI = "PIHAK KEDUA memberikan jaminan pemeliharaan dan garansi mutu selama 180 (seratus delapan puluh) hari kalender terhitung sejak BAST."


def kritis_of(issues):
    return [i for i in issues if i.tingkat == "kritis"]


@pytest.mark.parametrize("judul,isi,lengkap", [
    ("SANKSI DAN DENDA", "denda keterlambatan sebesar 1/1000 (satu permil) untuk setiap hari", True),
    ("Sanksi", "Keterlambatan dikenakan denda 5% dari nilai kontrak.", True),
    ("Sanksi", "Sanksi atas keterlambatan akan diatur kemudian oleh para pihak.", False),
    ("JANGKA WAKTU PELAKSANAAN", "paling lambat tanggal 31 December 2026, dibuktikan dengan BAST", True),  # bulan Inggris dari backend
    ("Jangka Waktu", "Kerja sama berlaku dua tahun sejak 2 Januari 2027.", True),
    ("Jangka Waktu", "Selesai dalam 30 (tiga puluh) hari kalender sejak SPK.", True),
    ("Jangka Waktu", "Pekerjaan diselesaikan dalam waktu yang wajar.", False),
    ("JAMINAN PEMELIHARAAN DAN GARANSI", "selama masa garansi terhitung sejak tanggal BAST", False),
    ("Retensi dan Pemeliharaan", "ditahan retensi 5% selama 6 bulan", True),
    ("Pembayaran", "Pembayaran dilakukan sesuai kesepakatan para pihak.", False),
    ("PEMBAYARAN", "1. Skema pembayaran dilaksanakan secara: termin.\n2. Ditransfer ke rekening resmi PIHAK KEDUA.", False),
    ("PEMBAYARAN", "Skema pembayaran: Termin 50% dan 50%.", True),
    ("Pembayaran", "Sekaligus setelah pekerjaan selesai 100%.", True),
    ("Pembayaran", "Pembeli membayar tunai saat barang diserahkan.", True),
    ("Nilai Kontrak", "Nilai kontrak sebesar Rp 150.000.000 termasuk pajak.", True),
    ("Harga Sewa", "Penyewa membayar uang sewa kepada Pemerintah Desa.", False),
    ("Bagi Hasil", "Hasil usaha dibagi secara adil dan proporsional.", False),
    ("Bagi Hasil", "BUMDes 40% dan mitra 60% dari keuntungan bersih.", True),
    ("Para Pihak", "Pihak pertama dan pihak kedua.", True),  # judul tanpa aturan
    ("Ruang Lingkup", "pengaspalan jalan sepanjang 500 meter", True),
])
def test_slot_rules(judul, isi, lengkap):
    assert (kritis_of(audit_rules.check_clause(judul, isi)) == []) is lengkap


@pytest.mark.parametrize("isi", [
    "Sumber pembiayaan dibebankan pada [diisi manual].",
    "Nilai sebesar [nilai kontrak].",
    "Pekerjaan: (isi sesuai pekerjaan)",
    "Nama: ________",
])
def test_unfilled_placeholder_is_critical_in_any_clause(isi):
    assert [i.tingkat for i in audit_rules.check_clause("Para Pihak", isi)] == ["kritis"]


def test_standard_clauses_only_fail_where_the_template_really_lacks_data():
    # Pasal baku backend: hanya P-06 (garansi tanpa durasi) yang belum lengkap. Ubah ini hanya bila kebijakannya diubah.
    flagged = {c.kode_pasal for c in BAKU if kritis_of(audit_rules.check_clause(c.judul, c.isi))}
    assert flagged == {"P-06"}


def test_manually_fixed_clauses_pass():
    assert audit_rules.check_clause("SISTEM DAN TATA CARA PEMBAYARAN", P04_DIPERBAIKI) == []
    assert audit_rules.check_clause("JAMINAN PEMELIHARAAN DAN GARANSI", P06_DIPERBAIKI) == []


def test_rule_can_be_made_advisory(monkeypatch):
    monkeypatch.setattr(audit_rules, "RULES", [Rule("garansi", audit_rules.RULES[2].judul, audit_rules.RULES[2].lengkap, "x", tingkat="saran")])
    assert audit_rules.check_clause("Garansi", "selama masa garansi") == [Issue("saran", "x")]


# ---------- Stabilitas: LLM yang sengaja mengeskalasi semua pasal tidak boleh mengubah temuan KRITIS ----------


def escalating_llm(codes):
    """LLM 'nakal': tiap pasal diberi temuan, dengan tingkat KRITIS (bidang yang kini diabaikan)."""
    return json.dumps({"findings": [{"kode_pasal": k, "tingkat": "KRITIS", "pesan": f"masalah di {k}"} for k in codes]})


def audit(clause_rows, monkeypatch):
    request = ai_pb2.AuditContractRequest(jenis=ai_pb2.PENGADAAN, clauses=clauses(clause_rows), mandatory_kode_pasal=[r[0] for r in clause_rows])
    monkeypatch.setattr(llm, "call_provider", fake({"groq": escalating_llm([r[0] for r in clause_rows])}))
    return asyncio.run(contract_ai.audit_contract(request))


def kritis_codes(res):
    return {f.kode_pasal for f in res.findings if f.tingkat == ai_pb2.KRITIS}


def test_llm_severity_never_creates_critical_findings(monkeypatch):
    rows = [(c.kode_pasal, c.judul, c.isi) for c in BAKU]
    res = audit(rows, monkeypatch)
    assert kritis_codes(res) == {"P-06"}  # LLM menandai 10 pasal KRITIS, hanya cek pasti yang dihitung
    assert res.skor == 90.0
    assert {f.kode_pasal for f in res.findings if f.tingkat == ai_pb2.SARAN} == {c.kode_pasal for c in BAKU} - {"P-06"}


def test_fixing_one_clause_does_not_escalate_untouched_clauses(monkeypatch):
    # Kasus nyata kontrak 124 -> 125: setelah P-04/P-06 diperbaiki, P-07 dan P-09 (tidak berubah) naik jadi KRITIS oleh LLM.
    before = [(c.kode_pasal, c.judul, c.isi) for c in BAKU]
    after = [(k, j, P06_DIPERBAIKI if k == "P-06" else P04_DIPERBAIKI if k == "P-04" else i) for k, j, i in before]
    assert kritis_codes(audit(before, monkeypatch)) == {"P-06"}
    res = audit(after, monkeypatch)
    assert kritis_codes(res) == set() and res.skor == 100.0


def test_llm_suggestion_is_dropped_for_clause_that_is_already_critical(monkeypatch):
    res = audit([("P-07", "Sanksi", "Sanksi diatur kemudian.")], monkeypatch)
    assert [(f.kode_pasal, f.tingkat) for f in res.findings] == [("P-07", ai_pb2.KRITIS)]


def test_llm_suggestions_are_advisory_and_do_not_lower_score(monkeypatch):
    res = audit([("P-01", "Ruang Lingkup", "pengaspalan jalan sepanjang 500 meter")], monkeypatch)
    assert [(f.kode_pasal, f.tingkat) for f in res.findings] == [("P-01", ai_pb2.SARAN)] and res.skor == 100.0
