# EasyFolio — database-free MVP

This starter uses AMFI's NAV text feed, FastAPI, a repository abstraction and a volatile in-memory implementation. No permanent database is used.

## Run backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
API docs: http://localhost:8000/docs

## Run frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Design
HTTP routes and services depend on `FundRepository`, not a database implementation. The MVP injects `InMemoryFundRepository`. A future `PostgresFundRepository` can implement the same contract; routes and business logic remain unchanged.

The in-memory snapshot disappears when the API process restarts. A cold request refreshes AMFI. A scheduled GitHub Action can call the protected refresh endpoint to warm a running API instance.

Historical NAV charts and historical return analytics are intentionally not included in this database-free starter. They require a reliable historical source or persistent storage. Fund categories and beginner tags are not guessed from scheme names.

## Before public launch
Validate the parser against current AMFI feed snapshots; reconcile plan/option identity against official scheme metadata; source TER, riskometer, benchmark and scheme details from official AMC disclosures; verify all outbound URLs; and obtain Indian securities-law review of the actual product journey and monetization.
