from datetime import datetime, timedelta, timezone
from threading import RLock
from app.config import AMFI_URL, CACHE_TTL_SECONDS, REQUEST_TIMEOUT_SECONDS
from app.repositories.base import FundRepository
from app.models import DataStatus
from app.services.amfi import fetch_feed, parse_feed, AMFIError

class CatalogService:
    def __init__(self, repository: FundRepository):
        self.repository = repository; self.lock = RLock()
        self.fetched_at = None; self.expires_at = None; self.latest_nav_date = None; self.last_error = None

    def status(self):
        funds = self.repository.list_funds()
        return DataStatus(status="stale" if self.last_error and funds else ("ready" if funds else "empty"), fetched_at=self.fetched_at, latest_nav_date=self.latest_nav_date, record_count=len(funds), cache_expires_at=self.expires_at, message=self.last_error)

    def refresh(self):
        with self.lock:
            try:
                content, _digest = fetch_feed(AMFI_URL, REQUEST_TIMEOUT_SECONDS)
                funds, _stats = parse_feed(content)
                self.repository.replace_snapshot(funds)
                self.fetched_at = datetime.now(timezone.utc)
                self.expires_at = self.fetched_at + timedelta(seconds=CACHE_TTL_SECONDS)
                self.latest_nav_date = max(f.nav_date for f in funds)
                self.last_error = None
            except Exception as exc:
                self.last_error = str(exc)
                if not self.repository.list_funds(): raise AMFIError(self.last_error) from exc
            return self.status()

    def ensure_fresh(self):
        if self.expires_at is None or datetime.now(timezone.utc) >= self.expires_at: return self.refresh()
        return self.status()
