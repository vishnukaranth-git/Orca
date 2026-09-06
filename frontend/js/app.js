/**
 * ORCA Main Application Coordinator
 * State manager, navigation router for 8 specialized marine views,
 * live telemetry synchronization, and backend API integration.
 */

class OrcaApp {
  constructor() {
    this.currentView = 'landing';
    this.mapController = null;
    this.agentNetwork = null;
    this.satelliteLab = null;
    this.simulator = null;
    this.aiAssistant = null;
    this.bgFX = null;

    this.backendStatus = 'connecting';
    this.pfzZones = [];
    this.disasters = [];
    this.currentSort = 'best';
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
    this.bindHistoricalControls();
    this.bindPFZSorting();
    this.startClock();
    this.checkBackendHealth();
    this.fetchLiveTelemetry();
    this.loadPFZData();

    // Default view: Full-Screen Cinematic Landing Page
    this.switchView('landing');

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
    const btns = document.querySelectorAll('#view-pfz .filter-btn, .dock-actions .filter-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentSort = btn.dataset.sort;
        if (!this.pfzZones || !this.pfzZones.length) {
          this.loadPFZData();
        } else {
          this.renderPFZTable();
        }
      });
    });

    // When route origin changes in Route Planner, dynamically update distances if PFZ is rendered
    const originSelect = document.getElementById('route-origin-select');
    if (originSelect) {
      originSelect.addEventListener('change', () => {
        this.renderPFZTable();
      });
    }
  }

  bindRouteControls() {
    const btn = document.getElementById('btn-calculate-route');
    const originSelect = document.getElementById('route-origin-select');
    const destSelect = document.getElementById('route-dest-select');

    const executeRouteCalculation = async () => {
      if (!btn || !originSelect || !destSelect) return;
      const origVal = originSelect.value.split(',');
      const destVal = destSelect.value.split(',');

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
          this.lastCalculatedRoute = route;
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
    };

    if (btn) {
      btn.addEventListener('click', executeRouteCalculation);
    }

    if (originSelect && destSelect) {
      originSelect.addEventListener('change', executeRouteCalculation);
      destSelect.addEventListener('change', executeRouteCalculation);
    }
  }

  displayRouteResults(route) {
    const card = document.getElementById('route-results-card');
    if (!card) return;

    const t = (k) => (window.orcaI18n ? window.orcaI18n.t(k) : k);

    const warningsHtml = (route.restricted_zone_warnings && route.restricted_zone_warnings.length > 0)
      ? route.restricted_zone_warnings.map(w => `<div style="color:#fbbf24;font-size:11px;margin-top:4px;">⚠ ${w}</div>`).join('')
      : `<div style="color:#22d3b6;font-size:11px;margin-top:4px;">${t('route_clear_text')}</div>`;

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;border-bottom:1px solid rgba(36,160,200,0.2);padding-bottom:6px;">
        <b style="font-family:'Rajdhani',sans-serif;font-size:14px;color:#fff;">${route.route_type}</b>
        <span class="telemetry-tag" style="color:#22d3b6;">${t('route_passage_cleared')}</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:11.5px;margin-bottom:8px;">
        <div><span style="color:var(--text-muted);">${t('route_distance')}</span> <b style="font-family:var(--font-mono);color:#fff;">${route.distance_km} km</b></div>
        <div><span style="color:var(--text-muted);">${t('route_nautical')}</span> <b style="font-family:var(--font-mono);color:#fff;">${route.distance_nm} NM</b></div>
        <div><span style="color:var(--text-muted);">${t('route_transit')}</span> <b style="font-family:var(--font-mono);color:#22d3b6;">${route.estimated_transit_hours} hrs</b></div>
      </div>
      <div style="background:rgba(3,14,24,0.7);padding:8px;border-radius:4px;margin-bottom:8px;">
        <div style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted);">${t('route_safety_check')}</div>
        ${warningsHtml}
      </div>
      <button id="btn-recenter-route" class="orca-recenter-btn" style="width:100%;display:flex;align-items:center;justify-content:center;gap:6px;background:rgba(34,211,182,0.12);border:1px solid rgba(34,211,182,0.45);color:#22d3b6;padding:7px 10px;border-radius:4px;cursor:pointer;font-family:var(--font-mono);font-size:11px;font-weight:600;letter-spacing:0.04em;transition:all 0.18s ease;">
        <i data-lucide="crosshair" style="width:13px;height:13px;"></i>
        <span>${t('route_recenter_btn')}</span>
      </button>
    `;
    card.style.display = 'block';

    if (window.lucide) lucide.createIcons();

    const recenterBtn = document.getElementById('btn-recenter-route');
    if (recenterBtn && this.mapController) {
      recenterBtn.addEventListener('click', () => {
        this.mapController.fitRouteBounds();
      });
    }
  }

  switchView(viewId) {
    this.currentView = viewId;

    const appContainer = document.getElementById('orca-app');
    if (appContainer) {
      if (viewId === 'landing') {
        appContainer.classList.add('is-landing-mode');
      } else {
        appContainer.classList.remove('is-landing-mode');
      }
    }

    // Update Nav buttons
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewId);
    });

    // Update View Panels
    document.querySelectorAll('.view-panel').forEach(panel => {
      const isTarget = (panel.id === `view-${viewId}`);
      panel.classList.toggle('active', isTarget);
      if (isTarget && viewId === 'landing') {
        panel.scrollTop = 0;
      }
    });

    // Landing Video Playback Check
    if (viewId === 'landing') {
      const landingVid = document.getElementById('landing-hero-video');
      if (landingVid && landingVid.paused) {
        landingVid.play().catch(e => console.log('Autoplay deferred until user interaction'));
      }
    }

    // Invalidate map size so background map is always active & responsive across all views
    if (this.mapController && this.mapController.map) {
      setTimeout(() => {
        this.mapController.map.invalidateSize();
      }, 100);

      // Manage view-specific map layers (so routes only appear on safe-routes view, etc.)
      if (this.mapController.layers.routes) {
        if (viewId === 'routes') {
          if (!this.mapController.map.hasLayer(this.mapController.layers.routes)) {
            this.mapController.layers.routes.addTo(this.mapController.map);
          }
        } else {
          if (this.mapController.map.hasLayer(this.mapController.layers.routes)) {
            this.mapController.layers.routes.remove();
          }
        }
      }

      if (this.mapController.layers.historicalStations) {
        if (viewId === 'historical') {
          if (!this.mapController.map.hasLayer(this.mapController.layers.historicalStations)) {
            this.mapController.layers.historicalStations.addTo(this.mapController.map);
          }
        } else {
          if (this.mapController.map.hasLayer(this.mapController.layers.historicalStations)) {
            this.mapController.layers.historicalStations.remove();
          }
        }
      }
    }

    if (viewId === 'pfz') {
      this.loadPFZData();
    } else if (viewId === 'disasters') {
      this.loadDisasterData();
    } else if (viewId === 'satellite') {
      setTimeout(() => {
        if (this.satelliteLab) {
          if (typeof this.satelliteLab.initMaps === 'function' && !this.satelliteLab.mapAfter) {
            this.satelliteLab.initMaps();
          }
          this.satelliteLab.invalidateMaps();
        }
      }, 100);
    } else if (viewId === 'simulator') {
      setTimeout(() => {
        if (this.simulator) this.simulator.runSimulation();
      }, 100);
    } else if (viewId === 'historical') {
      const select = document.getElementById('hist-station-select');
      if (select) {
        const parts = select.value.split(',');
        this.loadHistoricalTrends(parseFloat(parts[0]), parseFloat(parts[1]));
      } else {
        this.loadHistoricalTrends(12.9141, 74.8560);
      }
    } else if (viewId === 'routes') {
      setTimeout(() => {
        if (this.mapController) {
          this.mapController.map.invalidateSize();
          if (this.mapController.currentRouteWaypoints) {
            this.mapController.fitRouteBounds();
          } else {
            const btn = document.getElementById('btn-calculate-route');
            if (btn) btn.click();
          }
        }
      }, 150);
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

  getActiveReferenceOrigin() {
    const originSelect = document.getElementById('route-origin-select');
    if (originSelect && originSelect.value) {
      const parts = originSelect.value.split(',');
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        const text = originSelect.options[originSelect.selectedIndex]?.text?.split('(')[0]?.trim() || 'Custom Hub';
        return { latitude: lat, longitude: lng, name: text };
      }
    }
    return { latitude: 12.9141, longitude: 74.8560, name: 'New Mangalore Port' };
  }

  calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  getFallbackPFZZones() {
    return [
      {
        zone_id: "ZONE-MALPE",
        zone_name: "Zone Alpha (Offshore Malpe Shelf, Arabian Sea)",
        region: "Arabian Sea (Karnataka)",
        latitude: 13.12,
        longitude: 74.72,
        distance_km: 27.2,
        depth_m: 42,
        target_species: "Yellowfin Tuna, Indian Mackerel, Seer Fish",
        chlorophyll_mg_m3: 2.6,
        sst_gradient_c: 0.8,
        potential_score: 100.0,
        potential_level: "HIGH",
        safety_score: 60.9,
        safety_level: "MEDIUM",
        orca_score: 73.2,
        scoring_explanation: "Zone Alpha (Offshore Malpe Shelf, Arabian Sea) (Arabian Sea (Karnataka)): Potential 100.0/100 based on Chl-a 2.6 mg/m³ & SST gradient delta 0.8°C. Safety 60.9/100. Distance 27.2 km."
      },
      {
        zone_id: "ZONE-VERAVAL",
        zone_name: "Zone Beta (Saurashtra / Veraval Bank, Arabian Sea)",
        region: "Arabian Sea (Gujarat)",
        latitude: 20.75,
        longitude: 70.15,
        distance_km: 1004.8,
        depth_m: 54,
        target_species: "Silver Pomfret, Ribbonfish, Hilsa",
        chlorophyll_mg_m3: 2.8,
        sst_gradient_c: 0.9,
        potential_score: 100.0,
        potential_level: "HIGH",
        safety_score: 60.9,
        safety_level: "MEDIUM",
        orca_score: 71.1,
        scoring_explanation: "Zone Beta (Saurashtra / Veraval Bank, Arabian Sea) (Arabian Sea (Gujarat)): Potential 100.0/100 based on Chl-a 2.8 mg/m³ & SST gradient delta 0.9°C. Safety 60.9/100. Distance 1004.8 km."
      },
      {
        zone_id: "ZONE-WADGE",
        zone_name: "Zone Gamma (Wadge Bank / Kanyakumari Shelf)",
        region: "Indian Ocean (Tamil Nadu / Kerala)",
        latitude: 7.85,
        longitude: 77.30,
        distance_km: 623.3,
        depth_m: 68,
        target_species: "Skipjack Tuna, Grouper, Snapper, Squid",
        chlorophyll_mg_m3: 2.3,
        sst_gradient_c: 0.75,
        potential_score: 89.9,
        potential_level: "HIGH",
        safety_score: 60.9,
        safety_level: "MEDIUM",
        orca_score: 66.2,
        scoring_explanation: "Zone Gamma (Wadge Bank / Kanyakumari Shelf): Potential 89.9/100 based on Chl-a 2.3 mg/m³ & SST gradient delta 0.75°C. Safety 60.9/100. Distance 623.3 km."
      },
      {
        zone_id: "ZONE-MANNAR",
        zone_name: "Zone Delta (Gulf of Mannar Shelf)",
        region: "Gulf of Mannar (Tamil Nadu)",
        latitude: 8.95,
        longitude: 78.75,
        distance_km: 612.3,
        depth_m: 38,
        target_species: "Sardine, Anchovy, Trevally",
        chlorophyll_mg_m3: 1.8,
        sst_gradient_c: 0.62,
        potential_score: 71.6,
        potential_level: "MODERATE",
        safety_score: 60.9,
        safety_level: "MEDIUM",
        orca_score: 57.4,
        scoring_explanation: "Zone Delta (Gulf of Mannar Shelf): Potential 71.6/100 based on Chl-a 1.8 mg/m³ & SST gradient delta 0.62°C. Safety 60.9/100. Distance 612.3 km."
      },
      {
        zone_id: "ZONE-CHENNAI",
        zone_name: "Zone Epsilon (Coromandel Deep Slope, Bay of Bengal)",
        region: "Bay of Bengal (Tamil Nadu)",
        latitude: 13.25,
        longitude: 80.60,
        distance_km: 623.2,
        depth_m: 85,
        target_species: "Mahi Mahi, Bigeye Tuna, Swordfish",
        chlorophyll_mg_m3: 2.1,
        sst_gradient_c: 0.68,
        potential_score: 81.7,
        potential_level: "HIGH",
        safety_score: 60.9,
        safety_level: "MEDIUM",
        orca_score: 62.3,
        scoring_explanation: "Zone Epsilon (Coromandel Deep Slope, Bay of Bengal): Potential 81.7/100 based on Chl-a 2.1 mg/m³ & SST gradient delta 0.68°C. Safety 60.9/100. Distance 623.2 km."
      },
      {
        zone_id: "ZONE-VIZAG",
        zone_name: "Zone Zeta (Andhra Shelf / Visakhapatnam Channel)",
        region: "Bay of Bengal (Andhra Pradesh)",
        latitude: 17.55,
        longitude: 83.55,
        distance_km: 1065.4,
        depth_m: 76,
        target_species: "Yellowfin Tuna, Tiger Prawn, Ribbonfish",
        chlorophyll_mg_m3: 2.5,
        sst_gradient_c: 0.81,
        potential_score: 98.1,
        potential_level: "HIGH",
        safety_score: 60.9,
        safety_level: "MEDIUM",
        orca_score: 70.2,
        scoring_explanation: "Zone Zeta (Andhra Shelf / Visakhapatnam Channel): Potential 98.1/100 based on Chl-a 2.5 mg/m³ & SST gradient delta 0.81°C. Safety 60.9/100. Distance 1065.4 km."
      },
      {
        zone_id: "ZONE-ANDAMAN",
        zone_name: "Zone Eta (Port Blair Outer Ridge, Andaman Sea)",
        region: "Andaman Sea",
        latitude: 11.55,
        longitude: 92.95,
        distance_km: 1971.7,
        depth_m: 92,
        target_species: "Yellowfin Tuna, Billfish, Mahi Mahi",
        chlorophyll_mg_m3: 2.2,
        sst_gradient_c: 0.72,
        potential_score: 86.1,
        potential_level: "HIGH",
        safety_score: 60.9,
        safety_level: "MEDIUM",
        orca_score: 64.4,
        scoring_explanation: "Zone Eta (Port Blair Outer Ridge, Andaman Sea): Potential 86.1/100 based on Chl-a 2.2 mg/m³ & SST gradient delta 0.72°C. Safety 60.9/100. Distance 1971.7 km."
      },
      {
        zone_id: "ZONE-LAKSHADWEEP",
        zone_name: "Zone Theta (Kavaratti / Lakshadweep Sea)",
        region: "Lakshadweep Sea",
        latitude: 10.60,
        longitude: 72.40,
        distance_km: 371.1,
        depth_m: 60,
        target_species: "Skipjack Tuna, Rainbow Runner",
        chlorophyll_mg_m3: 1.9,
        sst_gradient_c: 0.65,
        potential_score: 76.0,
        potential_level: "MODERATE",
        safety_score: 60.9,
        safety_level: "MEDIUM",
        orca_score: 59.6,
        scoring_explanation: "Zone Theta (Kavaratti / Lakshadweep Sea): Potential 76.0/100 based on Chl-a 1.9 mg/m³ & SST gradient delta 0.65°C. Safety 60.9/100. Distance 371.1 km."
      }
    ];
  }

  async loadPFZData() {
    const container = document.getElementById('pfz-zones-container');
    if (!container) return;

    if (!this.pfzZones || !this.pfzZones.length) {
      this.pfzZones = this.getFallbackPFZZones();
      this.renderPFZTable();
    }

    try {
      const origin = this.getActiveReferenceOrigin();
      const resp = await fetch(`${this.getApiBase()}/api/pfz/ranked?latitude=${origin.latitude}&longitude=${origin.longitude}`);
      if (resp.ok) {
        const json = await resp.json();
        if (json.data && json.data.ranked_zones && json.data.ranked_zones.length) {
          this.pfzZones = json.data.ranked_zones;
          this.renderPFZTable();
        }
      }
    } catch (e) {
      console.warn("PFZ ranked fetch fallback.", e);
    }
  }

  renderPFZTable() {
    const container = document.getElementById('pfz-zones-container');
    if (!container) return;

    if (!this.pfzZones || !this.pfzZones.length) {
      this.pfzZones = this.getFallbackPFZZones();
    }

    const t = (k) => (window.orcaI18n ? window.orcaI18n.t(k) : k);
    const origin = this.getActiveReferenceOrigin();

    // Compute live distance from active reference origin for every zone
    let list = this.pfzZones.map(z => {
      const dist = this.calculateDistanceKm(origin.latitude, origin.longitude, z.latitude, z.longitude);
      return {
        ...z,
        distance_km: dist
      };
    });

    // Update active filter and reference origin labels in telemetry banner
    const filterLabel = document.getElementById('pfz-active-filter-label');
    const originLabel = document.getElementById('pfz-reference-hub-label');

    if (originLabel) {
      originLabel.textContent = `${origin.name.toUpperCase()} (${origin.latitude.toFixed(2)}°N, ${origin.longitude.toFixed(2)}°E)`;
    }

    const CANONICAL_ORDER = [
      'ZONE-MALPE',
      'ZONE-VERAVAL',
      'ZONE-WADGE',
      'ZONE-MANNAR',
      'ZONE-CHENNAI',
      'ZONE-VIZAG',
      'ZONE-ANDAMAN',
      'ZONE-LAKSHADWEEP'
    ];

    if (this.currentSort === 'all') {
      if (filterLabel) filterLabel.textContent = `${t('filter_all').toUpperCase()} (CANONICAL)`;
      list.sort((a, b) => {
        const idxA = CANONICAL_ORDER.indexOf(a.zone_id);
        const idxB = CANONICAL_ORDER.indexOf(b.zone_id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        return (a.zone_name || '').localeCompare(b.zone_name || '');
      });
    } else if (this.currentSort === 'nearest') {
      if (filterLabel) filterLabel.textContent = `${t('rank_nearest')} (COASTAL PROXIMITY)`;
      list.sort((a, b) => (parseFloat(a.distance_km) || 0) - (parseFloat(b.distance_km) || 0));
    } else if (this.currentSort === 'safest') {
      if (filterLabel) filterLabel.textContent = `${t('rank_safest')} (WEATHER & METOCEAN)`;
      list.sort((a, b) => (parseFloat(b.safety_score) || 0) - (parseFloat(a.safety_score) || 0));
    } else if (this.currentSort === 'potential') {
      if (filterLabel) filterLabel.textContent = `${t('rank_highest_catch')} (CHL-A & SST)`;
      list.sort((a, b) => (parseFloat(b.potential_score) || 0) - (parseFloat(a.potential_score) || 0));
    } else { // 'best' or 'orca'
      if (filterLabel) filterLabel.textContent = `${t('rank_best_overall')} (ORCA SCORE)`;
      list.sort((a, b) => (parseFloat(b.orca_score) || 0) - (parseFloat(a.orca_score) || 0));
    }

    container.innerHTML = list.map((z, idx) => {
      const rank = idx + 1;
      let rankTag = '';
      if (this.currentSort === 'best' || this.currentSort === 'orca') {
        rankTag = `<span class="pfz-card-rank-tag best">#${rank} ${t('rank_best_overall')}</span>`;
      } else if (this.currentSort === 'nearest') {
        rankTag = `<span class="pfz-card-rank-tag nearest">#${rank} ${t('rank_nearest')} · ${z.distance_km} KM</span>`;
      } else if (this.currentSort === 'safest') {
        rankTag = `<span class="pfz-card-rank-tag safest">#${rank} ${t('rank_safest')} · SCORE ${z.safety_score}</span>`;
      } else if (this.currentSort === 'potential') {
        rankTag = `<span class="pfz-card-rank-tag potential">#${rank} ${t('rank_highest_catch')} · ${z.potential_score}</span>`;
      } else {
        rankTag = `<span class="pfz-card-rank-tag all">${t('rank_sector_of')} ${rank} / ${list.length}</span>`;
      }

      const isBest = this.currentSort === 'best' || this.currentSort === 'orca';
      const isNearest = this.currentSort === 'nearest';
      const isSafest = this.currentSort === 'safest';
      const isPotential = this.currentSort === 'potential';

      return `
        <div class="pfz-full-card" onclick="orcaApp.inspectPFZ(${z.latitude}, ${z.longitude})">
          <div class="pfz-card-header-row">
            <div class="pfz-card-title-group">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;">
                ${rankTag}
                <span class="pfz-card-region-tag">${z.region || 'INDIAN EEZ'}</span>
              </div>
              <div class="pfz-card-zone-name">${z.zone_name}</div>
              <div class="pfz-card-coords-tag" style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono);">
                ${t('card_coordinates')} ${z.latitude.toFixed(2)}°N, ${z.longitude.toFixed(2)}°E
              </div>
            </div>
            <div class="pfz-full-orca-badge ${isBest ? 'highlighted' : ''}">
              ORCA ${z.orca_score}
            </div>
          </div>

          <div class="pfz-card-metrics-grid">
            <div class="pfz-metric-cell ${isPotential ? 'active-metric' : ''}">
              <span class="lbl">${t('card_potential')}</span>
              <span class="val ${isPotential ? 'highlight-active' : 'green'}">${z.potential_score}/100</span>
            </div>
            <div class="pfz-metric-cell ${isSafest ? 'active-metric' : ''}">
              <span class="lbl">${t('card_safety')}</span>
              <span class="val ${isSafest ? 'highlight-active' : ''}">${z.safety_score}/100</span>
            </div>
            <div class="pfz-metric-cell ${isNearest ? 'active-metric' : ''}">
              <span class="lbl">${t('card_distance')}</span>
              <span class="val ${isNearest ? 'highlight-active' : ''}">${z.distance_km} km</span>
            </div>
            <div class="pfz-metric-cell">
              <span class="lbl">${t('card_depth')}</span>
              <span class="val">-${z.depth_m}m</span>
            </div>
          </div>

          <div class="pfz-species-row">
            <i data-lucide="fish"></i>
            <span><b>${t('card_target_species')}</b> ${z.target_species}</span>
          </div>

          <div class="pfz-rationale-box">
            ${z.scoring_explanation}
          </div>

          <button class="pfz-select-plot-btn" onclick="event.stopPropagation(); orcaApp.inspectPFZ(${z.latitude}, ${z.longitude})">
            <i data-lucide="crosshair" style="width:13px;height:13px;"></i>
            <span>${t('card_btn_plot')}</span>
          </button>
        </div>
      `;
    }).join('');

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  async loadDisasterData() {
    const container = document.getElementById('disaster-feed-container');
    if (!container) return;

    const t = (k) => (window.orcaI18n ? window.orcaI18n.t(k) : k);

    try {
      const resp = await fetch(`${this.getApiBase()}/api/disasters`);
      if (resp.ok) {
        const json = await resp.json();
        const hazards = json.data.hazards || [];
        
        container.innerHTML = hazards.map(h => {
          let lat = 12.78, lng = 75.12;
          const titLower = (h.title + " " + (h.description || "")).toLowerCase();
          if (titLower.includes("japan")) { lat = 34.5; lng = 137.5; }
          else if (titLower.includes("vietnam")) { lat = 16.0; lng = 108.5; }
          else if (titLower.includes("cyclone") || titLower.includes("twentythree") || titLower.includes("nwpacific") || titLower.includes("philippine")) { lat = 17.5; lng = 124.0; }
          else if (titLower.includes("bengal") || titLower.includes("odisha") || titLower.includes("andhra")) { lat = 18.5; lng = 87.0; }
          else if (titLower.includes("arabian") || titLower.includes("gujarat") || titLower.includes("karnataka")) { lat = 14.5; lng = 73.5; }
          else if (titLower.includes("lakshadweep")) { lat = 10.5; lng = 72.5; }
          else if (titLower.includes("andaman")) { lat = 11.5; lng = 93.0; }

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
                <b>${t('disaster_action_lbl')}</b>
                <span>${h.recommended_action || 'Avoid affected maritime sectors; monitor local port control on VHF Ch 16.'}</span>
              </div>

              <button class="disaster-select-plot-btn" onclick="event.stopPropagation(); orcaApp.inspectHazard(${lat}, ${lng}, '${safeTitle}')">
                <i data-lucide="crosshair" style="width:13px;height:13px;"></i>
                <span>${t('card_btn_plot')}</span>
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

  bindHistoricalControls() {
    const select = document.getElementById('hist-station-select');
    if (!select) return;
    select.addEventListener('change', (e) => {
      const parts = e.target.value.split(',');
      const lat = parseFloat(parts[0]);
      const lon = parseFloat(parts[1]);
      this.loadHistoricalTrends(lat, lon);
      if (this.mapController) {
        this.mapController.flyTo(lat, lon, 8.5);
      }
    });
  }

  syncHistoricalToRegion(regionKey) {
    const regionStationMap = {
      'arabian_sea': 'mangalore',
      'bay_of_bengal': 'chennai',
      'lakshadweep_sea': 'kochi',
      'andaman_sea': 'andaman',
      'gulf_of_mannar': 'mannar',
      'gulf_of_sri_lanka': 'palk_strait',
      'indian_ocean': 'equatorial'
    };

    const targetStationId = regionStationMap[regionKey];
    if (!targetStationId) return;

    const select = document.getElementById('hist-station-select');
    if (select) {
      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].dataset.id === targetStationId) {
          select.selectedIndex = i;
          const parts = select.options[i].value.split(',');
          const lat = parseFloat(parts[0]);
          const lon = parseFloat(parts[1]);
          this.loadHistoricalTrends(lat, lon);
          break;
        }
      }
    }
  }

  selectHistoricalStation(stationId, lat, lon, name) {
    const select = document.getElementById('hist-station-select');
    if (select) {
      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].dataset.id === stationId) {
          select.selectedIndex = i;
          break;
        }
      }
    }
    this.loadHistoricalTrends(lat, lon);
    if (this.mapController) {
      this.mapController.flyTo(lat, lon, 8.5);
    }
  }

  async loadHistoricalTrends(lat = 12.9141, lon = 74.8560) {
    try {
      const resp = await fetch(`${this.getApiBase()}/api/marine/historical?latitude=${lat}&longitude=${lon}`);
      if (resp.ok) {
        const json = await resp.json();
        const data = json.data;
        this.renderHistoricalCharts(data);

        // Update mini telemetry summary
        if (data.wave_heights_m && data.wave_heights_m.length > 0) {
          const meanSwell = (data.wave_heights_m.reduce((a, b) => a + b, 0) / data.wave_heights_m.length).toFixed(2);
          const maxWave = Math.max(...data.wave_heights_m).toFixed(2);
          const meanSst = (data.sst_celsius && data.sst_celsius.length > 0)
            ? (data.sst_celsius.reduce((a, b) => a + b, 0) / data.sst_celsius.length).toFixed(1)
            : '28.4';

          const meanSwellEl = document.getElementById('hist-mean-swell');
          const maxWaveEl = document.getElementById('hist-max-wave');
          const meanSstEl = document.getElementById('hist-mean-sst');

          if (meanSwellEl) meanSwellEl.textContent = `${meanSwell} m`;
          if (maxWaveEl) maxWaveEl.textContent = `${maxWave} m`;
          if (meanSstEl) meanSstEl.textContent = `${meanSst} °C`;
        }
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
    const waveData = (data.wave_heights_m && data.wave_heights_m.length > 0) ? data.wave_heights_m : [1.2, 1.4, 1.3, 1.1, 1.5, 1.3, 1.2];
    const swellData = data.swell_wave_heights_m || waveData.map(w => +(w * 0.85).toFixed(2));
    const sstData = (data.sst_celsius && data.sst_celsius.length > 0) ? data.sst_celsius : [28.2, 28.4, 28.5, 28.3, 28.6, 28.5, 28.4];

    // Compute dynamic min/max with padding for wave chart
    const minW = Math.max(0, +(Math.min(...waveData, ...swellData) - 0.2).toFixed(1));
    const maxW = +(Math.max(...waveData, ...swellData) + 0.3).toFixed(1);

    // Compute dynamic min/max with padding for SST chart
    const minSst = +(Math.min(...sstData) - 0.4).toFixed(1);
    const maxSst = +(Math.max(...sstData) + 0.4).toFixed(1);

    this.histWaveChart = new Chart(waveCtx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Significant Wave Height (m)',
            data: waveData,
            borderColor: '#22d3b6',
            backgroundColor: 'rgba(34, 211, 182, 0.18)',
            pointBackgroundColor: '#22d3b6',
            pointBorderColor: '#0a1926',
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
            tension: 0.32,
            borderWidth: 2.2
          },
          {
            label: 'Dominant Swell Height (m)',
            data: swellData,
            borderColor: '#38bdf8',
            backgroundColor: 'transparent',
            pointBackgroundColor: '#38bdf8',
            pointBorderColor: '#0a1926',
            pointRadius: 3,
            borderDash: [4, 4],
            fill: false,
            tension: 0.32,
            borderWidth: 1.8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          y: {
            min: minW,
            max: maxW,
            grid: { color: 'rgba(36, 160, 200, 0.12)' },
            ticks: {
              color: '#84a9ba',
              font: { family: "'JetBrains Mono', monospace", size: 10 },
              callback: (v) => `${v} m`
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              color: '#84a9ba',
              font: { family: "'JetBrains Mono', monospace", size: 10 }
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#94a3b8',
              font: { family: "'Inter', sans-serif", size: 10 },
              boxWidth: 12,
              padding: 6
            }
          },
          tooltip: {
            backgroundColor: 'rgba(7, 24, 38, 0.95)',
            titleFont: { family: "'Rajdhani', sans-serif", size: 12 },
            bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
            borderColor: 'rgba(34, 211, 182, 0.4)',
            borderWidth: 1,
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw} m`
            }
          }
        }
      }
    });

    this.histSstChart = new Chart(sstCtx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Sea Surface Temp (°C)',
          data: sstData,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.16)',
          pointBackgroundColor: '#f59e0b',
          pointBorderColor: '#0a1926',
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.32,
          borderWidth: 2.2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          y: {
            min: minSst,
            max: maxSst,
            grid: { color: 'rgba(36, 160, 200, 0.12)' },
            ticks: {
              color: '#84a9ba',
              font: { family: "'JetBrains Mono', monospace", size: 10 },
              callback: (v) => `${v} °C`
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              color: '#84a9ba',
              font: { family: "'JetBrains Mono', monospace", size: 10 }
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(7, 24, 38, 0.95)',
            titleFont: { family: "'Rajdhani', sans-serif", size: 12 },
            bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
            borderColor: 'rgba(245, 158, 11, 0.4)',
            borderWidth: 1,
            callbacks: {
              label: (ctx) => ` Sea Surface Temp: ${ctx.raw} °C`
            }
          }
        }
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

// Native Fullscreen Controller
window.toggleOrcaFullscreen = function() {
  try {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(err => console.warn("Fullscreen request:", err));
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  } catch (e) {
    console.warn("Fullscreen toggle exception", e);
  }
};

const syncFullscreenIcons = () => {
  const isFull = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
  document.querySelectorAll('#fullscreen-icon, .fs-icon-state').forEach(ic => {
    ic.setAttribute('data-lucide', isFull ? 'minimize' : 'maximize');
  });
  document.querySelectorAll('.fullscreen-text').forEach(tx => {
    tx.textContent = isFull ? 'Exit Fullscreen' : 'Fullscreen';
  });
  if (window.lucide) lucide.createIcons();
};

document.addEventListener('fullscreenchange', syncFullscreenIcons);
document.addEventListener('webkitfullscreenchange', syncFullscreenIcons);

// Global App bootstrap
window.addEventListener('DOMContentLoaded', () => {
  window.orcaApp = new OrcaApp();
  window.orcaApp.init();
});

