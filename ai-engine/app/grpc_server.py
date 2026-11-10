"""Server gRPC saksi.ai.v1.AiEngine, berjalan di event loop yang sama dengan FastAPI."""

import hmac
import time

import grpc
from grpc_health.v1 import health, health_pb2, health_pb2_grpc

from app import audit, contract_ai
from app.gen import ai_pb2_grpc

SERVICE = "saksi.ai.v1.AiEngine"


async def _deny(request, context):
    await context.abort(grpc.StatusCode.UNAUTHENTICATED, "x-api-key tidak valid")


_DENY = grpc.unary_unary_rpc_method_handler(_deny)


class _ApiKey(grpc.aio.ServerInterceptor):
    def __init__(self, key: str):
        self.key = key.encode()

    async def intercept_service(self, continuation, details):
        # Health check dibiarkan terbuka untuk load balancer; isinya tidak membocorkan apa pun.
        if details.method.startswith("/grpc.health.v1.Health/"):
            return await continuation(details)
        got = dict(details.invocation_metadata or ()).get("x-api-key", "")
        if hmac.compare_digest(got.encode(), self.key):
            return await continuation(details)
        return _DENY


async def _run(fn, request, context):
    remaining = context.time_remaining()
    deadline = None if remaining is None else time.monotonic() + remaining
    try:
        return await fn(request, deadline)
    except ValueError as e:
        await context.abort(grpc.StatusCode.INVALID_ARGUMENT, str(e))
    except audit.AuditUnavailable:
        # Gagal tertutup: pesan ini ditampilkan ke pengguna, tidak pernah OK dengan hasil karangan.
        await context.abort(grpc.StatusCode.UNAVAILABLE, audit.BUSY_MESSAGE)


class AiEngine(ai_pb2_grpc.AiEngineServicer):
    async def DraftContract(self, request, context):
        return await _run(contract_ai.draft_contract, request, context)

    async def AuditContract(self, request, context):
        return await _run(contract_ai.audit_contract, request, context)

    async def RedactText(self, request, context):
        return await _run(contract_ai.redact_text, request, context)


async def start(port: int, api_key: str, host: str = "[::]") -> tuple[grpc.aio.Server, int]:
    """Port 0 = port acak (untuk tes). Mengembalikan server dan port yang benar-benar dipakai."""
    server = grpc.aio.server(interceptors=[_ApiKey(api_key)])
    ai_pb2_grpc.add_AiEngineServicer_to_server(AiEngine(), server)
    health_servicer = health.aio.HealthServicer()
    health_pb2_grpc.add_HealthServicer_to_server(health_servicer, server)
    bound = server.add_insecure_port(f"{host}:{port}")
    await server.start()
    status = health_pb2.HealthCheckResponse.SERVING if audit.chain() else health_pb2.HealthCheckResponse.NOT_SERVING
    for name in (SERVICE, ""):
        await health_servicer.set(name, status)
    return server, bound
