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
SECTION = re.compile(r"^(?:Open Ended|Close Ended|Interval)(?: Fund)? Schemes\s*\((.+)\)$", re.I)

CATEGORY_GROUPS = {
    "equity scheme": "Equity", "equity schemes": "Equity",
    "debt scheme": "Debt", "debt schemes": "Debt",
    "income/debt oriented schemes": "Debt",
    "hybrid scheme": "Hybrid", "hybrid schemes": "Hybrid",
    "life cycle funds": "Life Cycle",
    "solution oriented scheme": "Solution Oriented",
    "solution oriented schemes": "Solution Oriented",
    "other scheme": "Other", "other schemes": "Other",
    "exchange traded funds (etfs)": "Other", "index funds": "Other",
    "fund of funds scheme (domestic)": "Other", "overseas fund of funds": "Other",
}


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


def normalize_text(value: str) -> str:
    """Trim feed text and collapse runs of whitespace into one readable space."""
    return re.sub(r"\\s+", " ", value).strip()


def parse_category_header(line: str):
    match = SECTION.match(line.strip())
    if not match:
        return None, None
    heading = match.group(1).strip()
    if " - " not in heading:
        return None, None
    group, subcategory = (part.strip() for part in heading.split(" - ", 1))
    category = CATEGORY_GROUPS.get(group.casefold())
    if not category or not subcategory:
        return None, None
    subcategory = re.sub(r"\s+", " ", subcategory).strip()
    subcategory = subcategory.replace("Sectoral/ Thematic", "Sectoral/Thematic")
    return category, subcategory


def parse_feed(content: str):
    reader = csv.reader(io.StringIO(content), delimiter=";")
    funds, rejected, rows_seen = {}, 0, 0
    current_category, current_subcategory = None, None
    current_amc = None
    awaiting_amc_name = False

    for row in reader:
        row = [cell.strip() for cell in row]
        if not row:
            continue
        if len(row) == 1:
            section_match = SECTION.match(row[0].strip())
            if section_match:
                # A current-format AMFI section is followed by its fund-house
                # name. Reset context at each new section to prevent leakage.
                current_category, current_subcategory = parse_category_header(row[0])
                current_amc = None
                awaiting_amc_name = True
            elif awaiting_amc_name:
                current_amc = normalize_text(row[0]) or None
                awaiting_amc_name = False
            continue
        if len(row) < 6 or row[0].casefold() in {"scheme code", "scheme_code"}:
            continue

        try:
            code, isin = int(row[0]), row[1]
            name = normalize_text(row[3])
            if len(row) >= 8:
                plan, option = row[4], row[5]
                nav_value, date_value = row[6], row[7]
                is_direct_growth = DIRECT.search(plan) and GROWTH.search(option) and not EXCLUDE.search(option)
            else:
                nav_value, date_value = row[4], row[5]
                is_direct_growth = DIRECT.search(name) and GROWTH.search(name) and not EXCLUDE.search(name)

            nav = Decimal(nav_value.replace(",", ""))
            nav_date = parse_nav_date(date_value)
            rows_seen += 1
            if not isin or isin == "-" or not name or not nav.is_finite() or nav <= 0:
                rejected += 1
                continue
            if not is_direct_growth:
                continue
            funds[code] = Fund(
                scheme_code=code, isin_growth=isin, scheme_name=name,
                nav=nav, nav_date=nav_date,
                category=current_category, subcategory=current_subcategory,
                amc_name=current_amc,
            )
        except (ValueError, InvalidOperation, IndexError):
            rejected += 1

    if rows_seen == 0 or not funds:
        raise AMFIError("No valid Direct Growth NAV records; feed may have changed")
    return list(funds.values()), {"rows_seen": rows_seen, "rejected": rejected}
