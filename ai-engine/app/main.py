import hmac
import logging
import os
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Header, HTTPException

from app import grpc_server
from app.audit import AuditRequest, AuditResponse, BUSY_MESSAGE, AuditUnavailable, chain, run_audit

log = logging.getLogger("ai-engine")

API_KEY = os.environ.get("AI_API_KEY", "")
if not API_KEY:
    raise RuntimeError("AI_API_KEY wajib diatur (harus sama dengan AI_API_KEY di backend)")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # gRPC berjalan di samping REST. GRPC_PORT=0 mematikannya; gagal bind tidak boleh mematikan REST.
    server = None
    port = int(os.getenv("GRPC_PORT", "50051"))
    if port:
        try:
            server, bound = await grpc_server.start(port, API_KEY)
            log.warning("gRPC %s aktif di port %d", grpc_server.SERVICE, bound)
        except Exception:
            log.exception("gRPC gagal dijalankan; REST /v1/audit tetap hidup")
    yield
    if server:
        await server.stop(5)


app = FastAPI(title="SAKSI AI Engine", docs_url=None, redoc_url=None, openapi_url=None, lifespan=lifespan)


def require_key(x_api_key: str = Header(default="")) -> None:
    if not hmac.compare_digest(x_api_key.encode(), API_KEY.encode()):
        raise HTTPException(status_code=401, detail="api key tidak valid")


@app.get("/healthz")
def healthz() -> dict:
    return {"status": "ok", "providers": [f"{n}:{m}" for n, m in chain()]}


@app.post("/v1/audit", response_model=AuditResponse, dependencies=[Depends(require_key)])
async def audit(req: AuditRequest) -> AuditResponse:
    try:
        return await run_audit(req)
    except AuditUnavailable:
        # Gagal tertutup: pesan ini diteruskan ke pengguna, tidak pernah menganggap kontrak lolos.
        raise HTTPException(status_code=503, detail=BUSY_MESSAGE)
