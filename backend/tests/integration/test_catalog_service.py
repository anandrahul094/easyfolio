from datetime import datetime, timedelta, timezone
from decimal import Decimal

import pytest

from app.models import Fund
from app.repositories.memory import InMemoryFundRepository
from app.services import catalog as catalog_module
from app.services.amfi import AMFIError
from app.services.catalog import CatalogService

FIXTURE_FEED = (
    "Scheme Code;ISIN Div Payout/ ISIN Growth;ISIN Div Reinvestment;Scheme Name;Plan;Option;Net Asset Value;Date\n"
    "Open Ended Schemes(Equity Scheme - Large Cap Fund)\n"
    "Acme Mutual Fund\n"
    "100201;INF000000201;-;Acme Large Cap Fund;Direct Plan;Growth Option;25.4200;30-Oct-2026\n"
)


def sample_fund(code=999001, name="Cached Sample Fund"):
    return Fund(
        scheme_code=code, isin_growth="INF000000999", scheme_name=name,
        nav=Decimal("10.2500"), nav_date=datetime(2026, 10, 30).date(),
        category="Debt", subcategory="Liquid Fund",
    )


@pytest.mark.integration
def test_refresh_parses_feed_and_atomically_replaces_repository_snapshot(monkeypatch):
    repository = InMemoryFundRepository()
    repository.replace_snapshot([sample_fund()])
    service = CatalogService(repository)
    monkeypatch.setattr(catalog_module, "fetch_feed", lambda *_args: (FIXTURE_FEED, "fixture-hash"))

    status = service.refresh()
    funds = repository.list_funds()

    assert status.status == "ready"
    assert status.source == "AMFI"
    assert status.record_count == 1
    assert status.latest_nav_date.isoformat() == "2026-10-30"
    assert funds[0].scheme_code == 100201
    assert funds[0].amc_name == "Acme Mutual Fund"
    assert service.expires_at > service.fetched_at


@pytest.mark.integration
def test_cache_hit_avoids_network_fetch_until_expiry(monkeypatch):
    repository = InMemoryFundRepository()
    repository.replace_snapshot([sample_fund()])
    service = CatalogService(repository)
    service.fetched_at = datetime.now(timezone.utc)
    service.expires_at = service.fetched_at + timedelta(minutes=10)
    service.latest_nav_date = sample_fund().nav_date
    monkeypatch.setattr(catalog_module, "fetch_feed", lambda *_args: pytest.fail("unexpected AMFI fetch on cache hit"))

    status = service.ensure_fresh()

    assert status.status == "ready"
    assert status.record_count == 1
    assert repository.get_fund(999001).scheme_name == "Cached Sample Fund"


@pytest.mark.integration
def test_network_failure_retains_last_good_snapshot_and_marks_it_stale(monkeypatch):
    repository = InMemoryFundRepository()
    repository.replace_snapshot([sample_fund()])
    service = CatalogService(repository)
    monkeypatch.setattr(catalog_module, "fetch_feed", lambda *_args: (_ for _ in ()).throw(AMFIError("network timeout")))

    status = service.refresh()

    assert status.status == "stale"
    assert status.message == "network timeout"
    assert status.record_count == 1
    assert repository.get_fund(999001).scheme_name == "Cached Sample Fund"


@pytest.mark.integration
def test_first_refresh_failure_raises_instead_of_claiming_empty_data_is_ready(monkeypatch):
    service = CatalogService(InMemoryFundRepository())
    monkeypatch.setattr(catalog_module, "fetch_feed", lambda *_args: (_ for _ in ()).throw(AMFIError("AMFI unavailable")))

    with pytest.raises(AMFIError, match="AMFI unavailable"):
        service.refresh()

    assert service.repository.list_funds() == []


@pytest.mark.integration
def test_invalid_new_feed_does_not_replace_a_valid_cached_snapshot(monkeypatch):
    repository = InMemoryFundRepository()
    repository.replace_snapshot([sample_fund()])
    service = CatalogService(repository)
    monkeypatch.setattr(catalog_module, "fetch_feed", lambda *_args: ("not an AMFI NAV feed", "bad-hash"))

    status = service.refresh()

    assert status.status == "stale"
    assert repository.get_fund(999001).scheme_name == "Cached Sample Fund"
