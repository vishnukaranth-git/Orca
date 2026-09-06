from datetime import datetime
from enum import StrEnum
from typing import Any
from pydantic import BaseModel, Field

class Severity(StrEnum):
    INFO = "INFO"
    WATCH = "WATCH"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"

class Coordinates(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)

class Envelope(BaseModel):
    success: bool = True
    data: Any
    meta: dict[str, Any]
    errors: list[dict[str, str]] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)

class QueryRequest(BaseModel):
    query: str = Field(min_length=2, max_length=2000)
    session_id: str | None = None
    language: str | None = None
    user_context: dict[str, Any] = Field(default_factory=dict)
    location: Coordinates | None = None

class RiskRequest(BaseModel):
    location: Coordinates
    at: datetime | None = None

class PFZRankRequest(BaseModel):
    location: Coordinates | None = None
    zones: list[Coordinates] = Field(default_factory=list)
    departure_time: datetime | None = None

class RouteRequest(BaseModel):
    origin: Coordinates
    destination: Coordinates
    restricted_zones: list[list[Coordinates]] = Field(default_factory=list)

class Scenario(BaseModel):
    departure_time: datetime | str

class ScenarioCompareRequest(BaseModel):
    location: Coordinates
    destination: Coordinates | None = None
    time_a: str = "05:00"
    time_b: str = "09:00"
    scenario_a: Scenario | None = None
    scenario_b: Scenario | None = None

class VulnerabilityRequest(BaseModel):
    hazard_polygon: list[Coordinates] = Field(min_length=3)

class SatelliteChangeRequest(BaseModel):
    before_asset_id: str = Field(min_length=1, max_length=128)
    after_asset_id: str = Field(min_length=1, max_length=128)

class Alert(BaseModel):
    alert_id: str
    hazard_type: str
    severity: Severity
    location: Coordinates | None = None
    timestamp: datetime
    source: str
    evidence: list[str]
    affected_area: str | None = None
    recommended_action: str
    status: str
