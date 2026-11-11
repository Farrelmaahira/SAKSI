"""Benchmark model LLM dengan golden set lewat jalur kode produksi (contract_ai + rantai llm), satu model per putaran.

    .venv/bin/python -m evals.benchmark                          # semua model di AI_PROVIDERS (atau rantai bawaan)
    .venv/bin/python -m evals.benchmark --models gemini:gemini-3.8-flash groq:openai/gpt-oss-20b --tasks audit
    .venv/bin/python -m evals.benchmark --pause 12               # jeda antar panggilan, untuk batas token Groq gratis
    .venv/bin/python -m evals.benchmark --limit 6 --effort low   # 18 panggilan per model, di bawah kuota harian Gemini gratis

Memanggil API sungguhan (butuh GROQ_API_KEY/GEMINI_API_KEY di environment atau ai-engine/.env) dan memakai kuota."""

import argparse
import asyncio
import json
import logging
import os
import statistics
import time
from collections import Counter
from dataclasses import dataclass, field, replace
from pathlib import Path
from typing import Awaitable, Callable

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")  # sebelum app.llm dimuat; tidak menimpa env yang sudah ada

from app import contract_ai, llm  # noqa: E402
from app.gen import ai_pb2  # noqa: E402
from evals import golden, score  # noqa: E402
from evals.score import Check  # noqa: E402


@dataclass(frozen=True)
class Task:
    name: str
    metrics: tuple[str, ...]
    load: Callable[[], list]
    run: Callable[..., Awaitable[list[Check]]]  # (case) -> checks


async def _audit(case: golden.AuditCase) -> list[Check]:
    return score.score_audit(case, await contract_ai.audit_contract(case.request))


async def _draft(case: golden.DraftCase) -> list[Check]:
    return score.score_draft(case, await contract_ai.draft_contract(case.request))


async def _redact(case: golden.RedactCase) -> list[Check]:
    return score.score_redact(case, (await contract_ai.redact_text(ai_pb2.RedactTextRequest(text=case.text))).text)


TASKS = {
    "audit": Task("audit", score.AUDIT_METRICS, golden.load_audit_cases, _audit),
    "draft": Task("draft", score.DRAFT_METRICS, golden.load_draft_cases, _draft),
    "redact": Task("redact", score.REDACT_METRICS, golden.load_redact_cases, _redact),
}


@dataclass
class Outcome:
    case_id: str
    seconds: float
    checks: list[Check] | None  # None = model gagal menjawab
    reason: str = ""  # kode HTTP atau jenis galat dari log


@dataclass
class Summary:
    answered: int = 0
    failures: Counter = field(default_factory=Counter)  # alasan -> jumlah
    metrics: dict[str, tuple[int, int]] = field(default_factory=dict)  # metrik -> (lulus, total)
    misses: list[str] = field(default_factory=list)
    p50: float | None = None
    slowest: float | None = None


class _Reasons(logging.Handler):
    """Menangkap alasan gagal dari log rantai (llm.complete) tanpa mengubah kode produksi."""

    def __init__(self) -> None:
        super().__init__(logging.WARNING)
        self.reasons: list[str] = []

    def emit(self, record: logging.LogRecord) -> None:
        self.reasons.append(record.getMessage().rsplit(": ", 1)[-1])


async def run_task(task: Task, cases: list, pause: float = 0) -> list[Outcome]:
    handler = _Reasons()
    log = logging.getLogger("ai-engine")
    log.addHandler(handler)
    log.propagate = False
    outcomes = []
    try:
        for case in cases:
            handler.reasons.clear()
            started = time.monotonic()
            try:
                checks = await task.run(case)
            except llm.LlmUnavailable:
                checks = None
            seconds = time.monotonic() - started
            # RedactText tidak melempar saat LLM gagal (hasil regex tetap dikembalikan), jadi log juga jadi penanda gagal.
            if handler.reasons:
                checks = None
            outcomes.append(Outcome(case.id, seconds, checks, handler.reasons[-1] if handler.reasons else ""))
            if pause:
                await asyncio.sleep(pause)
    finally:
        log.removeHandler(handler)
    return outcomes


def summarize(task: Task, outcomes: list[Outcome]) -> Summary:
    s = Summary(metrics={m: (0, 0) for m in task.metrics})
    times = []
    for o in outcomes:
        if o.checks is None:
            s.failures[o.reason or "gagal"] += 1
            continue
        s.answered += 1
        times.append(o.seconds)
        for c in o.checks:
            ok, total = s.metrics[c.metric]
            s.metrics[c.metric] = (ok + c.ok, total + 1)
            if not c.ok:
                s.misses.append(f"{o.case_id}: {c.detail}")
    if times:
        s.p50, s.slowest = statistics.median(times), max(times)
    return s


def _fraction(ok: int, total: int) -> str:
    return f"{ok}/{total}" if total else "-"


def render(results: dict[str, dict[str, tuple[int, Summary]]]) -> str:
    """results[model][task] = (jumlah kasus, ringkasan). Keluaran Markdown siap ditempel ke docs."""
    out = []
    for name, task in TASKS.items():
        rows = {m: r[name] for m, r in results.items() if name in r}
        if not rows:
            continue
        out += [f"### {name}", "", "| Model | Menjawab | Gagal | " + " | ".join(task.metrics) + " | p50 (dtk) | Terlambat (dtk) |",
                "|---|---|---|" + "---|" * (len(task.metrics) + 2)]
        for model, (n, s) in rows.items():
            failed = ", ".join(f"{r}×{c}" for r, c in s.failures.most_common()) or "-"
            cells = [_fraction(*s.metrics[m]) for m in task.metrics]
            lat = [f"{s.p50:.1f}" if s.p50 is not None else "-", f"{s.slowest:.1f}" if s.slowest is not None else "-"]
            out.append(f"| {model} | {s.answered}/{n} | {failed} | " + " | ".join(cells + lat) + " |")
        out.append("")
    for model, tasks in results.items():
        misses = [f"{t}/{m}" for t, (_, s) in tasks.items() for m in s.misses]
        if misses:
            out += [f"**Meleset, {model}:**"] + [f"- {m}" for m in misses[:20]] + [""]
    return "\n".join(out)


async def main(argv: list[str] | None = None) -> None:
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    p.add_argument("--models", nargs="+", help='entri "provider:model"; bawaan = isi AI_PROVIDERS / rantai bawaan')
    p.add_argument("--tasks", nargs="+", choices=list(TASKS), default=list(TASKS))
    p.add_argument("--timeout", type=float, default=llm.TIMEOUT, help="batas per panggilan (detik); bawaan = produksi")
    p.add_argument("--pause", type=float, default=0, help="jeda antar panggilan (detik)")
    p.add_argument("--limit", type=int, help="maksimum kasus per tugas (untuk kuota harian kecil, mis. Gemini gratis 20 permintaan/hari/model)")
    p.add_argument("--effort", help="ganti reasoning_effort provider yang memakainya (mis. low) untuk putaran ini; produksi tidak berubah")
    p.add_argument("--json", type=Path, help="simpan ringkasan mentah ke berkas ini")
    args = p.parse_args(argv)

    llm.TIMEOUT = args.timeout
    if args.effort:
        for name, provider in llm.PROVIDERS.items():
            if "reasoning_effort" in provider.extra:
                llm.PROVIDERS[name] = replace(provider, extra={"reasoning_effort": args.effort})
    models = args.models or [f"{name}:{model}" for name, model in llm.chain()]
    results: dict[str, dict[str, tuple[int, Summary]]] = {}
    for model in models:
        os.environ["AI_PROVIDERS"] = model  # rantai satu entri: yang diukur persis model ini, tanpa fallback
        if len(llm.chain()) != 1:
            print(f"# lewati {model}: provider tidak dikenal atau API key-nya kosong")
            continue
        results[model] = {}
        for name in args.tasks:
            task = TASKS[name]
            cases = task.load()[: args.limit]
            print(f"# {model} / {name} ({len(cases)} kasus)", flush=True)
            results[model][name] = (len(cases), summarize(task, await run_task(task, cases, args.pause)))
    print("\n" + render(results))
    if args.json:
        args.json.write_text(json.dumps({m: {t: {"kasus": n, **s.__dict__, "failures": dict(s.failures)} for t, (n, s) in r.items()}
                                         for m, r in results.items()}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
