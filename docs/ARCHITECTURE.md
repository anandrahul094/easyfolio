# Architecture decisions

MVP uses `FundRepository` protocol and `InMemoryFundRepository`. API and service code depend on the protocol, not a storage engine. A future PostgreSQL implementation can implement the same contract. Add Alembic migrations and separate scheme registry from dated NAV observations when persistent history is required.

The MVP has no persistent data. Cache is process-local and is lost on restart. Multiple API instances will have independent caches; use shared cache or database only when deployment scale requires it.
