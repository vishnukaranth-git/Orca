import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["data"]["status"] == "healthy"

@pytest.mark.asyncio
async def test_marine_current_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/marine/current?latitude=12.9141&longitude=74.8560")
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert "wave_height_m" in data["data"]

@pytest.mark.asyncio
async def test_weather_current_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/weather/current?latitude=12.9141&longitude=74.8560")
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert "wind_kmh" in data["data"]

@pytest.mark.asyncio
async def test_pfz_ranked_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/pfz/ranked?latitude=12.9141&longitude=74.8560")
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert len(data["data"]["ranked_zones"]) > 0

@pytest.mark.asyncio
async def test_routes_recommend_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/api/routes/recommend",
            json={
                "origin": {"latitude": 12.9141, "longitude": 74.8560},
                "destination": {"latitude": 13.1200, "longitude": 74.7200}
            }
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["data"]["distance_km"] > 0

@pytest.mark.asyncio
async def test_scenarios_compare_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/api/scenarios/compare",
            json={
                "location": {"latitude": 12.9141, "longitude": 74.8560},
                "time_a": "05:00",
                "time_b": "09:00"
            }
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert "scenario_a" in data["data"]
        assert "scenario_b" in data["data"]
        assert "risk_delta" in data["data"]

@pytest.mark.asyncio
async def test_disasters_and_alerts_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r_disasters = await client.get("/api/disasters")
        assert r_disasters.status_code == 200
        assert r_disasters.json()["success"] is True

        r_alerts = await client.get("/api/alerts")
        assert r_alerts.status_code == 200
        assert r_alerts.json()["success"] is True

@pytest.mark.asyncio
async def test_historical_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/marine/historical?latitude=12.9141&longitude=74.8560")
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert len(data["data"]["days"]) == 7

@pytest.mark.asyncio
async def test_query_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/api/query",
            json={
                "query": "Is it safe to fish tomorrow near Mangalore?",
                "location": {"latitude": 12.9141, "longitude": 74.8560}
            }
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert "risk" in data["data"]
        assert "recommendation" in data["data"]
        assert len(data["data"]["evidence"]) >= 4

@pytest.mark.asyncio
async def test_query_history_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # First make a query
        await client.post(
            "/api/query",
            json={"query": "What is the wave height near Mangalore?", "session_id": "test_history_session"}
        )
        # Then get history
        resp = await client.get("/api/query/history?session_id=test_history_session")
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert len(data["data"]["history"]) >= 1

@pytest.mark.asyncio
async def test_pan_indian_pfz_coverage():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/pfz/ranked?latitude=12.9141&longitude=74.8560")
        assert resp.status_code == 200
        zones = resp.json()["data"]["ranked_zones"]
        assert len(zones) == 8
        zone_names = [z["zone_name"] for z in zones]
        assert any("Malpe" in name for name in zone_names)
        assert any("Veraval" in name for name in zone_names)
        assert any("Wadge" in name for name in zone_names)
        assert any("Coromandel" in name for name in zone_names)

