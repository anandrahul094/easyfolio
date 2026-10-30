from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class Fund(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    scheme_code: int
    isin_growth: str
    scheme_name: str
    nav: Decimal
    nav_date: date
    plan: str = "direct"
    option: str = "growth"
    category: str | None = None
    beginner_tag: str | None = None
    amc_name: str | None = None

class DataStatus(BaseModel):
    source: str = "AMFI"
    status: str
    fetched_at: datetime | None = None
    latest_nav_date: date | None = None
    record_count: int = 0
    cache_expires_at: datetime | None = None
    message: str | None = None
