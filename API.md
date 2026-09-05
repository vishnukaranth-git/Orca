# API

All responses use `{success,data,meta,errors,warnings}`. `meta.data_mode` is `demo` until validated providers are configured.

Implemented endpoints: `GET /health`, marine/weather current and forecast, `GET /api/pfz`, `POST /api/query`, `/api/query/stream`, `/api/risk/assess`, `/api/pfz/rank`, `/api/routes/recommend`, `/api/scenarios/compare`, disaster listing/detail, alerts, satellite metadata/change detection, and vulnerability analysis. OpenAPI at `/docs` is the authoritative request/response reference.
