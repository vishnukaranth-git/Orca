import pytest
from app.schemas import Coordinates
from app.agents.orchestrator import ORCAOrchestrator

@pytest.mark.asyncio
async def test_demo_query_1_marine_safety():
    """Demo 1: Comprehensive Marine Safety Assessment"""
    orchestrator = ORCAOrchestrator()
    loc = Coordinates(latitude=12.9141, longitude=74.8560)
    
    res = await orchestrator.process_query(
        query="Is it safe to fish tomorrow near Mangalore?",
        session_id="demo_1",
        explicit_location=loc
    )
    assert res["language"] == "en"
    assert "risk" in res
    assert res["risk"]["score"] >= 0
    assert "recommendation" in res
    assert len(res["reasons"]) > 0
    assert len(res["evidence"]) >= 4
    assert len(res["agents_consulted"]) >= 4
    assert "speech_text" in res
    assert "Ocean Agent" in res["agents_consulted"]
    assert "Weather Agent" in res["agents_consulted"]
    assert "Risk Agent" in res["agents_consulted"]

@pytest.mark.asyncio
async def test_demo_query_2_nearest_pfz():
    """Demo 2: Nearest High-Potential PFZ Zone"""
    orchestrator = ORCAOrchestrator()
    res = await orchestrator.process_query(
        query="Where is the nearest high-potential PFZ zone from Malpe harbor?",
        session_id="demo_2"
    )
    assert "PFZ Agent" in res["agents_consulted"]
    assert "Geospatial Agent" in res["agents_consulted"]
    assert res["top_fishing_zone"] is not None
    assert "map_action" in res

@pytest.mark.asyncio
async def test_demo_query_3_sst_temperature():
    """Demo 3: Sea Surface Temperature Focus"""
    orchestrator = ORCAOrchestrator()
    res = await orchestrator.process_query(
        query="What is the current sea surface temperature in Mangalore shelf?",
        session_id="demo_3"
    )
    assert "Ocean Agent" in res["agents_consulted"]
    assert "Geospatial Agent" in res["agents_consulted"]
    # Should NOT have consulted unrelated agents
    assert "Geofencing Agent" not in res["agents_consulted"]

@pytest.mark.asyncio
async def test_demo_query_4_cyclone_disaster():
    """Demo 4: Active Cyclone and Disaster Warnings"""
    orchestrator = ORCAOrchestrator()
    res = await orchestrator.process_query(
        query="Are there any active cyclones or disaster warnings along the west coast?",
        session_id="demo_4"
    )
    assert "Disaster Agent" in res["agents_consulted"]
    assert "Weather Agent" in res["agents_consulted"]

@pytest.mark.asyncio
async def test_demo_query_5_satellite_chlorophyll():
    """Demo 5: Chlorophyll and SST Satellite Trends"""
    orchestrator = ORCAOrchestrator()
    res = await orchestrator.process_query(
        query="Analyze chlorophyll and SST trends for the Karnataka coast",
        session_id="demo_5"
    )
    assert "Satellite Agent" in res["agents_consulted"] or "Ocean Agent" in res["agents_consulted"]

@pytest.mark.asyncio
async def test_demo_query_6_safe_route_optimization():
    """Demo 6: Safest Navigation Route to PFZ"""
    orchestrator = ORCAOrchestrator()
    res = await orchestrator.process_query(
        query="What is the safest route to PFZ Zone Alpha avoiding shallow breakers?",
        session_id="demo_6"
    )
    assert "Route Optimization Agent" in res["agents_consulted"] or "Geofencing Agent" in res["agents_consulted"]
    assert "map_action" in res

@pytest.mark.asyncio
async def test_demo_query_7_historical_trends():
    """Demo 7: 30-Day Historical Trend Analysis"""
    orchestrator = ORCAOrchestrator()
    res = await orchestrator.process_query(
        query="Show me the 30-day historical SST and wave anomaly for Mangalore",
        session_id="demo_7"
    )
    assert "Historical Agent" in res["agents_consulted"]
    assert "chart" in res

@pytest.mark.asyncio
async def test_demo_query_8_what_if_simulation():
    """Demo 8: What-If Scenario Simulation (3.0m Waves)"""
    orchestrator = ORCAOrchestrator()
    res = await orchestrator.process_query(
        query="What happens if wave height rises to 3.0 meters tomorrow?",
        session_id="demo_8"
    )
    assert "What-If Agent" in res["agents_consulted"] or "What-If Scenario Agent" in res["agents_consulted"]
    assert "risk" in res
    assert res["risk"]["level"] in ["HIGH", "CRITICAL", "MODERATE"]

@pytest.mark.asyncio
async def test_kannada_query_execution():
    """Kannada Natural Language Query Processing and Synthesis"""
    orchestrator = ORCAOrchestrator()
    loc = Coordinates(latitude=12.9141, longitude=74.8560)
    
    res = await orchestrator.process_query(
        query="ನಾಳೆ ಬೆಳಿಗ್ಗೆ ಮೀನು ಹಿಡಿಯಲು ಸಮುದ್ರಕ್ಕೆ ಹೋಗುವುದು ಸುರಕ್ಷಿತವೇ?",
        session_id="test_kannada_session",
        explicit_location=loc
    )
    assert res["language"] == "kn"
    assert "risk" in res
    assert res["risk"]["score"] >= 0
    assert len(res["reasons"]) > 0
    assert "speech_text" in res

@pytest.mark.asyncio
async def test_multi_turn_session_context():
    """Multi-turn Session Context Persistence Across Follow-Ups"""
    orchestrator = ORCAOrchestrator()
    session_id = "session_turn_test_full"
    
    # Turn 1: specify Mangalore
    r1 = await orchestrator.process_query("Is it safe to fish tomorrow near Mangalore?", session_id=session_id)
    assert "12.91" in r1["location"]
    
    # Turn 2: follow-up without explicit location
    r2 = await orchestrator.process_query("What about Sunday morning?", session_id=session_id)
    assert "12.91" in r2["location"]
    
    # Turn 3: ask which zone to choose
    r3 = await orchestrator.process_query("Which zone should I choose?", session_id=session_id)
    assert r3["top_fishing_zone"] is not None
