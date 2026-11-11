"""Helper bersama untuk tes: penyedia LLM palsu, panggilan gRPC sungguhan ke port acak, dan pembuat pasal."""

import asyncio

import grpc
import httpx
import pytest
from grpc_health.v1 import health_pb2_grpc

from app import grpc_server
from app.gen import ai_pb2, ai_pb2_grpc


def fake(responses, calls=None):
    """Mengganti llm.call_provider. Kunci "provider:model" atau "provider"; nilainya teks jawaban atau galat.
    Bila calls diberikan, setiap percobaan dicatat sebagai "provider:model"."""
    async def call(name, model, system, user, timeout=None):
        key = f"{name}:{model}"
        if calls is not None:
            calls.append(key)
        r = responses.get(key, responses.get(name))
        if isinstance(r, Exception):
            raise r
        return r, key
    return call


def http_error(code: int) -> httpx.HTTPStatusError:
    req = httpx.Request("POST", "https://llm.test")
    return httpx.HTTPStatusError(str(code), request=req, response=httpx.Response(code, request=req))


def rpc(method, request, key="test-key"):
    """Menjalankan satu panggilan lewat server gRPC sungguhan di port acak. method="Health" memanggil health check."""
    async def go():
        server, port = await grpc_server.start(0, "test-key", host="127.0.0.1")
        try:
            async with grpc.aio.insecure_channel(f"127.0.0.1:{port}") as ch:
                if method == "Health":
                    return await health_pb2_grpc.HealthStub(ch).Check(request)
                metadata = (("x-api-key", key),) if key is not None else None
                return await getattr(ai_pb2_grpc.AiEngineStub(ch), method)(request, metadata=metadata, timeout=13)
        finally:
            await server.stop(None)
    return asyncio.run(go())


def code_of(method, request, key="test-key"):
    """Status code gRPC dari panggilan yang diharapkan gagal."""
    with pytest.raises(grpc.aio.AioRpcError) as e:
        rpc(method, request, key)
    return e.value.code()


def clauses(rows, ref=0):
    """rows = [(kode_pasal, judul, isi), ...]; urutan mengikuti posisi."""
    return [ai_pb2.Clause(kode_pasal=k, judul=j, isi=i, urutan=n, legal_reference_id=ref) for n, (k, j, i) in enumerate(rows, 1)]
