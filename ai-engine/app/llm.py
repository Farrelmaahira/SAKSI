"""Pemanggil LLM bersama untuk semua use case: rantai model (provider:model) dengan fallback otomatis.

Alur: complete() mencoba model di AI_PROVIDERS berurutan. 429, 503, timeout, atau jawaban yang tidak lolos validasi
berarti langsung ke model berikutnya, dibatasi sisa deadline pemanggil. Semua gagal -> LlmUnavailable.
Menambah provider: tambahkan satu entri di PROVIDERS (endpoint harus kompatibel OpenAI)."""

import asyncio
import json
import logging
import os
import re
import time
from dataclasses import dataclass, field
from typing import Callable, TypeVar

import httpx
from pydantic import ValidationError

from app.pii import mask_pii

log = logging.getLogger("ai-engine")
T = TypeVar("T")


@dataclass(frozen=True)
class Provider:
    url: str
    key_env: str  # nama env berisi API key; provider tanpa key dilewati
    model_env: str  # env pengganti model untuk entri AI_PROVIDERS tanpa ":model" (format lama di Azure)
    default_model: str
    # Parameter tambahan yang melekat ke provider, bukan ke model. Model yang menolaknya cukup dihitung gagal.
    extra: dict = field(default_factory=dict)


PROVIDERS = {
    "groq": Provider("https://api.groq.com/openai/v1/chat/completions", "GROQ_API_KEY", "GROQ_MODEL", "qwen/qwen3.8-27b"),
    # Gemini 3 "berpikir" dulu; minimal memangkas ~7 dtk jadi ~3 dtk dengan hasil audit yang sama.
    "gemini": Provider(
        "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        "GEMINI_API_KEY", "GEMINI_MODEL", "gemini-3-flash-preview", {"reasoning_effort": "minimal"},
    ),
}
# Urutan dari benchmark (kualitas temuan, lalu kecepatan); hasil terakhir di docs/ai-engine.md.
DEFAULT_CHAIN = "gemini:gemini-3-flash-preview,groq:qwen/qwen3.8-27b,groq:openai/gpt-oss-120b,gemini:gemini-3.5-flash"
TIMEOUT = float(os.getenv("AI_PROVIDER_TIMEOUT", "6"))  # batas per percobaan (detik)
BUSY_MESSAGE = "Layanan AI sedang penuh. Coba lagi beberapa menit lagi, atau lanjutkan menyunting pasal secara manual."


class LlmUnavailable(Exception):
    """Semua model di rantai gagal atau jawabannya tidak lolos validasi. Pesannya aman ditampilkan ke pengguna."""


async def call_provider(name: str, model: str, system: str, user: str, timeout: float = TIMEOUT) -> tuple[str, str]:
    """Satu panggilan chat completion. Mengembalikan (isi jawaban, "provider:model")."""
    p = PROVIDERS[name]
    # timeout httpx berlaku per fase (connect/read) sehingga jawaban yang menetes bisa melewati batas;
    # asyncio.timeout menjadikannya batas total, yang dibutuhkan agar rantai sempat pindah sebelum deadline gRPC.
    async with asyncio.timeout(timeout), httpx.AsyncClient(timeout=timeout) as client:
        r = await client.post(
            p.url,
            headers={"Authorization": f"Bearer {os.environ[p.key_env]}"},
            json={
                "model": model,
                "temperature": 0,
                "response_format": {"type": "json_object"},
                "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
                **p.extra,
            },
        )
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"], f"{name}:{model}"


def chain() -> list[tuple[str, str]]:
    """Rantai (provider, model) dari AI_PROVIDERS. Entri tanpa ":model" memakai GROQ_MODEL/GEMINI_MODEL;
    provider tak dikenal atau tanpa API key dilewati."""
    out = []
    for entry in os.getenv("AI_PROVIDERS", DEFAULT_CHAIN).split(","):
        name, _, model = entry.strip().partition(":")  # titik dua pertama; nama model boleh berisi "/"
        if name in PROVIDERS and os.getenv(PROVIDERS[name].key_env):
            out.append((name, model or os.getenv(PROVIDERS[name].model_env, PROVIDERS[name].default_model)))
    return out


async def complete(system: str, user: str, parse: Callable[[str], T], deadline: float | None = None) -> tuple[T, str]:
    """Jalankan rantai sampai ada jawaban yang lolos parse(). deadline = waktu time.monotonic() saat pemanggil
    berhenti menunggu (None = tanpa batas). Mengembalikan (hasil parse, "provider:model" yang menjawab)."""
    for name, model in chain():
        timeout = TIMEOUT
        if deadline is not None:
            timeout = min(TIMEOUT, deadline - time.monotonic() - 0.3)  # sisakan 0,3 dtk untuk membalas
            if timeout < 1:
                break
        try:
            content, used = await call_provider(name, model, system, user, timeout)
            return parse(content), used
        except (httpx.HTTPError, TimeoutError, KeyError, IndexError, ValueError, ValidationError) as e:
            # Hanya nama model dan kode HTTP / jenis galat; isi kontrak tidak pernah dicatat.
            reason = e.response.status_code if isinstance(e, httpx.HTTPStatusError) else type(e).__name__
            log.warning("%s:%s gagal: %s", name, model, reason)
    raise LlmUnavailable(BUSY_MESSAGE)


def json_object(content: str) -> dict:
    """Ambil objek JSON dari jawaban model (toleran terhadap pagar ```json)."""
    start, end = content.find("{"), content.rfind("}")
    if start < 0 or end < start:
        raise ValueError("tidak ada JSON")
    return json.loads(content[start : end + 1])


def fence(text: str, tag: str) -> str:
    """Bungkus DATA dalam <tag>. PII disamarkan dulu karena teks dikirim ke provider eksternal, dan tag yang sama di
    dalam teks dinetralkan agar tidak bisa menutup blok lalu menyisipkan perintah."""
    body = re.sub(rf"</?\s*{tag}\s*>", f"[{tag}]", mask_pii(text), flags=re.IGNORECASE)
    return f"<{tag}>\n{body}\n</{tag}>"
