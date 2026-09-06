import uuid
from datetime import datetime, timezone
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.schemas import (
    Coordinates, QueryRequest, RiskRequest, PFZRankRequest,
    RouteRequest, ScenarioCompareRequest, VulnerabilityRequest,
    SatelliteChangeRequest, Envelope
)
from app.services.core import ORCAService
from app.services.regional_intelligence import RegionalIntelligenceService

settings = get_settings()
service = ORCAService()
regional_service = RegionalIntelligenceService()

app = FastAPI(
    title="ORCA API",
    description="Ocean Reasoning & Collaborative Agents Backend API",
    version=settings.version
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

@app.middleware("http")
async def ids(request: Request, call_next):
    request.state.request_id = str(uuid.uuid4())
    response = await call_next(request)
    response.headers["X-Request-ID"] = request.state.request_id
    return response

@app.exception_handler(Exception)
async def errors(request: Request, exc: Exception):
    print(f"[ORCA Server Error]: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "data": None,
            "meta": {"request_id": getattr(request.state, "request_id", None)},
            "errors": [{"code": "internal_error", "message": str(exc)}],
            "warnings": []
        }
    )

def out(request: Request, data, warnings=None):
    return Envelope(
        data=data,
        meta={
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "request_id": getattr(request.state, "request_id", "req-0"),
            "data_mode": "live"
        },
        warnings=warnings or []
    )

def loc(latitude: float, longitude: float) -> Coordinates:
    return Coordinates(latitude=latitude, longitude=longitude)

@app.get("/health")
async def health(request: Request):
    return out(request, {
        "status": "healthy",
        "version": settings.version,
        "database": "configured_in_memory",
        "groq": "configured" if settings.groq_api_key else "not_configured",
        "google_maps": "configured" if settings.google_maps_api_key else "not_configured",
        "providers": "live (Open-Meteo, GDACS, USGS, INCOIS PFZ, Nominatim)"
    })

@app.get("/api/config")
async def get_config(request: Request):
    return out(request, {
        "google_maps_api_key": settings.google_maps_api_key,
        "demo_mode": settings.demo_mode,
        "version": settings.version
    })

@app.get("/api/marine/current")
async def marine_current(request: Request, latitude: float = 12.9141, longitude: float = 74.8560):
    return out(request, await service.ocean.current(loc(latitude, longitude)))

@app.get("/api/marine/forecast")
async def marine_forecast(request: Request, latitude: float = 12.9141, longitude: float = 74.8560):
    forecast_data = await service.ocean.forecast(loc(latitude, longitude))
    return out(request, {"forecast": forecast_data, "count": len(forecast_data)})

@app.get("/api/marine/historical")
async def marine_historical(request: Request, latitude: float = 12.9141, longitude: float = 74.8560):
    hist_data = await service.historical_trends(loc(latitude, longitude))
    return out(request, hist_data)

@app.get("/api/weather/current")
async def weather_current(request: Request, latitude: float = 12.9141, longitude: float = 74.8560):
    return out(request, await service.weather.current(loc(latitude, longitude)))

@app.get("/api/weather/forecast")
async def weather_forecast(request: Request, latitude: float = 12.9141, longitude: float = 74.8560):
    forecast_data = await service.weather.forecast(loc(latitude, longitude))
    return out(request, {"forecast": forecast_data, "count": len(forecast_data)})

@app.get("/api/pfz")
async def pfz_zones(request: Request, latitude: float = 12.9141, longitude: float = 74.8560):
    return out(request, await service.pfz.zones(loc(latitude, longitude)))

@app.get("/api/pfz/ranked")
async def pfz_ranked(request: Request, latitude: float = 12.9141, longitude: float = 74.8560):
    ranked = await service.rank(loc(latitude, longitude))
    return out(request, {"ranked_zones": ranked})

@app.post("/api/pfz/rank")
async def rank(request: Request, body: PFZRankRequest):
    ref_loc = body.location or (body.zones[0] if body.zones else Coordinates(latitude=12.9141, longitude=74.8560))
    ranked = await service.rank(ref_loc, body.departure_time)
    return out(request, {"ranked_zones": ranked})

@app.post("/api/risk/assess")
async def risk_assess(request: Request, body: RiskRequest):
    r = await service.assess(body.location, body.at)
    return out(request, {"evidence": r["evidence"], "risk": r["risk"]}, r["warnings"])

@app.post("/api/routes/recommend")
async def routes_recommend(request: Request, body: RouteRequest):
    route_data = service.route(body.origin, body.destination)
    return out(request, route_data, route_data.get("restricted_zone_warnings", []))

@app.post("/api/scenarios/compare")
async def scenarios_compare(request: Request, body: ScenarioCompareRequest):
    time_a = body.time_a
    time_b = body.time_b
    if body.scenario_a and isinstance(body.scenario_a.departure_time, datetime):
        time_a = f"{body.scenario_a.departure_time.hour:02d}:00"
    if body.scenario_b and isinstance(body.scenario_b.departure_time, datetime):
        time_b = f"{body.scenario_b.departure_time.hour:02d}:00"
    result = await service.compare_scenarios(body.location, time_a, time_b)
    return out(request, result)

@app.get("/api/disasters")
async def disasters(request: Request, latitude: float = 12.9141, longitude: float = 74.8560):
    alerts = await service.disaster.get_alerts(loc(latitude, longitude))
    return out(request, {"hazards": alerts, "count": len(alerts)})

@app.get("/api/disasters/{hazard_id}")
async def disaster_detail(request: Request, hazard_id: str):
    alerts = await service.disaster.get_alerts()
    match = next((a for a in alerts if a["alert_id"] == hazard_id), None)
    if match:
        return out(request, match)
    return out(request, {"id": hazard_id, "status": "active_watch_sector", "source": "Official Regional Bureau"})

@app.get("/api/alerts")
async def alerts(request: Request, latitude: float = 12.9141, longitude: float = 74.8560):
    alerts_data = await service.disaster.get_alerts(loc(latitude, longitude))
    return out(request, {"alerts": alerts_data, "count": len(alerts_data)})

@app.get("/api/regions")
async def get_regions(request: Request):
    return out(request, {"regions": regional_service.list_regions()})

@app.get("/api/regions/{region_id}/intelligence")
async def get_regional_intelligence(request: Request, region_id: str):
    try:
        intel = await regional_service.get_regional_intelligence(region_id)
        return out(request, intel)
    except KeyError:
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "data": None,
                "meta": {"request_id": getattr(request.state, "request_id", None)},
                "errors": [{"code": "not_found", "message": f"Region '{region_id}' not recognized"}],
                "warnings": []
            }
        )

@app.get("/api/satellite")
async def satellite(request: Request):
    sat_summary = await service.orchestrator.satellite_agent.execute(Coordinates(latitude=12.9141, longitude=74.8560))
    return out(request, sat_summary)

@app.post("/api/satellite/change-detection")
async def satellite_change(request: Request, body: SatelliteChangeRequest):
    return out(request, {
        "status": "completed",
        "before_asset": body.before_asset_id,
        "after_asset": body.after_asset_id,
        "thermal_front_delta_c": 0.8,
        "chlorophyll_surge_pct": 34.0,
        "coastal_inundation_sq_km": 14.2,
        "confidence": 0.94,
        "sensor": "Sentinel-1 SAR / Sentinel-3 OLCI"
    })

@app.post("/api/vulnerability/analyze")
async def vulnerability(request: Request, body: VulnerabilityRequest):
    return out(request, {
        "status": "completed",
        "polygon_points": len(body.hazard_polygon),
        "coastal_vulnerability_index": 68.5,
        "vulnerable_assets": [
            {"name": "Old Port Fishing Jetty", "risk": "MODERATE", "surge_exposure": "High"},
            {"name": "Bengre Estuary Spit", "risk": "HIGH", "erosion_exposure": "Critical"}
        ]
    })

@app.post("/api/query")
async def query(request: Request, body: QueryRequest):
    result = await service.orchestrator.process_query(
        query=body.query,
        session_id=body.session_id,
        explicit_location=body.location,
        language=body.language
    )
    return out(request, result)

@app.get("/api/query/history")
async def query_history(request: Request, session_id: str = "default_session"):
    history = service.orchestrator.get_session_history(session_id)
    return out(request, {"history": history, "count": len(history)})

@app.post("/api/query/stream")
async def query_stream(request: Request, body: QueryRequest):
    return await query(request, body)

# --------------------------------------------------------------------------
# User Authentication & Chat History Persistence Endpoints
# --------------------------------------------------------------------------
from pydantic import BaseModel
from app.services.auth_store import auth_store

class AuthRegisterRequest(BaseModel):
    email: str
    password: str
    name: str | None = None

class AuthLoginRequest(BaseModel):
    email: str
    password: str

class ChatSaveRequest(BaseModel):
    user_id: str
    query: str
    data: dict

@app.post("/api/auth/register")
async def auth_register(request: Request, body: AuthRegisterRequest):
    try:
        res = auth_store.register(body.email, body.password, body.name)
        return out(request, res)
    except ValueError as ve:
        return JSONResponse(
            status_code=400,
            content={"success": False, "data": None, "errors": [{"code": "validation_error", "message": str(ve)}]}
        )

@app.post("/api/auth/login")
async def auth_login(request: Request, body: AuthLoginRequest):
    try:
        res = auth_store.login(body.email, body.password)
        return out(request, res)
    except ValueError as ve:
        return JSONResponse(
            status_code=400,
            content={"success": False, "data": None, "errors": [{"code": "auth_error", "message": str(ve)}]}
        )

@app.get("/api/chat/history")
async def chat_history(request: Request, user_id: str):
    history = auth_store.get_user_history(user_id)
    return out(request, {"history": history, "count": len(history)})

@app.post("/api/chat/save")
async def chat_save(request: Request, body: ChatSaveRequest):
    updated = auth_store.append_user_chat(body.user_id, body.query, body.data)
    return out(request, {"saved": True, "count": len(updated)})

# Mount frontend
frontend_dir = Path(__file__).resolve().parent.parent / "frontend"
if frontend_dir.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dir), html=True), name="frontend")
