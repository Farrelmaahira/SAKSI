import hmac
import os

from fastapi import Depends, FastAPI, Header, HTTPException

from app.audit import AuditRequest, AuditResponse, AuditUnavailable, active_providers, run_audit

API_KEY = os.environ.get("AI_API_KEY", "")
if not API_KEY:
    raise RuntimeError("AI_API_KEY wajib diatur (harus sama dengan AI_API_KEY di backend)")

app = FastAPI(title="SAKSI AI Engine", docs_url=None, redoc_url=None, openapi_url=None)


def require_key(x_api_key: str = Header(default="")) -> None:
    if not hmac.compare_digest(x_api_key.encode(), API_KEY.encode()):
        raise HTTPException(status_code=401, detail="api key tidak valid")


@app.get("/healthz")
def healthz() -> dict:
    return {"status": "ok", "providers": active_providers()}


@app.post("/v1/audit", response_model=AuditResponse, dependencies=[Depends(require_key)])
async def audit(req: AuditRequest) -> AuditResponse:
    try:
        return await run_audit(req)
    except AuditUnavailable:
        # Gagal tertutup: backend akan memakai rule auditor, bukan menganggap kontrak lolos.
        raise HTTPException(status_code=503, detail="audit AI tidak tersedia")
