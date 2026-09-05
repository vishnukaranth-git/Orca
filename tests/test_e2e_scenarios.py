import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_scenario_1_safety_tomorrow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.post("/api/query", json={"query": "Is it safe to fish tomorrow near Mangalore?"})
        assert r.status_code == 200
        d = r.json()["data"]
        assert "risk" in d
        assert "recommendation" in d
        assert len(d["reasons"]) > 0

@pytest.mark.asyncio
async def test_scenario_2_best_fishing_zone():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.post("/api/query", json={"query": "Find the best fishing zone near me."})
        assert r.status_code == 200
        d = r.json()["data"]
        assert d.get("top_fishing_zone") is not None

@pytest.mark.asyncio
async def test_scenario_3_which_zone_is_safest():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/api/pfz/ranked?latitude=12.9141&longitude=74.8560")
        assert r.status_code == 200
        d = r.json()["data"]
        assert len(d["ranked_zones"]) > 0
        assert all("safety_score" in z for z in d["ranked_zones"])

@pytest.mark.asyncio
async def test_scenario_4_safest_route_to_zone_alpha():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.post("/api/routes/recommend", json={
            "origin": {"latitude": 12.9141, "longitude": 74.8560},
            "destination": {"latitude": 13.1200, "longitude": 74.7200}
        })
        assert r.status_code == 200
        d = r.json()["data"]
        assert d["distance_km"] > 0
        assert len(d["waypoints"]) >= 2
        assert "estimated_transit_hours" in d

@pytest.mark.asyncio
async def test_scenario_5_and_6_what_if_5am_vs_10am():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.post("/api/scenarios/compare", json={
            "location": {"latitude": 12.9141, "longitude": 74.8560},
            "time_a": "05:00",
            "time_b": "10:00"
        })
        assert r.status_code == 200
        d = r.json()["data"]
        assert "scenario_a" in d
        assert "scenario_b" in d
        assert "recommendation" in d

@pytest.mark.asyncio
async def test_scenario_7_marine_hazard_nearby():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/api/disasters?latitude=12.9141&longitude=74.8560")
        assert r.status_code == 200
        d = r.json()["data"]
        assert len(d["hazards"]) > 0

@pytest.mark.asyncio
async def test_scenario_8_tsunami_warning():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/api/alerts?latitude=12.9141&longitude=74.8560")
        assert r.status_code == 200
        d = r.json()["data"]
        # Official status verified
        tsunami_alert = next((a for a in d["alerts"] if "Tsunami" in a["hazard_type"]), None)
        assert tsunami_alert is not None
        assert "official_status" in tsunami_alert

@pytest.mark.asyncio
async def test_scenario_9_ocean_conditions():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/api/marine/current?latitude=12.9141&longitude=74.8560")
        assert r.status_code == 200
        d = r.json()["data"]
        assert d["wave_height_m"] > 0
        assert d["wave_period_s"] > 0

@pytest.mark.asyncio
async def test_scenario_10_how_has_region_changed():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/api/marine/historical?latitude=12.9141&longitude=74.8560")
        assert r.status_code == 200
        d = r.json()["data"]
        assert len(d["days"]) == 7
        assert len(d["wave_heights_m"]) == 7
        assert len(d["sst_celsius"]) == 7

@pytest.mark.asyncio
async def test_scenario_11_kannada_marine_query():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.post("/api/query", json={
            "query": "ನಾಳೆ ಬೆಳಿಗ್ಗೆ ಮೀನು ಹಿಡಿಯಲು ಸಮುದ್ರಕ್ಕೆ ಹೋಗುವುದು ಸುರಕ್ಷಿತವೇ?",
            "location": {"latitude": 12.9141, "longitude": 74.8560}
        })
        assert r.status_code == 200
        d = r.json()["data"]
        assert d["language"] == "kn"
        assert len(d["reasons"]) > 0

@pytest.mark.asyncio
async def test_scenario_12_multi_turn_query():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        sid = "test_multi_turn_e2e"
        
        # Turn 1
        r1 = await client.post("/api/query", json={
            "query": "Is it safe to fish tomorrow?",
            "session_id": sid,
            "location": {"latitude": 12.9141, "longitude": 74.8560}
        })
        assert r1.status_code == 200
        
        # Turn 2: preserves context
        r2 = await client.post("/api/query", json={
            "query": "What about Sunday?",
            "session_id": sid
        })
        assert r2.status_code == 200
        assert "12.91" in r2.json()["data"]["location"]
        
        # Turn 3: which zone should I choose?
        r3 = await client.post("/api/query", json={
            "query": "Which zone should I choose?",
            "session_id": sid
        })
        assert r3.status_code == 200
        assert r3.json()["data"].get("top_fishing_zone") is not None
