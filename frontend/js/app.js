/**
 * ORCA Main Application Coordinator
 * State manager, navigation router for 8 specialized marine views,
 * live telemetry synchronization, and backend API integration.
 */

class OrcaApp {
  constructor() {
    this.currentView = 'ask-orca';
    this.mapController = null;
    this.agentNetwork = null;
    this.satelliteLab = null;
    this.simulator = null;
    this.aiAssistant = null;
    this.bgFX = null;

    this.backendStatus = 'connecting';
    this.pfzZones = [];
    this.disasters = [];
    this.currentSort = 'orca';
    this.histWaveChart = null;
    this.histSstChart = null;
  }

  getApiBase() {
    return window.location.port === '3000' ? 'http://localhost:8000' : '';
  }

  init() {
    console.log("Initializing ORCA Marine Intelligence Platform (Indian Ocean & Asian Waters)...");

    // Initialize Subsystems
    this.bgFX = new UnderwaterBackgroundFX('underwater-canvas');
    this.agentNetwork = new OrcaAgentNetwork();
    this.satelliteLab = new OrcaSatelliteLab();
    this.simulator = new OrcaSimulator();
    this.aiAssistant = new OrcaAIAssistant();
    this.mapController = new OrcaMapController('orca-leaflet-map');

    this.agentNetwork.init();
    this.satelliteLab.init();
    this.simulator.init();
    this.aiAssistant.init();
    this.mapController.init();

    this.bindNavigation();
    this.bindRouteControls();
    this.bindPFZSorting();
    this.startClock();
    this.checkBackendHealth();
    this.fetchLiveTelemetry();

    // Default view: Ask ORCA (Primary Agentic AI Experience)
    this.switchView('ask-orca');

    // Popover click-outside dismissal
    document.addEventListener('click', (e) => {
      const popover = document.getElementById('map-layers-popover');
      const btn = document.getElementById('btn-toggle-layers-popover');
      if (popover && popover.style.display !== 'none') {
        if (!popover.contains(e.target) && !btn.contains(e.target)) {
          popover.style.display = 'none';
          if (btn) btn.classList.remove('active');
        }
      }
    });

    // Inspect initial Arabian Sea basin when user opens command center view
    setTimeout(() => {
      if (this.currentView === 'command' && this.mapController) {
        this.mapController.inspectRegion('arabian_sea');
      }
    }, 400);

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  bindNavigation() {
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const viewId = btn.dataset.view;
        this.switchView(viewId);
      });
    });

    // Map Layer Toggles in HUD toolbar
    document.querySelectorAll('.map-layer-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const layer = pill.dataset.layer;
        const isActive = pill.classList.toggle('active');
        if (this.mapController) {
          this.mapController.toggleLayer(layer, isActive);
        }
      });
    });
  }

  bindPFZSorting() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentSort = btn.dataset.sort;
        this.renderPFZTable();
      });
    });
  }

  bindRouteControls() {
    const btn = document.getElementById('btn-calculate-route');
    if (!btn) return;

    btn.addEventListener('click', async () => {
      const origVal = document.getElementById('route-origin-select').value.split(',');
      const destVal = document.getElementById('route-dest-select').value.split(',');

      const origLat = parseFloat(origVal[0]), origLon = parseFloat(origVal[1]);
      const destLat = parseFloat(destVal[0]), destLon = parseFloat(destVal[1]);

      btn.innerHTML = '<span>CALCULATING CORRIDOR...</span>';

      try {
        const resp = await fetch(`${this.getApiBase()}/api/routes/recommend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: { latitude: origLat, longitude: origLon },
            destination: { latitude: destLat, longitude: destLon }
          })
        });

        if (resp.ok) {
          const json = await resp.json();
          const route = json.data;
          this.displayRouteResults(route);
          if (this.mapController) {
            this.mapController.plotRoute(route.waypoints);
          }
        }
      } catch (err) {
        console.warn("Route API error, calculating local corridor.", err);
      } finally {
        btn.innerHTML = '<i data-lucide="navigation"></i><span>CALCULATE SAFE CORRIDOR</span>';
        if (window.lucide) lucide.createIcons();
      }
    });
  }

  displayRouteResults(route) {
    const card = document.getElementById('route-results-card');
    if (!card) return;

    const warningsHtml = (route.restricted_zone_warnings && route.restricted_zone_warnings.length > 0)
      ? route.restricted_zone_warnings.map(w => `<div style="color:#fbbf24;font-size:11px;margin-top:4px;">⚠ ${w}</div>`).join('')
      : `<div style="color:#22d3b6;font-size:11px;margin-top:4px;">✓ Safe Channel Clear of Marine Sanctuaries & Military Sectors</div>`;

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;border-bottom:1px solid rgba(36,160,200,0.2);padding-bottom:6px;">
        <b style="font-family:'Rajdhani',sans-serif;font-size:14px;color:#fff;">${route.route_type}</b>
        <span class="telemetry-tag" style="color:#22d3b6;">PASSAGE CLEARED</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:11.5px;margin-bottom:8px;">
        <div><span style="color:var(--text-muted);">Distance:</span> <b style="font-family:var(--font-mono);color:#fff;">${route.distance_km} km</b></div>
        <div><span style="color:var(--text-muted);">Nautical:</span> <b style="font-family:var(--font-mono);color:#fff;">${route.distance_nm} NM</b></div>
        <div><span style="color:var(--text-muted);">Est. Transit:</span> <b style="font-family:var(--font-mono);color:#22d3b6;">${route.estimated_transit_hours} hrs</b></div>
      </div>
      <div style="background:rgba(3,14,24,0.7);padding:8px;border-radius:4px;">
        <div style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted);">SAFETY CHECK & GEOFENCING:</div>
        ${warningsHtml}
      </div>
    `;
    card.style.display = 'block';
  }

  switchView(viewId) {
    this.currentView = viewId;

    // Update Nav buttons
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewId);
    });

    // Update View Panels
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `view-${viewId}`);
    });

    // Invalidate map size so background map is always active & responsive across all views
    if (this.mapController && this.mapController.map) {
      setTimeout(() => {
        this.mapController.map.invalidateSize();
      }, 100);
    }

    if (viewId === 'pfz') {
      this.loadPFZData();
    } else if (viewId === 'disasters') {
      this.loadDisasterData();
    } else if (viewId === 'satellite') {
      setTimeout(() => {
        if (this.satelliteLab) this.satelliteLab.renderCanvasLayers();
      }, 100);
    } else if (viewId === 'simulator') {
      setTimeout(() => {
        if (this.simulator) this.simulator.runSimulation();
      }, 100);
    } else if (viewId === 'historical') {
      this.loadHistoricalTrends();
    }

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  async fetchLiveTelemetry() {
    try {
      const [marineResp, weatherResp, alertsResp] = await Promise.all([
        fetch(`${this.getApiBase()}/api/marine/current`),
        fetch(`${this.getApiBase()}/api/weather/current`),
        fetch(`${this.getApiBase()}/api/alerts`)
      ]);

      if (marineResp.ok) {
        const mData = (await marineResp.json()).data;
        const sstEl = document.getElementById('live-sst-val');
        const waveEl = document.getElementById('live-wave-val');
        const periodEl = document.getElementById('live-period-val');
        const currEl = document.getElementById('live-current-val');

        if (sstEl) sstEl.textContent = `${mData.sst_celsius} °C`;
        if (waveEl) waveEl.textContent = `${mData.wave_height_m} m`;
        if (periodEl) periodEl.textContent = `${mData.wave_period_s} s`;
        if (currEl) currEl.textContent = `${mData.current_knots} kn`;
      }

      if (weatherResp.ok) {
        const wData = (await weatherResp.json()).data;
        const windEl = document.getElementById('live-wind-val');
        if (windEl) windEl.textContent = `${wData.wind_kmh} km/h (${wData.wind_knots} kn)`;
      }

      if (alertsResp.ok) {
        const aData = (await alertsResp.json()).data;
        const alertsList = aData.alerts || [];
        const countEl = document.getElementById('live-alerts-count');
        const titleEl = document.getElementById('live-alert-title');
        const subEl = document.getElementById('live-alert-sub');

        if (countEl) countEl.textContent = `${alertsList.length} ACTIVE`;
        if (alertsList.length > 0 && titleEl) {
          titleEl.textContent = alertsList[0].title;
          if (subEl) subEl.textContent = `${alertsList[0].source} · ${alertsList[0].severity}`;
        }
      }
    } catch (e) {
      console.warn("Live telemetry fetch fallback.", e);
    }
  }

  async loadPFZData() {
    const container = document.getElementById('pfz-zones-container');
    if (!container) return;

    try {
      const resp = await fetch(`${this.getApiBase()}/api/pfz/ranked`);
      if (resp.ok) {
        const json = await resp.json();
        this.pfzZones = json.data.ranked_zones || [];
        this.renderPFZTable();
      }
    } catch (e) {
      console.warn("PFZ ranked fetch fallback.", e);
    }
  }

  renderPFZTable() {
    const container = document.getElementById('pfz-zones-container');
    if (!container || !this.pfzZones.length) return;

    let list = [...this.pfzZones];
    if (this.currentSort === 'orca') {
      list.sort((a, b) => b.orca_score - a.orca_score);
    } else if (this.currentSort === 'nearest') {
      list.sort((a, b) => a.distance_km - b.distance_km);
    } else if (this.currentSort === 'safest') {
      list.sort((a, b) => b.safety_score - a.safety_score);
    } else if (this.currentSort === 'potential') {
      list.sort((a, b) => b.potential_score - a.potential_score);
    }

    container.innerHTML = list.map(z => `
      <div class="pfz-full-card" onclick="orcaApp.inspectPFZ(${z.latitude}, ${z.longitude})">
        <div class="pfz-card-header-row">
          <div class="pfz-card-title-group">
            <div class="pfz-card-zone-name">${z.zone_name}</div>
            <div class="pfz-card-region-tag">COORDINATES: ${z.latitude.toFixed(2)}°N, ${z.longitude.toFixed(2)}°E</div>
          </div>
          <div class="pfz-full-orca-badge">ORCA ${z.orca_score}</div>
        </div>

        <div class="pfz-card-metrics-grid">
          <div class="pfz-metric-cell">
            <span class="lbl">Potential</span>
            <span class="val green">${z.potential_score}/100</span>
          </div>
          <div class="pfz-metric-cell">
            <span class="lbl">Safety</span>
            <span class="val">${z.safety_score}/100</span>
          </div>
          <div class="pfz-metric-cell">
            <span class="lbl">Distance</span>
            <span class="val">${z.distance_km} km</span>
          </div>
          <div class="pfz-metric-cell">
            <span class="lbl">Depth</span>
            <span class="val">-${z.depth_m}m</span>
          </div>
        </div>

        <div class="pfz-species-row">
          <i data-lucide="fish"></i>
          <span><b>Target Species:</b> ${z.target_species}</span>
        </div>

        <div class="pfz-rationale-box">
          ${z.scoring_explanation}
        </div>

        <button class="pfz-select-plot-btn" onclick="event.stopPropagation(); orcaApp.inspectPFZ(${z.latitude}, ${z.longitude})">
          <i data-lucide="crosshair" style="width:13px;height:13px;"></i>
          <span>OK, PLOT THIS ON MAP &rarr;</span>
        </button>
      </div>
    `).join('');

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  async loadDisasterData() {
    const container = document.getElementById('disaster-feed-container');
    if (!container) return;

    try {
      const resp = await fetch(`${this.getApiBase()}/api/disasters`);
      if (resp.ok) {
        const json = await resp.json();
        const hazards = json.data.hazards || [];
        
        container.innerHTML = hazards.map(h => {
          let lat = 12.78, lng = 75.12;
          const t = (h.title + " " + (h.description || "")).toLowerCase();
          if (t.includes("japan")) { lat = 34.5; lng = 137.5; }
          else if (t.includes("vietnam")) { lat = 16.0; lng = 108.5; }
          else if (t.includes("cyclone") || t.includes("twentythree") || t.includes("nwpacific") || t.includes("philippine")) { lat = 17.5; lng = 124.0; }
          else if (t.includes("bengal") || t.includes("odisha") || t.includes("andhra")) { lat = 18.5; lng = 87.0; }
          else if (t.includes("arabian") || t.includes("gujarat") || t.includes("karnataka")) { lat = 14.5; lng = 73.5; }
          else if (t.includes("lakshadweep")) { lat = 10.5; lng = 72.5; }
          else if (t.includes("andaman")) { lat = 11.5; lng = 93.0; }

          const safeTitle = (h.title || 'Marine Hazard').replace(/'/g, "\\'").replace(/"/g, '&quot;');
          const sevClass = (h.severity || 'watch').toLowerCase();

          return `
            <div class="disaster-full-card ${sevClass}" onclick="orcaApp.inspectHazard(${lat}, ${lng}, '${safeTitle}')">
              <div class="disaster-card-top-row">
                <div class="disaster-card-title">${h.title}</div>
                <div class="disaster-severity-badge ${sevClass}">${h.severity || 'WATCH'}</div>
              </div>

              <div class="disaster-meta-tag">
                <i data-lucide="radio" style="width:12px;height:12px;"></i>
                <span>${h.source || 'OFFICIAL BULLETIN'} · ${h.issued_time || 'LIVE INGESTION'}</span>
              </div>

              <div class="disaster-desc-text">
                ${h.description}
              </div>

              <div class="disaster-action-box">
                <b>RECOMMENDED MARITIME ACTION:</b>
                <span>${h.recommended_action || 'Avoid affected maritime sectors; monitor local port control on VHF Ch 16.'}</span>
              </div>

              <button class="disaster-select-plot-btn" onclick="event.stopPropagation(); orcaApp.inspectHazard(${lat}, ${lng}, '${safeTitle}')">
                <i data-lucide="crosshair" style="width:13px;height:13px;"></i>
                <span>OK, PLOT THIS ON MAP &rarr;</span>
              </button>
            </div>
          `;
        }).join('');

        if (window.lucide) {
          lucide.createIcons();
        }
      }
    } catch (e) {
      console.warn("Disaster feed error.", e);
    }
  }

  async loadHistoricalTrends() {
    try {
      const resp = await fetch(`${this.getApiBase()}/api/marine/historical`);
      if (resp.ok) {
        const json = await resp.json();
        const data = json.data;
        this.renderHistoricalCharts(data);
      }
    } catch (e) {
      console.warn("Historical trends error.", e);
    }
  }

  renderHistoricalCharts(data) {
    const waveCtx = document.getElementById('hist-wave-chart');
    const sstCtx = document.getElementById('hist-sst-chart');
    if (!waveCtx || !sstCtx || !window.Chart) return;

    if (this.histWaveChart) this.histWaveChart.destroy();
    if (this.histSstChart) this.histSstChart.destroy();

    const labels = data.days || ['25 Aug', '26 Aug', '27 Aug', '28 Aug', '29 Aug', '30 Aug', '31 Aug'];

    this.histWaveChart = new Chart(waveCtx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Wave Height (m)',
          data: data.wave_heights_m || [1.2, 1.4, 1.3, 1.1, 1.5, 1.3, 1.2],
          borderColor: '#22d3b6',
          backgroundColor: 'rgba(34, 211, 182, 0.15)',
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { grid: { color: 'rgba(36, 160, 200, 0.1)' }, ticks: { color: '#84a9ba' } },
          x: { grid: { display: false }, ticks: { color: '#84a9ba' } }
        },
        plugins: { legend: { display: false } }
      }
    });

    this.histSstChart = new Chart(sstCtx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Sea Surface Temp (°C)',
          data: data.sst_celsius || [28.2, 28.4, 28.5, 28.3, 28.6, 28.5, 28.4],
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { min: 27, max: 30, grid: { color: 'rgba(36, 160, 200, 0.1)' }, ticks: { color: '#84a9ba' } },
          x: { grid: { display: false }, ticks: { color: '#84a9ba' } }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  async checkBackendHealth() {
    const badge = document.getElementById('hud-backend-badge');
    try {
      const resp = await fetch(`${this.getApiBase()}/health`);
      if (resp.ok) {
        this.backendStatus = 'online';
        if (badge) {
          badge.innerHTML = '<span class="live-dot" style="background:#22d3b6;box-shadow:0 0 6px #22d3b6;"></span> <span class="value" style="font-size:10px;">INDIAN OCEAN BASIN (LIVE)</span>';
        }
      }
    } catch (e) {
      this.backendStatus = 'offline';
      if (badge) {
        badge.innerHTML = '<span class="live-dot" style="background:#f59e0b"></span> <span class="value" style="font-size:10px;">LOCAL CACHED SENSORS</span>';
      }
    }
  }

  startClock() {
    const timeEl = document.getElementById('hud-time-val');
    const updateTime = () => {
      const now = new Date();
      const utcStr = now.toISOString().substring(11, 19) + ' UTC';
      if (timeEl) timeEl.textContent = utcStr;
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  onLocationInspected(lat, lng) {
    if (this.mapController) {
      this.mapController.inspectCoordinates(lat, lng);
    }
  }

  toggleBasemapMode() {
    if (!this.mapController) return;
    const isSat = this.mapController.currentBasemapType === 'satellite';
    const nextMode = isSat ? 'dark' : 'satellite';
    this.mapController.setBasemap(nextMode);

    const btn = document.getElementById('btn-toggle-basemap');
    const label = document.getElementById('basemap-mode-label');
    if (label) label.textContent = nextMode === 'satellite' ? 'Satellite' : 'Tactical Dark';
    if (btn) btn.classList.toggle('active', nextMode === 'satellite');
  }

  toggleLayersPopover() {
    const popover = document.getElementById('map-layers-popover');
    if (!popover) return;
    const isShown = popover.style.display !== 'none';
    popover.style.display = isShown ? 'none' : 'flex';
    const btn = document.getElementById('btn-toggle-layers-popover');
    if (btn) btn.classList.toggle('active', !isShown);
  }

  inspectPFZ(lat, lng) {
    this.switchView('command');
    if (this.mapController) {
      if (typeof this.mapController.focusPFZ === 'function') {
        this.mapController.focusPFZ(lat, lng);
      } else if (this.mapController.map) {
        this.mapController.map.flyTo([lat, lng], 9, { duration: 1.4 });
      }
    }
  }

  inspectHazard(lat, lng, title = '') {
    this.switchView('command');
    if (this.mapController) {
      if (typeof this.mapController.focusHazard === 'function') {
        this.mapController.focusHazard(lat, lng, title);
      } else if (this.mapController.map) {
        this.mapController.map.flyTo([lat, lng], 7, { duration: 1.4 });
      }
    }
  }

  inspectAgent(agentId) {
    if (!this.agentNetwork) return;
    const agent = this.agentNetwork.agents.find(a => a.id === agentId);
    if (!agent) return;
    this.agentNetwork.addLog(agent.name, `Telemetry inspection triggered: ${agent.metric}. Status: ${agent.status}`);
  }
}

// Global App bootstrap
window.addEventListener('DOMContentLoaded', () => {
  window.orcaApp = new OrcaApp();
  window.orcaApp.init();
});
