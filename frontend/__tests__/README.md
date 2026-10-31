# Frontend tests

Use Jest with Next.js' SWC transform, React Testing Library and user-event.

## Current screen and interaction coverage

- Homepage: main learning paths and primary navigation links.
- Learning centre: six unique lesson destinations.
- Lesson pages: content, key takeaways, checklist rendering, metadata and previous/next navigation.
- Investing basics, categories, resources and About: core explanations, category-filter routes, disclosure text and reading destinations.
- Fund Explorer: API loading, search, category filters, clear filters, pagination, empty results, network errors, source date and future-dated NAV warnings.
- Fund detail: source fields, NAV display, comparison link, unavailable-metric disclosures, invalid scheme code, 404 and upstream failure.
- Guided discovery: required answer validation, selected answer state, progress, back/forward, saved answer editing, summary and restart.
- Glossary: term count, case-insensitive search, full-definition matches and no-results state.
- Navigation: desktop/mobile active route state for home, nested lessons and calculator routes.
- Calculators: interactive SIP and compound controls, updated result values and risk/return disclaimers.
- Compare: select/remove, duplicate prevention, three-scheme cap and comparison facts.
- Financial helpers: INR digit grouping, end-of-month SIP formula, compounding frequency, negative assumptions and input validation.

## Running

```bash
npm run test:coverage -- --runInBand
npm run build
```

CI enforces minimum global thresholds: 90% statements, 90% lines, 80% functions and 75% branches. Tests mock backend/API requests; no live AMFI call is made in the frontend suite.
