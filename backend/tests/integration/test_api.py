from datetime import datetime, timedelta, timezone
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient

from app import api as api_module
from app.main import app
from app.models import Fund
from app.repositories.memory import InMemoryFundRepository
from app.services.amfi import AMFIError
from app.services.catalog import CatalogService


@pytest.fixture
def api_client(monkeypatch):
    repository = InMemoryFundRepository()
    repository.replace_snapshot([
        Fund(scheme_code=1001, isin_growth="INF000001001", scheme_name="Alpha Equity Fund", nav=Decimal("25.1234"), nav_date=datetime(2026, 10, 30).date(), category="Equity", subcategory="Large Cap Fund", amc_name="Alpha AMC"),
        Fund(scheme_code=1002, isin_growth="INF000001002", scheme_name="Beta Liquid Fund", nav=Decimal("10.5000"), nav_date=datetime(2026, 10, 30).date(), category="Debt", subcategory="Liquid Fund", amc_name="Beta AMC"),
        Fund(scheme_code=1003, isin_growth="INF000001003", scheme_name="Gamma Equity Fund", nav=Decimal("15.0000"), nav_date=datetime(2026, 10, 30).date(), category="Equity", subcategory="Mid Cap Fund", amc_name="Gamma AMC"),
    ])
    service = CatalogService(repository)
    service.fetched_at = datetime.now(timezone.utc)
    service.expires_at = service.fetched_at + timedelta(minutes=10)
    service.latest_nav_date = datetime(2026, 10, 30).date()
    monkeypatch.setattr(api_module, "catalog", service)
    monkeypatch.setattr(api_module, "REFRESH_TOKEN", "qa-test-token")
    return TestClient(app), service


@pytest.mark.integration
def test_health_endpoint_returns_service_status(api_client):
    client, _service = api_client
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "easyfolio-api"}


@pytest.mark.integration
def test_scheme_list_supports_search_category_and_pagination(api_client):
    client, _service = api_client
    response = client.get("/api/v1/schemes", params={"category": "Equity", "page": 2, "limit": 1})

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 2
    assert body["page"] == 2
    assert len(body["data"]) == 1
    assert body["data"][0]["scheme_code"] == 1003

    search = client.get("/api/v1/schemes", params={"q": "Beta Liquid"})
    assert search.status_code == 200
    assert [item["scheme_code"] for item in search.json()["data"]] == [1002]


@pytest.mark.integration
def test_scheme_detail_returns_source_fields_and_unknown_code_is_404(api_client):
    client, _service = api_client
    response = client.get("/api/v1/schemes/1001")

    assert response.status_code == 200
    assert response.json()["data"]["amc_name"] == "Alpha AMC"
    assert response.json()["data"]["isin_growth"] == "INF000001001"
    assert client.get("/api/v1/schemes/9999").status_code == 404


@pytest.mark.integration
def test_invalid_pagination_is_rejected_by_api_validation(api_client):
    client, _service = api_client
    assert client.get("/api/v1/schemes", params={"page": 0}).status_code == 422
    assert client.get("/api/v1/schemes", params={"limit": 101}).status_code == 422


@pytest.mark.integration
def test_manual_refresh_requires_token_and_calls_catalog_only_with_valid_token(api_client, monkeypatch):
    client, service = api_client
    calls = []
    monkeypatch.setattr(service, "refresh", lambda: calls.append("refresh") or service.status())

    assert client.post("/api/v1/internal/refresh").status_code == 401
    assert client.post("/api/v1/internal/refresh", headers={"X-Refresh-Token": "wrong"}).status_code == 401
    response = client.post("/api/v1/internal/refresh", headers={"X-Refresh-Token": "qa-test-token"})
    assert response.status_code == 200
    assert calls == ["refresh"]


@pytest.mark.integration
def test_catalog_unavailable_returns_503_not_an_empty_success(api_client, monkeypatch):
    client, service = api_client
    def unavailable():
        raise AMFIError("upstream unavailable")
    monkeypatch.setattr(service, "ensure_fresh", unavailable)

    response = client.get("/api/v1/schemes")
    assert response.status_code == 503
    assert "upstream unavailable" in response.json()["detail"]
