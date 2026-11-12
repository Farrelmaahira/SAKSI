"""Pemeriksaan pasti kelengkapan pasal, tanpa LLM. Inilah satu-satunya sumber temuan KRITIS (selain pasal wajib hilang dan
dasar hukum tidak sah di contract_ai.audit_contract), sehingga gerbang kirim di backend tidak bergantung pada model yang
kebetulan menjawab. LLM hanya memberi SARAN.

Heuristik regex atas judul dan isi pasal. Bila ada false positive, perbaiki pola di RULES (atau ubah `tingkat` jadi
"saran" supaya tidak memblokir); jangan melonggarkan lewat prompt."""

import re
from dataclasses import dataclass

_BULAN = ("januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember"
          "|january|february|march|may|june|july|august|october|december")  # backend memformat tanggal dengan bulan Inggris
_ANGKA_KATA = r"(?:satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|sepuluh|sebelas|belas|puluh|ratus)"

_TANGGAL = rf"\b\d{{1,2}}\s+(?:{_BULAN})\s+\d{{4}}\b|\b\d{{4}}-\d{{2}}-\d{{2}}\b"
# "30 hari", "180 (seratus delapan puluh) hari kalender", "enam bulan", "7 hari kerja"
_DURASI = rf"\b(?:\d+|(?:{_ANGKA_KATA}\s+){{1,4}})\s*(?:\([^)]*\)\s*)?(?:kalender\s+|kerja\s+)?(?:hari|minggu|bulan|tahun)\b"
# "1/1000", "5%", "0,1%", "satu permil", "Rp 500.000"
_BESARAN = r"\d+(?:[.,]\d+)?\s*%|\b\d+\s*/\s*\d+|\bper\s*mil\b|\bpermil\b|\bpersen\b|\bRp\.?\s*\d"
_RUPIAH = r"\bRp\.?\s*\d|\b\d[\d.,]*\s*rupiah\b"
_TERMIN = r"\b\d+\s*(?:\([^)]*\)\s*)?termin\b|\btermin\s+(?:i{1,3}|iv|v|\d+)\b"  # "3 (tiga) termin", "Termin II"
_PORSI = r"\d+(?:[.,]\d+)?\s*%|\b\d+\s*[:/]\s*\d+|\bpersen\b"

# Kolom kosong yang belum diisi: "[diisi manual]", "[nilai kontrak]", "(isi sesuai pekerjaan)", "____".
_KOLOM_KOSONG = re.compile(r"\[[^\]\n]+\]|\(\s*isi\b[^)\n]*\)|_{3,}", re.IGNORECASE)


@dataclass(frozen=True)
class Rule:
    topik: str
    judul: re.Pattern  # pasal yang dikenai aturan ini, dikenali dari judulnya
    lengkap: re.Pattern  # isi pasal harus cocok dengan pola ini agar dianggap lengkap
    pesan: str
    tingkat: str = "kritis"  # "saran" = tidak memblokir pengiriman


@dataclass(frozen=True)
class Issue:
    tingkat: str  # "kritis" | "saran"
    pesan: str


def _rule(topik: str, judul: str, lengkap: str, pesan: str, tingkat: str = "kritis") -> Rule:
    return Rule(topik, re.compile(judul, re.IGNORECASE), re.compile(lengkap, re.IGNORECASE), pesan, tingkat)


RULES = [
    _rule("sanksi", r"sanksi|denda", _BESARAN,
          "Sanksi belum memuat besaran (mis. 1/1000 per hari atau persentase dari nilai kontrak)."),
    _rule("jangka waktu", r"jangka\s+waktu|waktu\s+pelaksanaan|masa\s+pelaksanaan", f"{_TANGGAL}|{_DURASI}",
          "Jangka waktu belum memuat tanggal atau durasi yang pasti."),
    _rule("garansi", r"garansi|pemeliharaan", _DURASI,
          "Masa garansi atau pemeliharaan belum memuat durasi (mis. 180 hari kalender)."),
    _rule("pembayaran", r"pembayaran|termin", rf"{_BESARAN}|{_TERMIN}|\bsekaligus\b|\blunas\b|\btunai\b|\bdi\s+muka\b",
          "Pembayaran belum memuat rincian: persentase atau jumlah tiap termin, atau skema yang pasti (sekaligus, tunai)."),
    _rule("nilai", r"nilai|harga|biaya", _RUPIAH, "Nilai atau harga belum memuat jumlah dalam rupiah."),
    _rule("bagi hasil", r"bagi\s+hasil", _PORSI, "Bagi hasil belum memuat porsi masing-masing pihak (persentase)."),
]


def check_clause(judul: str, isi: str) -> list[Issue]:
    """Temuan pasti untuk satu pasal. Daftar kosong = lengkap menurut aturan di atas."""
    issues = []
    if (blank := _KOLOM_KOSONG.search(isi)):
        issues.append(Issue("kritis", f"Pasal masih berisi kolom kosong {blank.group(0)!r}; lengkapi sebelum dikirim."))
    issues += [Issue(r.tingkat, r.pesan) for r in RULES if r.judul.search(judul) and not r.lengkap.search(isi)]
    return issues
