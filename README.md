# ORCA — Ocean Reasoning & Collaborative Agents

<div align="center">

```
  ____   ____     ____    _    
 / __ \ |  _ \   / ___|  / \   
| |  | || |_) | | |     / _ \  
| |__| ||  _ <  | |___ / ___ \ 
 \____/ |_| \_\  \____/_/   \_\
```

**Next-Generation Multi-Agent AI System for Ocean Intelligence, Fishery Safety & Disaster Resilience**  
*Built for the Indian Ocean Basin, Asian Seas, and Coastal Fisheries*

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com)
[![Vite](https://img.shields.io/badge/Vite-6.0+-646CFF.svg)](https://vitejs.dev)
[![Tests](https://img.shields.io/badge/pytest-37%2F37%20passed%20(100%25)-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)

</div>

---

## 🌊 Overview

**ORCA** (Ocean Reasoning & Collaborative Agents) is an autonomous, multi-agent AI operating platform engineered to synthesize oceanographic, meteorological, remote sensing, and disaster intelligence into actionable, human-friendly operational guidance for coastal fishermen, maritime vessels, and port authorities.

Unlike simple query chatbots, ORCA functions through an **Autonomous Multi-Agent Swarm**:

```
                              USER QUERY (English / Kannada / Hindi)
                                                │
                                                ▼
                                    ┌───────────────────────┐
                                    │     PLANNER AGENT     │
                                    │ (Intent Decomposition)│
                                    └───────────┬───────────┘
                                                │
               ┌────────────────┬───────────────┼───────────────┬────────────────┐
               ▼                ▼               ▼               ▼                ▼
        🛰️ Satellite       🌊 Ocean         💨 Weather      ⚠️ Disaster       🐟 PFZ
           Agent            Agent            Agent           Agent            Agent
      (Sentinel-1/3)    (INCOIS Buoys)    (IMD Synoptic)  (GDACS/USGS)     (Thermal/Chl)
               │                │               │               │                │
               └────────────────┼───────────────┼───────────────┴────────────────┘
                                                │
                                                ▼
                                   🔍 EVIDENCE VALIDATION AGENT
                                  (Integrity, Freshness, Agreement)
                                                │
                                                ▼
                                        ⚖️ RISK AGENT
                                  (Deterministic Hydrodynamic Risk)
                                                │
                                                ▼
                                    🧠 ORCA SYNTHESIS AGENT
                                   (Neural Advisory & Spoken Audio)
                                                │
                                                ▼
                             STRUCTURED MARINE INTELLIGENCE DOSSIER
                               + SCIENTIFIC EVIDENCE PROVENANCE
```

---

## 🚀 Key Modules & Capabilities

### 1. 💬 Ask ORCA Multi-Agent Orchestrator
- **Live Staged Multi-Agent Execution (~5s)**: Visibly shows specialist agents scanning orbits, retrieving buoy telemetry, and auditing regional storm tracks.
- **Dedicated Agent Action Banners**: Displays exact ingestion source and real-time activity status with zero truncation.
- **Real-Time Telemetry Tags**: Rich parameter chips (`[Wave Swell: 1.3m]`, `[Period: 7.8s]`, `[Sentinel-3: 2.4 mg/m³ Chl-a]`).
- **Deterministic Risk Reasoning**: Computes normalized 5-factor hydrodynamic risk scores with confidence metrics.
- **Listen to ORCA**: Real-time voice speech synthesis in English, Kannada, and Hindi.

### 2. 🔬 Scientific Evidence Provenance Modal
- Parameter-level telemetry breakdown across contributing specialists.
- Structured table with color-coded Ingestion Mode badges (`FORECAST`, `LIVE SENSOR`, `OFFICIAL BULLETIN`, `DERIVED HABITAT`, `OBSERVATION`).
- Fully transparent data attribution with timestamps and validation integrity tags.

### 3. 🗺️ Command Center & Interactive Ocean GIS
- Multi-layer Leaflet GIS with bathymetry contours, sea surface temperature (SST) heatmaps, wave swell vectors, wind barbs, and active vessel AIS tracks.
- Interactive coastal waypoint planning and sector drilldowns.

### 4. 🐟 Potential Fishing Zones (PFZ) Engine
- INCOIS-standard thermal front and chlorophyll-a bloom cross-correlation.
- Candidate zone ranking with depth contours, distance (km / NM), target species, and commercial viability ratings.

### 5. ⚠️ Disaster Watch & Early Warning
- Real-time ingestion of authoritative hazard feeds from **GDACS**, **USGS / IOTWMS**, and **IMD**.
- Cyclone track tracking, storm surge alerts, and seismic tsunami status monitors.

### 6. 🛰️ Satellite Remote Sensing Lab
- **Sentinel-3 OLCI**: Optical ocean color and chlorophyll-a front detection.
- **Sentinel-1 C-Band SAR**: Synthetic Aperture Radar surface roughness for cloud-penetrating wind and squall analysis.

### 7. 🚢 Safe Passage Corridor Optimizer
- Computes geodesic nautical waypoints avoiding shallow shoals, breakers, and restricted Marine Protected Areas (MPAs).

### 8. 📈 30-Day Historical Trend & What-If Simulator
- Climatological anomaly baseline contrasting (SST anomaly deltas, swell shifts).
- Hydrodynamic perturbation simulator allowing users to test hypothetical wave spikes (e.g. `+3.0m wave`, `35 kn wind`) and observe real-time risk shifts.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.11+, FastAPI, Uvicorn, Pydantic, HTTPX, Groq LLM API.
- **Frontend**: Vanilla HTML5, CSS3 Glassmorphic Design System, JavaScript (ES6 Modules), Leaflet.js, Lucide Icons, Vite.
- **Data Integrations**: Copernicus Marine (Sentinel-1/3), INCOIS Buoy Network, Open-Meteo Marine & Atmospheric Models, GDACS, USGS.
- **Testing**: Pytest & AnyIO asynchronous test harness (37 tests, 100% pass rate).

---

## 📦 Getting Started

### Prerequisites
- Python 3.11 or higher
- Node.js 18+ and npm

### 1. Clone the Repository
```bash
git clone https://github.com/vishnukaranth-git/Orca.git
cd Orca
```

### 2. Backend Setup
```bash
# Create and activate virtual environment
python -m venv .venv
# On Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Run FastAPI backend server
python -m uvicorn app.main:app --reload --port 8000
```
Backend API will be available at: `http://localhost:8000` (Interactive docs: `http://localhost:8000/docs`).

### 3. Frontend Setup
```bash
# In a new terminal window
cd frontend
npm install
npm run dev
```
Frontend application will be live at: `http://localhost:3000`.

---

## 🧪 Running Tests

Execute the full automated test suite (37 tests across specialist agents, API endpoints, and E2E scenarios):

```bash
# Run all tests
python -m pytest tests/

# Run individual test suites
python -m pytest tests/test_agents.py
python -m pytest tests/test_api.py
python -m pytest tests/test_e2e_scenarios.py
python -m pytest tests/test_providers.py
```

---

## 📋 API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/query` | Central Multi-Agent Orchestration query endpoint |
| `GET` | `/api/query/history` | Multi-turn conversational session history |
| `GET` | `/api/ocean/telemetry` | Real-time ocean swell, SST, and currents |
| `GET` | `/api/weather/telemetry` | Synoptic surface winds, gusts, and pressure |
| `GET` | `/api/pfz/zones` | Potential fishing zones and habitat rankings |
| `GET` | `/api/disaster/alerts` | Authoritative cyclone, tsunami, and storm bulletins |
| `GET` | `/api/satellite/swaths` | Sentinel-1 SAR and Sentinel-3 OLCI passes |
| `GET` | `/health` | Service health and provider status |

---

## 🚀 Deploying to Vercel

ORCA is configured for **zero-config full-stack deployment on Vercel** via [`vercel.json`](vercel.json):
- **Frontend**: Automatically built with Vite (`frontend/dist`) and served globally on Vercel's Edge Network.
- **Backend API**: Automatically served via Vercel Python Serverless Functions through [`api/index.py`](api/index.py).

### Option 1: Deploy via Vercel Web Dashboard (Recommended)

1. Push your code to GitHub:
   ```bash
   git push origin main
   ```
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import the repository (`vishnukaranth-git/ocra` or `vishnukaranth-git/Orca`).
4. In **Project Settings**:
   - **Framework Preset**: Select `Other` (or Vite) — `vercel.json` automatically manages the build and output directories.
   - **Build Command**: `cd frontend && npm install && npm run build` (set automatically by `vercel.json`)
   - **Output Directory**: `frontend/dist` (set automatically by `vercel.json`)
5. In **Environment Variables**, add:
   - `GROQ_API_KEY`: Your Groq API key for multi-agent LLM reasoning
   - `GROQ_MODEL`: `llama-3.3-70b-versatile` (or your preferred model)
   - `DEMO_MODE`: `true` (or `false` for live data feeds)
   - `ALLOWED_ORIGINS`: `*`
6. Click **Deploy**! 🚀

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Log in to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
Developed for advanced marine intelligence, coastal fishermen empowerment, and ocean safety.
</div>
