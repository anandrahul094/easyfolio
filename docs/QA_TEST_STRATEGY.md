# EasyFolio QA automation plan

## TDD workflow

Every feature follows Red → Green → Refactor:
1. Red: add a focused test that describes observable behaviour and confirm it fails for the expected reason.
2. Green: implement the smallest production change that makes the new test pass.
3. Refactor: remove duplication and improve structure while keeping the suite green.
4. Run the complete backend suite, frontend suite and production build before merging.

## Frameworks and CI

- Backend: PyTest, pytest-cov, FastAPI TestClient (HTTPX), deterministic fixtures and mocks.
- Frontend: Jest, next/jest, React Testing Library, user-event, jsdom and jest-dom.
- CI runs backend unit tests, backend integration tests, a full backend suite with an 85% coverage gate, frontend Jest with coverage thresholds, and the Next.js production build.

## Backend coverage

- AMFI parser: legacy/current formats, Direct/Growth filtering, category mapping, AMC attribution, whitespace normalisation, NAV precision and complete Fund-field preservation.
- AMFI fetch client: SHA-256 digest, timeout, connection, HTTP, empty response and HTML response handling.
- Catalog service: refresh and snapshot replacement, cache hit, expiry/refresh path, upstream failure, stale-data retention and invalid-feed protection.
- FastAPI: health/status, search, category filters, pagination, detail, 404, validation, token-protected refresh and 503/502 error mapping.

## Frontend screen and interaction coverage

- Homepage and navigation links.
- Learning centre and individual lessons, including lesson order, metadata and previous/next links.
- Investing basics, category routes, resources and About disclosures.
- Fund Explorer: API success, search, category filter, clear filters, pagination, empty/error states, source date and future NAV warnings.
- Fund detail: scheme identity, NAV/date, source disclosure, missing-metric notice, comparison link, invalid identifier, 404 and upstream error.
- Guided discovery: answer requirement, selected state, progress, back/continue, answer editing, result summary and reset.
- Glossary: case-insensitive search, definition matching and empty-state feedback.
- SIP and compound calculators: interactive controls and displayed results, backed by pure, tested financial functions.
- Comparison: add/remove selection, duplicate prevention, three-scheme maximum and rendered comparison metrics.
- Frontend coverage gate: statements ≥90%, lines ≥90%, functions ≥80%, branches ≥75%.

## Features not implemented

- **Risk assessment:** No risk-scoring or Riskometer mapping implementation exists. The AMFI NAV feed does not provide sufficient information to derive Low/Medium/High risk. Use current scheme risk disclosures or approve a sourced methodology before implementing and testing a risk model.
- **Zerodha redirection:** No Zerodha transaction/redirect code or approved destination contract exists. Define the integration and approved URL/identifier contract before testing HTTPS allowlisting, encoded parameters, scheme mapping and safe external navigation.

## Commands

Backend (from backend/):

```bash
pip install -r requirements-dev.txt
pytest -m unit
pytest -m integration
pytest --cov=app --cov-report=term-missing --cov-fail-under=85
```

Frontend (from frontend/):

```bash
npm install
npm run test:coverage -- --runInBand
npm run build
```
