import csv
import hashlib
import io
import re
from datetime import datetime
from decimal import Decimal, InvalidOperation
import requests
from app.models import Fund

DIRECT = re.compile(r"\bdirect\b", re.I)
GROWTH = re.compile(r"\bgrowth\b", re.I)
EXCLUDE = re.compile(r"\b(idcw|dividend|payout|reinvestment)\b", re.I)

class AMFIError(RuntimeError):
    pass

def fetch_feed(url: str, timeout: int = 30):
    try:
        response = requests.get(url, timeout=(10, timeout), headers={"User-Agent": "EasyFolio/1.0"})
        response.raise_for_status()
    except requests.RequestException as exc:
        raise AMFIError(f"AMFI request failed: {exc}") from exc
    raw = response.content
    if not raw:
        raise AMFIError("AMFI returned an empty feed")
    content = raw.decode("utf-8-sig", errors="replace")
    if "<html" in content[:1000].lower() or "<!doctype" in content[:1000].lower():
        raise AMFIError("AMFI returned HTML instead of NAV text")
    return content, hashlib.sha256(raw).hexdigest()

def parse_nav_date(value: str):
    for fmt in ("%d-%b-%Y", "%d-%b-%y", "%d/%m/%Y"):
        try:
            return datetime.strptime(value.strip(), fmt).date()
        except ValueError:
            pass
    raise ValueError(f"Unsupported NAV date: {value}")

def parse_feed(content: str):
    reader = csv.reader(io.StringIO(content), delimiter=";")
    funds, rejected, rows_seen = {}, 0, 0
    for row in reader:
        row = [cell.strip() for cell in row]
        if len(row) < 6 or row[0].casefold() in {"scheme code", "scheme_code"}:
            continue
        try:
            code = int(row[0]); isin = row[1]; name = row[3]
            nav = Decimal(row[4].replace(",", "")); nav_date = parse_nav_date(row[5])
            rows_seen += 1
            if not isin or isin == "-" or not name or not nav.is_finite() or nav <= 0:
                rejected += 1; continue
            if not DIRECT.search(name) or not GROWTH.search(name) or EXCLUDE.search(name):
                continue
            funds[code] = Fund(scheme_code=code, isin_growth=isin, scheme_name=name, nav=nav, nav_date=nav_date)
        except (ValueError, InvalidOperation, IndexError):
            rejected += 1
    if rows_seen == 0 or not funds:
        raise AMFIError("No valid Direct Growth NAV records; feed may have changed")
    return list(funds.values()), {"rows_seen": rows_seen, "rejected": rejected}
