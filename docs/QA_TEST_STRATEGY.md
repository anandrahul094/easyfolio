# EasyFolio QA automation plan

## TDD workflow

Every feature follows Red → Green → Refactor:
1. Red: add a focused test that describes observable behaviour and confirm it fails for the expected reason.
2. Green: implement the smallest production change that makes the new test pass.
3. Refactor: remove duplication and improve structure while keeping the suite green.
4. Run the complete backend suite, frontend suite and production build before merging.

The AMFI parser contract tests completed their Red–Green cycle. The backend suite now covers parser behaviour, AMFI fetch failures, cache refresh/retention and API endpoints.

## Frameworks

- Backend: PyTest, pytest-cov, FastAPI TestClient (HTTPX), and deterministic mocks/fakes.
- Frontend: Jest, next/jest, React Testing Library, user-event, jsdom and jest-dom.
- CI: backend tests + coverage and frontend tests + Next.js production build run independently.

## Test layout

    backend/
      app/services/amfi.py
      app/services/catalog.py
      app/repositories/
      tests/
        conftest.py
        fixtures/
        unit/
          test_amfi_parser_contract.py
          test_amfi_fetch.py
        integration/
          test_catalog_service.py
          test_api.py
        test_parser.py
      pytest.ini
      requirements-dev.txt
    frontend/
      app/lib/finance.ts
      app/compare/scheme-picker.tsx
      __tests__/
        finance.test.ts
        compare.test.tsx
      jest.config.js
      jest.setup.ts
      package.json

## Current automated coverage

### Backend unit tests
- Legacy and current AMFI feed formats, Direct/Growth filtering, category grouping, AMC attribution, whitespace normalisation, NAV decimal precision and complete Fund field preservation.
- AMFI HTTP client: success/digest, timeout, connection failure, HTTP error, empty response and HTML response rejection.

### Backend integration tests
- Catalog refresh parses AMFI data and replaces the cached snapshot.
- Cache hits avoid repeat network requests until expiry.
- Upstream failures retain the last good snapshot and expose a stale status; a first-load failure raises instead of returning empty success.
- FastAPI TestClient covers health, search, category filtering, pagination, scheme detail, 404, query validation and authenticated manual refresh.

### Frontend tests
- INR whole-rupee formatting and invalid-number rejection.
- SIP end-of-month monthly-compounding formula, zero-rate result, negative assumptions and invalid inputs.
- Compound-interest frequency, negative assumptions and validation.
- Scheme comparison selection, removal, duplicate prevention, three-scheme limit and rendering of the comparison facts.

## Product features that are not present and therefore not testable yet

- **Risk classification:** No risk-scoring or Riskometer mapping implementation currently exists. The AMFI NAV feed alone is insufficient to calculate Low/Medium/High risk. Do not infer risk from scheme category. Integrate a current official scheme risk disclosure or approve a sourced methodology before writing production risk logic.
- **Zerodha redirection:** No Zerodha transaction/redirect code or approved destination contract currently exists. Do not invent a destination URL or identifier mapping. Once product requirements and official integration details are supplied, test HTTPS allowlisting, query encoding, exact fund identifier mapping and safe external-navigation behaviour.

## Commands

Backend (from backend/):

    pip install -r requirements-dev.txt
    pytest -m unit
    pytest -m integration
    pytest --cov=app --cov-report=term-missing --cov-fail-under=85

Frontend (from frontend/):

    npm install
    npm run test:coverage -- --runInBand
    npm run build
