# Easyfolio market-data provider and ingestion architecture

**Status:** Research baseline — implementation gated on provider agreements and approved display rights  
**Date:** 2026-11-03  
**Branch:** `research/market-data-provider-architecture`

## 1. Executive decision

Do not connect an unofficial scraper, browser endpoint, broker-only API, or personal/free API key to the public Markets page. Easyfolio needs documented rights to ingest, store, transform, display, and retain each dataset for the exact public educational use case.

Build one normalized ingestion pipeline behind provider adapters. Keep the existing Markets learning content available while price observations remain unavailable. The API must fail closed per asset/provider and must never invent values or silently substitute a different benchmark.

## 2. Asset-by-asset source shortlist

| Easyfolio card | Primary source to approach | Dataset to request | Important qualification |
|---|---|---|---|
| NIFTY 50 | NSE Data & Analytics | Daily EOD / historical index observations | Obtain explicit public website display and educational redistribution rights; request permitted history depth and 30-day delayed delivery if applicable. |
| BANK NIFTY | NSE Data & Analytics | Daily EOD / historical index observations | Same NSE agreement; confirm the precise index identifier and permitted index display. |
| SENSEX | BSE market-data service | Daily index OHLC / EOD / historical observations | BSE offers API-based index OHLC and historical products; contract must permit public website display and storage. |
| GOLD | IBJA official rates API, with MCX as an alternative benchmark | Gold 999 PM benchmark, ideally INR per 10g; history if licensed | IBJA's published API FAQ says website publication requires prior written permission. MCX data is governed by its own agreement. Decide whether the card means Indian bullion benchmark or a specified MCX futures contract. |
| SILVER | IBJA official rates API, with MCX as an alternative benchmark | Silver 999 PM benchmark, ideally INR per kg; history if licensed | Same publication-rights gate as gold. Define purity/session and do not mix spot benchmark with futures settlement. |
| USD / INR | FBIL | Daily USD/INR reference-rate history | FBIL states commercial website use of its website data is not authorized without written permission. Obtain permission/API terms; define this as the FBIL reference rate, not an intraday trading quote. |

### Official source references

- SEBI educational price-data circular (8 May 2026): https://www.sebi.gov.in/legal/circulars/may-2026/norms-for-sharing-and-usage-of-price-data-for-educational-purposes_101293.html
- NSE Data & Analytics products and tariffs: https://www.nse.in/static/nse-data-and-analytics/data-information-vending
- NSE Data Sharing & Usage Policy: https://www.nseindia.com/static/market-data/nse-data-policy
- BSE Self Data Feed: https://marketdata.bseindia.com/
- MCX data-feed FAQ: https://www.mcxindia.com/faq/technology-services
- FBIL: https://www.fbil.org.in/
- IBJA API information/FAQ: https://www.indiagoldratesapi.com/Faqs.aspx

## 3. Compliance and licensing gates

Before enabling a provider in production, obtain and archive written confirmation covering:

1. Easyfolio legal entity / subscriber identity and permitted application.
2. Public website display to unauthenticated users.
3. Educational use, attribution, and any mandatory disclaimers.
4. Historical storage, retention after contract expiry, and charting/derived calculations.
5. Permitted delivery mechanism, polling frequency, caching, and backup copies.
6. Redistribution / downstream end-user rights and geographic restrictions.
7. The applicable delay for each asset class and dataset, including the SEBI 30-day educational price-data rule where applicable.
8. Audit logs, access controls, deletion obligations, and reporting requirements.
9. Fees, trial terms, renewal, rate limits, and support/SLA.

SEBI's 8 May 2026 circular sets a 30-day lag for sharing and usage of market-price data for educational and awareness activities and requires appropriate agreements and safeguards. It also restricts using price data from the preceding 30 days in the specified educational context to indicate future prices, advice, or recommendations. The circular has a specific NISM simulation-lab exception; Easyfolio must not assume it qualifies. Obtain legal/compliance review of the circular's application to each asset type and the exact Easyfolio product model.

NSE's policy says subscriber agreements define permitted handling and dissemination, and redistribution is restricted unless agreed. MCX says feed use and redistribution are governed by its agreements. IBJA's API FAQ says publishing subscribed rates on a website requires prior written consent. FBIL's site says commercial use of its website data requires written permission. A publicly visible number is not, by itself, permission to republish it.

## 4. Normalized observation contract

Every accepted observation should include:

- `asset_id`: one of `nifty-50`, `sensex`, `bank-nifty`, `gold`, `silver`, `usd-inr`
- `value`: finite positive decimal, stored without binary floating-point rounding
- `unit`: explicit unit; do not infer from the asset name
- `observed_at`: source observation/trading date and time, with timezone
- `published_at`: provider publication timestamp, with timezone
- `ingested_at`: Easyfolio ingestion timestamp, UTC
- `source_name`, `source_url`, `provider_record_id`
- `licence_id` / internal agreement reference and policy version
- `quality_status`: validated, rejected, or quarantined
- `raw_payload_hash`: integrity/audit reference (do not store unnecessary raw payload if contract prohibits it)

The API should return the latest eligible observation per asset, its source, unit, observation date, publication date, and last successful sync. Missing/stale/unauthorized data should be represented as unavailable with a reason, never as zero.

## 5. Pipeline design

```text
Provider APIs / licensed files
          |
Provider-specific adapters (server-side credentials only)
          |
Schema + timestamp + unit + licence validation
          |
Eligibility / delay policy gate
          |
Persistent observation store + ingestion audit log
          |
Read-only market API
          |
Markets cards + historical charts
```

### Required controls

- Server-side secrets only; never use `NEXT_PUBLIC_*` for provider credentials.
- Idempotent upserts keyed by provider, asset, observation timestamp, and source record ID.
- Validate source timestamps, timezone, units, duplicate records, gaps, outliers, and unexpected schema changes.
- Keep source timestamps distinct from ingestion timestamps.
- Apply eligibility checks at ingestion and again at read time.
- Keep provider status per asset, not one global green status.
- Retry transient failures with bounded exponential backoff; do not retry authentication/licensing errors indefinitely.
- Alert on missed scheduled syncs, stale datasets, rejected records, and provider schema changes.
- Expose `last_successful_sync`, `last_observed_at`, and `last_error_code` without leaking secrets.
- Maintain an auditable record of the agreement/policy used to authorize each dataset.
- Never fallback to scraping or a provider whose license does not cover the required display.

## 6. Persistence and hosting decision

The current repository documents an in-memory FastAPI repository for mutual-fund data. That is not suitable for durable market history. Vercel's serverless filesystem must not be treated as durable storage.

Before coding persistence, select a managed PostgreSQL service reachable from the scheduled ingestion worker and the read API (for example, a Postgres provider already approved for the project). Confirm its cost, backup/retention, region, connection limits, and secrets configuration. Do not add a database dependency or deploy a migration until the target service and credentials are available.

Suggested tables:

- `market_assets`: canonical asset ID, display name, unit, benchmark definition.
- `market_providers`: provider identity and operational status (no secret values).
- `market_licences`: agreement reference, permitted assets/use, effective/expiry dates, retention and display flags.
- `market_observations`: normalized time-series rows with unique idempotency key.
- `market_ingestion_runs`: start/end, provider, result, record counts, error code.
- `market_audit_events`: eligibility decisions and changes to licence/configuration.

## 7. Delivery sequence

1. **Provider and rights confirmation** — identify the exact benchmark definition and get written public-display/storage rights for each asset.
2. **Storage selection** — approve managed Postgres and configure server-side credentials.
3. **Ingestion foundation** — migrations, provider interface, validation, audit log, and deterministic tests using synthetic fixtures only.
4. **First provider pilot** — one asset, one provider, historical backfill only to the licensed extent; verify delay and source attribution end to end.
5. **Remaining providers/assets** — add adapters independently; no provider is marked connected until a successful licensed sync is recorded.
6. **Read API and UI** — latest observation, history windows, stale states, source/date labels, and provider health.
7. **Production rollout** — preview tests, compliance sign-off, controlled merge, production verification.

## 8. Current implementation facts

- `frontend/app/api/market/route.ts` intentionally returns `503 provider_not_configured` with no observations.
- `frontend/app/lib/market-data.ts` defines the six asset IDs, an observation shape, and a 30-day educational eligibility helper.
- `backend/app/state.py` and the README describe the current fund catalog as in-memory; this is not a durable market-data store.
- The Markets page currently presents learning cards and a hypothetical scenario lab; it does not fetch live or historical prices.
- PR #5 fixed a missing `Info` icon import and is merged. It did not configure a provider or change market-data behavior.

## 9. Decisions still requiring the project owner

No provider credentials or legal rights have been assumed. Before a live feed is enabled, the owner must approve:
- Whether Easyfolio is strictly non-monetized education or has subscriptions/ads/other monetary incentives.
- The intended benchmark definition for gold and silver (IBJA spot benchmark vs MCX contract settlement).
- A provider budget and managed database budget.
- The relevant provider agreements and public display permissions.

Until those approvals exist, the correct product state is "Historical data not connected" rather than a fabricated or unlicensed price.
