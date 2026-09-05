# Backend Audit

The repository was empty at inspection: no framework, routes, database, authentication, AI integration, providers, tests, or documentation existed. ORCA is therefore implemented as a modular FastAPI monolith with Pydantic validation, provider interfaces, deterministic risk logic, and explicit demo mode. External providers, persistence, authentication, workers, and LLM orchestration remain configuration-driven extensions; unavailable capabilities return honest warnings instead of invented data.
