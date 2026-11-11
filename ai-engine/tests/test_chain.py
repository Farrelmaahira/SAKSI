"""Rantai fallback antar model (AI_PROVIDERS): format entri, urutan, lompat saat gagal, deadline, pesan akhir."""

import asyncio
import json
import logging
import time

import grpc
import httpx
import pytest
from fastapi.testclient import TestClient

from app import llm
from app.main import app
from support import fake, http_error, rpc
from test_grpc import AUDIT, NO_FINDINGS

DEFAULT = [
    ("gemini", "gemini-3-flash-preview"),
    ("groq", "qwen/qwen3.8-27b"),
    ("groq", "openai/gpt-oss-120b"),
    ("gemini", "gemini-3.5-flash"),
]


@pytest.fixture
def default_chain(monkeypatch):
    monkeypatch.delenv("AI_PROVIDERS")


def test_default_chain_order(default_chain):
    assert llm.chain() == DEFAULT


def test_chain_entry_formats(monkeypatch):
    # Titik dua pertama memisahkan provider dan model; tanpa model -> GROQ_MODEL/GEMINI_MODEL (format lama di Azure).
    monkeypatch.setenv("AI_PROVIDERS", "groq:openai/gpt-oss-120b, gemini ,tidak-dikenal:x,groq")
    assert llm.chain() == [("groq", "openai/gpt-oss-120b"), ("gemini", "test"), ("groq", "test")]


def test_provider_without_api_key_is_skipped(monkeypatch, default_chain):
    monkeypatch.delenv("GEMINI_API_KEY")
    assert llm.chain() == [("groq", "qwen/qwen3.8-27b"), ("groq", "openai/gpt-oss-120b")]


def test_failures_move_to_next_model_in_order(monkeypatch, default_chain, caplog):
    calls = []
    monkeypatch.setattr(llm, "call_provider", fake({
        "gemini:gemini-3-flash-preview": http_error(400),  # mis. model menolak reasoning_effort
        "groq:qwen/qwen3.8-27b": http_error(429),
        "groq:openai/gpt-oss-120b": httpx.ReadTimeout("lambat"),
        "gemini:gemini-3.5-flash": NO_FINDINGS,
    }, calls))
    with caplog.at_level(logging.WARNING, logger="ai-engine"):
        res = rpc("AuditContract", AUDIT)
    assert calls == [f"{p}:{m}" for p, m in DEFAULT]
    assert res.model == "gemini:gemini-3.5-flash"
    # Log memuat model dan alasan, tidak memuat isi kontrak.
    assert "groq:qwen/qwen3.8-27b gagal: 429" in caplog.text and "gemini:gemini-3-flash-preview gagal: 400" in caplog.text
    assert "diatur kemudian" not in caplog.text


def test_invalid_output_counts_as_failure(monkeypatch, default_chain):
    calls = []
    unknown_kode = json.dumps({"findings": [{"kode_pasal": "P-99", "tingkat": "SARAN", "pesan": "x"}]})
    monkeypatch.setattr(llm, "call_provider", fake({"gemini:gemini-3-flash-preview": unknown_kode, "groq": NO_FINDINGS}, calls))
    assert rpc("AuditContract", AUDIT).model == "groq:qwen/qwen3.8-27b" and len(calls) == 2


def test_first_success_stops_the_chain(monkeypatch, default_chain):
    calls = []
    monkeypatch.setattr(llm, "call_provider", fake({"gemini": NO_FINDINGS, "groq": NO_FINDINGS}, calls))
    assert rpc("AuditContract", AUDIT).model == "gemini:gemini-3-flash-preview" and len(calls) == 1


def test_all_fail_returns_busy_message_on_grpc_and_rest(monkeypatch, default_chain):
    monkeypatch.setattr(llm, "call_provider", fake({"gemini": http_error(503), "groq": http_error(429)}))
    with pytest.raises(grpc.aio.AioRpcError) as e:
        rpc("AuditContract", AUDIT)
    assert e.value.code() == grpc.StatusCode.UNAVAILABLE and e.value.details() == llm.BUSY_MESSAGE

    r = TestClient(app).post("/v1/audit", json={"contractText": "x", "checklist": ["a"]}, headers={"X-API-Key": "test-key"})
    assert r.status_code == 503 and r.json()["detail"] == llm.BUSY_MESSAGE


def test_no_attempt_after_deadline(monkeypatch, default_chain):
    calls = []
    monkeypatch.setattr(llm, "call_provider", fake({"gemini": NO_FINDINGS}, calls))
    with pytest.raises(llm.LlmUnavailable):
        asyncio.run(llm.complete("s", "u", str, deadline=0))  # deadline sudah lewat
    assert calls == []


def test_reasoning_effort_belongs_to_provider_not_model(monkeypatch):
    sent = {}

    def handler(request):
        sent[request.url.host] = json.loads(request.content)
        return httpx.Response(200, json={"choices": [{"message": {"content": "{}"}}]})

    real = httpx.AsyncClient
    monkeypatch.setattr(llm.httpx, "AsyncClient", lambda **kw: real(transport=httpx.MockTransport(handler), **kw))
    asyncio.run(llm.call_provider("gemini", "gemini-3.5-flash", "s", "u"))
    asyncio.run(llm.call_provider("groq", "openai/gpt-oss-120b", "s", "u"))
    assert sent["generativelanguage.googleapis.com"]["reasoning_effort"] == "minimal"
    assert "reasoning_effort" not in sent["api.groq.com"] and sent["api.groq.com"]["model"] == "openai/gpt-oss-120b"


def test_slow_trickling_response_is_cut_at_total_timeout(monkeypatch):
    monkeypatch.setattr(llm, "TIMEOUT", 0.5)
    # Jawaban yang menetes tidak kena timeout per fase httpx; harus tetap dipotong oleh batas total.
    async def trickle():
        for _ in range(10):
            await asyncio.sleep(0.2)
            yield b" "

    real = httpx.AsyncClient
    monkeypatch.setattr(llm.httpx, "AsyncClient", lambda **kw: real(transport=httpx.MockTransport(lambda r: httpx.Response(200, content=trickle())), **kw))
    monkeypatch.setenv("AI_PROVIDERS", "groq:x")
    started = time.monotonic()
    with pytest.raises(llm.LlmUnavailable):
        asyncio.run(llm.complete("s", "u", str))  # TIMEOUT dikecilkan di bawah
    assert time.monotonic() - started < 1.5
