# Easyfolio free-first market-data plan

**Product model:** Free investor-education platform; advertising may be introduced in future.  
**Cost policy:** Zero recurring provider and database spend during the initial phase.  
**Status:** No market-data source is approved for automated public redistribution yet.

## 1. Decision

Use a free-first approach. Prefer official sources and seek written no-fee permission where needed. Do not scrape public exchange websites, reverse-engineer endpoints, use broker-only credentials, or republish data merely because it can be viewed or downloaded publicly.

The future ad-supported model matters: any permission must cover public display on a website that may carry advertising. Free-to-user access does not automatically make Easyfolio a non-commercial data user.

## 2. Findings and implications

| Asset | Candidate to investigate | Free-first conclusion |
|---|---|---|
| NIFTY 50 | NSE / NSE Indices | Historical index data is available through official channels, but NSE policy requires agreements for subscriber use and restricts redistribution absent permission. NSE website terms also prohibit systematic automated collection and unauthorised copying. Seek written no-fee display permission; do not scrape. |
| BANK NIFTY | NSE / NSE Indices | Same restrictions as NIFTY 50. No automated integration until written permission covers this index and ad-supported public display. |
| SENSEX | BSE | Investigate official historical/index data channels and ask whether a no-fee educational display licence exists. Public availability alone is not permission to republish. |
| GOLD | IBJA | Investigate whether IBJA can grant a no-fee public display permission for its specified benchmark. Do not copy rates from its website/API without permission. |
| SILVER | IBJA | Same as gold; define purity, unit, and benchmark before requesting permission. |
| USD/INR | FBIL or CCIL | Investigate written no-fee permission. CCIL explicitly notes that commercial use of website data requires written permission. Do not scrape. |

## 3. Public-source policy references

- NSE Data Sharing & Usage Policy: https://www.nseindia.com/static/market-data/nse-data-policy
- NSE Terms of Use: https://www.nse.in/static/nse-terms-of-use
- NSE historical reports landing page: https://www.nseindia.com/static/resources/historical-reports-capital-market-daily-monthly-archives
- NSE index data subscription: https://www.nse.in/static/nse-indices/index-data-subscription
- CCIL USD/INR spot rates: https://www.ccilindia.com/spot-rates-inr-usd-
- CCIL notes that commercial use of website data requires written permission.
- SEBI educational price-data circular: https://www.sebi.gov.in/legal/circulars/may-2026/norms-for-sharing-and-usage-of-price-data-for-educational-purposes_101293.html

These references identify candidates and restrictions; they are not licences for Easyfolio.

## 4. Implementation guardrails

1. Keep the existing market API fail-closed until a source has written permission.
2. Keep credentials server-side; never add provider secrets to NEXT_PUBLIC variables or source control.
3. Do not create a scraper for NSE, BSE, FBIL, CCIL, IBJA, or other exchange/vendor pages.
4. Do not use unofficial endpoints, broker APIs, personal accounts, or data with unclear redistribution terms.
5. Do not seed production with synthetic or illustrative prices that could be mistaken for actual observations.
6. Use synthetic fixtures only in automated tests, clearly labelled as test data.
7. Keep provider adapters separate so a licensed paid source can be added later without changing the UI contract.
8. Avoid adding a database or paid hosting dependency until actual licensed observations and a durable-storage requirement exist.
9. Reassess provider terms before enabling advertisements; permission must cover ad-supported display.
10. Apply the required 30-day educational delay where the SEBI circular applies, subject to legal/compliance review for each dataset.

## 5. Low-cost implementation sequence

1. Contact official providers and request written no-fee permission for the exact asset, history depth, public website display, caching/storage, attribution, and future ad-supported use.
2. Record each provider's answer and agreement reference in the project.
3. Only after permission, choose the simplest durable storage compatible with the hosting setup; prefer an existing free tier if its limits and terms fit.
4. Implement one asset end-to-end using a provider adapter, validation, delay gate, source attribution, and tests.
5. Add further assets only when their rights and data quality are confirmed.
6. If no permission is granted, leave the relevant asset unavailable and retain the educational explanation/scenario content.

## 6. Current product state

The existing `/api/market` endpoint returns `503 provider_not_configured` and an empty observation list. This is the correct state until a permitted source is connected. The market cards and educational scenario content can continue to work without market-price ingestion.
