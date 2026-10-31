import secrets
from fastapi import APIRouter, Header, HTTPException, Query
from app.config import REFRESH_TOKEN
from app.models import Fund
from app.services.amfi import AMFIError
from app.state import catalog

router = APIRouter(prefix="/api/v1")

@router.get("/health")
def health():
    return {"status": "ok", "service": "easyfolio-api"}

@router.get("/status")
def status():
    try:
        return catalog.ensure_fresh()
    except AMFIError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

@router.get("/schemes")
def list_schemes(
    q: str | None = None,
    category: str | None = None,
    beginner_tag: str | None = None,
    subcategory: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    try:
        metadata = catalog.ensure_fresh()
    except AMFIError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    funds = catalog.repository.list_funds(q, category, beginner_tag, subcategory)
    start = (page - 1) * limit
    return {"data": funds[start:start+limit], "page": page, "limit": limit, "total": len(funds), "metadata": metadata}

@router.get("/schemes/{scheme_code}")
def get_scheme(scheme_code: int):
    try:
        catalog.ensure_fresh()
    except AMFIError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    fund = catalog.repository.get_fund(scheme_code)
    if fund is None:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return {"data": fund, "metadata": catalog.status()}

@router.post("/internal/refresh")
def refresh(x_refresh_token: str | None = Header(default=None)):
    if not REFRESH_TOKEN:
        raise HTTPException(status_code=404, detail="Not found")
    if not x_refresh_token or not secrets.compare_digest(x_refresh_token, REFRESH_TOKEN):
        raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        return catalog.refresh()
    except AMFIError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
