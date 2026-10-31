# Frontend tests

Use Jest with Next.js' SWC transform and React Testing Library. Keep tests close to the feature under test or in __tests__.

Planned first component suite:
- Extract the scheme selection cards from app/compare/page.tsx into a client component.
- Verify add/remove updates the selected schemes and comparison rows.
- Verify duplicate selections are ignored and no more than three schemes can be selected.
- Mock API requests and Next navigation; never call the live AMFI service from a component test.

Pure financial formatters/calculation functions should be extracted to an app/lib or lib module and covered with deterministic unit tests.
