# EasyFolio QA automation plan

## TDD workflow

Every feature follows Red → Green → Refactor:
1. Red: add a focused test that describes observable behaviour and confirm it fails for the expected reason.
2. Green: implement the smallest production change that makes the new test pass.
3. Refactor: remove duplication and improve structure while keeping the suite green.
4. Run the complete backend suite, frontend suite and production build before merging.

The initial parser contract tests on this branch intentionally define behaviour that the current parser does not yet implement. Their expected failures are the Red phase, not a release candidate.

## Frameworks

- Backend: PyTest, pytest-cov, FastAPI TestClient (HTTPX), and standard-library mocks/fakes.
- Frontend: Jest, next/jest, React Testing Library, user-event, jsdom and jest-dom.
- CI: backend unit/integration tests and frontend component tests/build run independently.

## Test layout

    backend/
      app/services/amfi.py
      app/services/catalog.py
      app/repositories/
      tests/
        conftest.py
        fixtures/amfi_metadata_contract.txt
        unit/test_amfi_parser_contract.py
        integration/README.md
        test_parser.py (existing regression tests)
      pytest.ini
      requirements-dev.txt
    frontend/
      app/
      __tests__/README.md
      jest.config.js
      jest.setup.ts
      package.json

## Planned coverage by layer

### Unit tests

- AMFI parser: legacy and current feed formats, section context, AMC attribution, Direct/Growth filtering, category mapping, whitespace/control-character sanitisation, decimal precision, date parsing, invalid rows, duplicate scheme codes and stable field preservation.
- Financial helpers: exact INR formatting, decimal-safe calculations, boundary inputs and documented rounding. Pure helpers should be extracted from UI components before tests are written.
- Risk data: test the mapping only after a source-backed data contract is defined. The current AMFI NAV feed does not provide a scheme Riskometer or enough portfolio data to derive a reliable risk score.

### Integration tests

- Catalog refresh: mocked AMFI HTTP responses, cache freshness, successful snapshot replacement, timeout/HTTP/invalid-feed errors, and stale-data retention.
- API: FastAPI TestClient coverage for health, status, search/filter/pagination, missing scheme and refresh-token handling.
- UI: React Testing Library interaction tests for selecting/removing schemes in the comparison flow, maximum selection count and rendered comparison fields. Extract the compare picker into a small client component to test it in isolation.
- External redirects: no Zerodha/transaction redirection implementation currently exists. Add tests only after the product contract is approved: exact identifier mapping, HTTPS destination allowlist, encoded query parameters, rejection of unknown destinations, and safe new-window behaviour. Do not invent a Zerodha URL or imply transaction functionality is live.

## Current scope and known gaps

- AMFI parsing and catalog caching exist in backend/app/services/amfi.py and backend/app/services/catalog.py.
- Fund includes scheme identity, ISIN Growth, NAV/date, plan/option, category/subcategory, beginner tag and optional AMC name. The parser currently does not populate the AMC name from the fund-house line; the Red tests specify that missing behaviour.
- Risk scoring and transaction redirection are not implemented.
- The frontend currently has no dedicated Zerodha integration or isolated formatter library.
- Do not convert a category into a Low/Medium/High risk label. Risk should be sourced from the scheme's declared current risk disclosure, or a formally approved and documented methodology using adequate source data.

## Local commands

Backend (from backend/):

    pip install -r requirements-dev.txt
    pytest -m unit
    pytest -m integration
    pytest --cov=app --cov-report=term-missing

Frontend (from frontend/):

    npm install
    npm test -- --runInBand
    npm run test:coverage
    npm run build
