from datetime import datetime, timezone
from app.providers.base import MarineProvider, WeatherProvider, PFZProvider
from app.schemas import Coordinates


def stamp(source: str) -> dict:
    return {"source": source, "observed_at": datetime.now(timezone.utc).isoformat(), "data_mode": "demo"}


class MockOceanProvider(MarineProvider):
    async def current(self, location: Coordinates, at=None) -> dict:
        return {**stamp("MockOceanProvider (DEMO DATA)"), "wave_height_m": 1.2, "wave_period_s": 7.0, "current_knots": 0.8}


class MockWeatherProvider(WeatherProvider):
    async def current(self, location: Coordinates, at=None) -> dict:
        hour = at.hour if at else datetime.now(timezone.utc).hour
        return {**stamp("MockWeatherProvider (DEMO DATA)"), "wind_knots": 10.0 + (hour % 4), "rainfall_mm_h": 0.0, "condition": "fair"}


class MockPFZProvider(PFZProvider):
    async def zones(self, location: Coordinates, at=None) -> dict:
        return {**stamp("MockPFZProvider (DEMO DATA)"), "zones": [{"latitude": location.latitude + 0.05, "longitude": location.longitude + 0.05, "confidence": 0.62}]}
