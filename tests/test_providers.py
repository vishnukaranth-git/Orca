import pytest
from app.schemas import Coordinates
from app.providers.live_marine import LiveMarineProvider
from app.providers.live_weather import LiveWeatherProvider
from app.providers.live_disaster import LiveDisasterProvider
from app.providers.geospatial_provider import GeospatialProvider
from app.providers.pfz_provider import LivePFZProvider

@pytest.mark.asyncio
async def test_live_marine_provider():
    provider = LiveMarineProvider()
    loc = Coordinates(latitude=12.9141, longitude=74.8560)
    data = await provider.current(loc)
    assert "wave_height_m" in data
    assert "wave_period_s" in data
    assert "sst_celsius" in data
    assert data["wave_height_m"] > 0
    assert "source" in data

    forecast = await provider.forecast(loc)
    assert len(forecast) > 0
    assert "wave_height_m" in forecast[0]

@pytest.mark.asyncio
async def test_live_weather_provider():
    provider = LiveWeatherProvider()
    loc = Coordinates(latitude=12.9141, longitude=74.8560)
    data = await provider.current(loc)
    assert "wind_kmh" in data
    assert "wind_knots" in data
    assert "condition" in data
    assert "temperature_celsius" in data

@pytest.mark.asyncio
async def test_live_disaster_provider():
    provider = LiveDisasterProvider()
    loc = Coordinates(latitude=12.9141, longitude=74.8560)
    alerts = await provider.get_alerts(loc)
    assert isinstance(alerts, list)
    assert len(alerts) >= 1
    for a in alerts:
        assert "alert_id" in a
        assert "hazard_type" in a
        assert "severity" in a
        assert "source" in a

@pytest.mark.asyncio
async def test_geospatial_provider():
    provider = GeospatialProvider()
    # Geocoding
    mangalore = await provider.geocode("Mangalore")
    assert mangalore is not None
    assert abs(mangalore.latitude - 12.9141) < 0.1

    # Geofence check
    netrani = Coordinates(latitude=14.0160, longitude=74.3280)
    hits = provider.check_geofence(netrani)
    assert len(hits) > 0
    assert "Netrani" in hits[0]["zone_name"]

    # Safe route calculation
    origin = Coordinates(latitude=12.9141, longitude=74.8560)
    dest = Coordinates(latitude=13.1200, longitude=74.7200)
    route = provider.calculate_safe_route(origin, dest)
    assert route["distance_km"] > 0
    assert len(route["waypoints"]) >= 2
    assert "estimated_transit_hours" in route

def test_pfz_provider():
    provider = LivePFZProvider()
    loc = Coordinates(latitude=12.9141, longitude=74.8560)
    ranked = provider.rank_zones(loc, current_wave=1.2, current_wind=15.0)
    assert len(ranked) == 8
    assert ranked[0]["orca_score"] >= ranked[1]["orca_score"]
    assert "scoring_explanation" in ranked[0]
