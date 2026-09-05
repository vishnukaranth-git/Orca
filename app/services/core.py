import asyncio
import math
from datetime import datetime, timezone
from app.config import get_settings
from app.schemas import Coordinates
from app.providers.live_marine import LiveMarineProvider
from app.providers.live_weather import LiveWeatherProvider
from app.providers.live_disaster import LiveDisasterProvider
from app.providers.geospatial_provider import GeospatialProvider
from app.providers.pfz_provider import LivePFZProvider
from app.agents.orchestrator import ORCAOrchestrator

class ORCAService:
    def __init__(self):
        self.ocean = LiveMarineProvider()
        self.weather = LiveWeatherProvider()
        self.pfz = LivePFZProvider()
        self.disaster = LiveDisasterProvider()
        self.geo = GeospatialProvider()
        self.orchestrator = ORCAOrchestrator()
        self.settings = get_settings()

    async def evidence(self, location: Coordinates, at: datetime | None = None):
        results = await asyncio.gather(
            self.ocean.current(location, at),
            self.weather.current(location, at),
            self.pfz.zones(location, at),
            self.disaster.get_alerts(location),
            return_exceptions=True
        )
        values, warnings = {}, []
        keys = ("ocean", "weather", "pfz", "disaster")
        for name, value in zip(keys, results):
            if isinstance(value, Exception):
                warnings.append(f"{name.upper()} provider error: {value}")
            else:
                values[name] = value
        return values, warnings

    def risk(self, values: dict, warnings: list[str]) -> dict:
        wave_h = values.get("ocean", {}).get("wave_height_m", 1.2)
        wave_p = values.get("ocean", {}).get("wave_period_s", 7.0)
        wind_kn = values.get("weather", {}).get("wind_knots", 8.5)
        gusts_kn = values.get("weather", {}).get("wind_gusts_knots", 12.0)
        
        has_warning = any(
            a.get("severity") in ("WARNING", "CRITICAL")
            for a in values.get("disaster", [])
        )

        return self.orchestrator.risk_agent.execute(wave_h, wave_p, wind_kn, gusts_kn, has_warning)

    async def assess(self, location: Coordinates, at: datetime | None = None) -> dict:
        values, warnings = await self.evidence(location, at)
        risk_profile = self.risk(values, warnings)
        return {
            "evidence": values,
            "risk": risk_profile,
            "warnings": warnings
        }

    async def rank(self, location: Coordinates, at: datetime | None = None) -> list[dict]:
        ocean_curr = await self.ocean.current(location, at)
        weather_curr = await self.weather.current(location, at)
        wave_h = ocean_curr.get("wave_height_m", 1.2)
        wind_kmh = weather_curr.get("wind_kmh", 15.0)
        return self.pfz.rank_zones(location, wave_h, wind_kmh)

    def route(self, origin: Coordinates, destination: Coordinates) -> dict:
        return self.geo.calculate_safe_route(origin, destination)

    async def compare_scenarios(self, location: Coordinates, time_a: str, time_b: str) -> dict:
        """
        Compare two departure times using hourly forecast telemetry.
        """
        marine_forecast = await self.ocean.forecast(location)
        weather_forecast = await self.weather.forecast(location)

        def get_conditions_for_hour(target_time_str: str):
            target_hour = int(target_time_str.split(":")[0])
            # Find closest item in forecast
            marine_match = marine_forecast[0] if marine_forecast else {"wave_height_m": 1.2, "wave_period_s": 7.0}
            weather_match = weather_forecast[0] if weather_forecast else {"wind_knots": 10.0, "wind_gusts_knots": 14.0}

            for m in marine_forecast:
                if f"{target_hour:02d}:00" in m.get("time", ""):
                    marine_match = m
                    break
            for w in weather_forecast:
                if f"{target_hour:02d}:00" in w.get("time", ""):
                    weather_match = w
                    break

            wave = marine_match.get("wave_height_m", 1.2)
            wave_p = marine_match.get("wave_period_s", 7.0)
            wind = weather_match.get("wind_knots", 10.0)
            gusts = weather_match.get("wind_gusts_knots", wind * 1.3)
            
            risk_calc = self.orchestrator.risk_agent.execute(wave, wave_p, wind, gusts)
            return {
                "time": target_time_str,
                "wave_height_m": wave,
                "wave_period_s": wave_p,
                "wind_knots": wind,
                "wind_gusts_knots": gusts,
                "risk": risk_calc,
                "fishing_suitability_pct": round(max(20.0, 100.0 - risk_calc["score"] * 0.8), 1)
            }

        sc_a = get_conditions_for_hour(time_a)
        sc_b = get_conditions_for_hour(time_b)

        delta = round(sc_b["risk"]["score"] - sc_a["risk"]["score"], 1)

        recommendation = (
            f"Departure at {time_a} is significantly safer ({sc_a['risk']['level']} risk, {sc_a['risk']['score']}/100) "
            f"compared to {time_b} ({sc_b['risk']['level']} risk, {sc_b['risk']['score']}/100)."
            if delta > 10 else
            f"Departure at {time_b} is safer by {-delta} pts."
            if delta < -10 else
            f"Both departure timestamps exhibit comparable maritime risk profiles."
        )

        return {
            "scenario_a": sc_a,
            "scenario_b": sc_b,
            "risk_delta": delta,
            "recommendation": recommendation
        }

    async def historical_trends(self, location: Coordinates) -> dict:
        marine_hist = await self.ocean.historical_7day(location)
        weather_hist = await self.weather.historical_7day(location)
        return {
            "days": marine_hist.get("days", []),
            "wave_heights_m": marine_hist.get("wave_heights_m", []),
            "sst_celsius": marine_hist.get("sst_celsius", []),
            "wind_kmh": weather_hist.get("wind_kmh", []),
            "sources": [marine_hist.get("source"), weather_hist.get("source")]
        }
