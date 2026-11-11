"""Penyamaran data pribadi dengan regex (NIK, NPWP, HP, email, rekening). Tanpa LLM, tanpa dependensi.

Nama orang dan alamat tidak bisa ditangkap regex; itu tugas lapisan LLM di contract_ai.redact_text."""

import re

# Urutan penting: nomor HP dan NPWP berformat sebelum deret angka polos.
_PATTERNS = [
    ("email", re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+"), "[EMAIL]"),
    ("no_hp", re.compile(r"(?:(?:\+62|\b62)[\s-]?|\b0)8\d{1,3}[\s-]?\d{3,4}[\s-]?\d{3,5}\b"), "[NO-HP]"),
    ("npwp", re.compile(r"\b\d{2}\.\d{3}\.\d{3}\.\d-\d{3}\.\d{3}\b"), "[NPWP]"),
    ("rekening", re.compile(r"(?i)(\brek(?:ening)?\.?\s*(?:no\.?|nomor)?\s*:?\s*(?:(?:bank\s+)?[a-z]{2,10}\s+)?(?:no\.?\s*)?)\d[\d.\- ]{4,}\d"), r"\1[REKENING]"),
    ("nik", re.compile(r"\b\d{4}[\s-]\d{4}[\s-]\d{4}[\s-]\d{4}\b"), "[NIK]"),  # tertulis berspasi atau bergaris
    ("nik", re.compile(r"\b\d{16}\b"), "[NIK]"),  # juga NPWP 16 digit (sama dengan NIK)
    ("npwp", re.compile(r"\b\d{15}\b"), "[NPWP]"),
]


def redact_regex(text: str) -> tuple[str, list[str]]:
    """Mengembalikan teks tersamar dan jenis data yang ditemukan (urutan kemunculan, tanpa duplikat)."""
    kinds: list[str] = []
    for kind, pattern, repl in _PATTERNS:
        text, n = pattern.subn(repl, text)
        if n and kind not in kinds:
            kinds.append(kind)
    return text, kinds


def mask_pii(text: str) -> str:
    return redact_regex(text)[0]
