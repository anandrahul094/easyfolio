# Backend integration tests

Service and API integration suites will live here.

Planned first cases:
- CatalogService.refresh: mocked fetch_feed succeeds and replaces the repository snapshot.
- AMFI network timeout/HTTP failure: retain a previous snapshot, mark it stale and expose an error status.
- Invalid or empty AMFI payload: do not replace a valid cached snapshot with an empty one.
- FastAPI TestClient: health/status/list/detail endpoints, filters, pagination, 404 and refresh-token checks.

Keep live AMFI network calls out of CI. Inject or monkeypatch the feed client and use deterministic fixtures.
