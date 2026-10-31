# EasyFolio

A mutual-fund discovery and portfolio-learning project focused on making Indian mutual-fund information easier to explore.

**Live preview:** https://easyfolio-beta.vercel.app

> **Project status:** MVP / active development. This repository is a work in progress and is not a financial advisory service.

## Overview

EasyFolio explores a simpler way to work with Indian mutual-fund scheme information. The current starter uses the AMFI NAV text feed, a FastAPI backend, a repository abstraction, and an in-memory implementation.

The project is also structured to keep application services independent of the underlying storage implementation.

## Current capabilities

- Fetches and parses the AMFI NAV text feed.
- Exposes backend endpoints through FastAPI.
- Uses a repository abstraction so application logic is not coupled to a specific database.
- Includes an in-memory repository for the database-free MVP.
- Provides a Next.js frontend.
- Exposes interactive API documentation through FastAPI / Swagger UI.

## Technology

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript |
| Backend | Python, FastAPI, Pydantic |
| Data source | AMFI NAV text feed |
| Current storage | In-memory repository |
| Testing tools | Pytest, Jest, React Testing Library, Playwright |

## Architecture

The backend is organized around a repository contract:

```text
Client
  |
Next.js frontend
  |
FastAPI routes
  |
Application services
  |
FundRepository interface
  |
InMemoryFundRepository (current MVP)
```

Routes and business logic depend on the repository interface rather than a concrete database. A persistent implementation can be introduced later without rewriting the application flow.

### Data lifecycle

- A cold request can trigger a refresh from the AMFI feed.
- The current in-memory snapshot is lost when the API process restarts.
- A future persistent repository would be required for durable history and historical analytics.

## Run locally

### 1. Backend

```bash
cd backend
python -m venv .venv

# macOS / Linux
source .venv/bin/activate

# Windows PowerShell
# .venv\Scripts\Activate.ps1

pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend API: http://localhost:8000  
Interactive API docs: http://localhost:8000/docs

### 2. Frontend

Open a second terminal:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Use the local URL printed by the Next.js development server.

## Tests

Backend dependencies include Pytest. The frontend package defines Jest, React Testing Library, and Playwright test scripts.

Run the relevant test suite from its project directory:

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

## Current limitations

- The current backend repository is in-memory; data is not durable across process restarts.
- Historical NAV charts and historical return analytics are not included in this database-free starter.
- Fund categories and beginner tags should not be inferred from scheme names.
- Scheme metadata such as TER, riskometer, benchmark, and official scheme details needs to be reconciled against authoritative AMC disclosures before production use.

## Roadmap

- Add a durable repository implementation.
- Strengthen AMFI feed parsing with representative fixture-based tests.
- Reconcile scheme identity and metadata against official disclosures.
- Add reliable historical data storage before introducing historical analytics.
- Improve automated test coverage and production observability.

## Disclaimer

EasyFolio is a software project for exploring mutual-fund information. It does not provide investment advice, recommendations, or guaranteed returns. Verify scheme details with official AMC documents and consult a qualified financial professional before making investment decisions.

## Author

**Rahul Anand Kalita**  
[GitHub](https://github.com/anandrahul094) · [LinkedIn](https://www.linkedin.com/in/rahul-anand-kalita-572774113)
