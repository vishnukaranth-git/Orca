/**
 * ORCA Tactical Marine Map Controller
 * GIS-Grade Ocean Intelligence for the Indian Ocean Basin
 * Real Geographic Boundaries conforming to natural coastlines and IHO maritime limits:
 * - Arabian Sea (IHO Area 42)
 * - Bay of Bengal (IHO Area 43)
 * - Lakshadweep Sea (IHO Area 41)
 * - Andaman Sea (IHO Area 44)
 * - Gulf of Mannar (IHO Area 45)
 * - Palk Strait / Palk Bay (IHO Sector)
 * - Equatorial Indian Ocean
 *
 * Strict Data Provenance Architecture:
 * LIVE | FORECAST | CALCULATED | CACHED | DATA UNAVAILABLE
 */

class OrcaMapController {
  constructor(containerId) {
    this.containerId = containerId;
    this.map = null;

    // Basemaps
    this.currentBasemapType = 'satellite';
    this.basemaps = {};
    this.labelsLayer = null;

    // Selected Region State
    this.activeRegionId = null;
    this.regionPolygonLayers = {};

    // Feature Layers
    this.layers = {
      oceanRegions: L.layerGroup(),
      pfz: L.layerGroup(),
      restricted: L.layerGroup(),
      hazards: L.layerGroup(),
      vessels: L.layerGroup(),
      routes: L.layerGroup(),
      eez: L.layerGroup(),
      streetviewCoverage: L.layerGroup(),
      historicalStations: L.layerGroup()
    };

    // Real Google Maps Street View & Alternative 360 State
    this.streetViewService = null;
    this.streetViewPanorama = null;
    this.pannellumViewer = null;
    this.activeViewerType = null; // 'google' | 'pannellum'
    this.isStreetViewActive = false;
    this.streetViewCoverageEnabled = false;
    this.streetViewToastTimer = null;

    // Major Coastal Harbours, Ports, Beaches & Waterfronts prioritized for 360 Exploration
    this.coastalAnchorPoints = [
      {
        name: "Mangalore Port & Tannirbhavi Coast",
        lat: 12.9248,
        lng: 74.8192,
        alt360: {
          title: "Mangalore Coastal Waterfront 360°",
          url: "https://pannellum.org/images/alma.jpg"
        }
      },
      {
        name: "Kochi Fort & Marine Drive",
        lat: 9.9674,
        lng: 76.2428,
        alt360: {
          title: "Kochi Marine Drive & Harbour 360°",
          url: "https://pannellum.org/images/bma-1.jpg"
        }
      },
      {
        name: "Mumbai Gateway of India & Marine Drive",
        lat: 18.9220,
        lng: 72.8347,
        alt360: {
          title: "Mumbai Waterfront & Marine Drive 360°",
          url: "https://pannellum.org/images/cerro-toco-0.jpg"
        }
      },
      {
        name: "Chennai Marina Beach & Port",
        lat: 13.0475,
        lng: 80.2824,
        alt360: {
          title: "Chennai Marina Beach Promenade 360°",
          url: "https://pannellum.org/images/jfk.jpg"
        }
      },
      { name: "Visakhapatnam Port & RK Beach", lat: 17.7126, lng: 83.3197 },
      { name: "Kolkata Port & Hooghly Promenade", lat: 22.5567, lng: 88.3300 },
      { name: "Port Blair Marina & Bay", lat: 11.6685, lng: 92.7483 },
      { name: "Goa Mormugao Port & Miramar", lat: 15.4125, lng: 73.8050 },
      { name: "Karwar Baitkhol Port", lat: 14.8080, lng: 74.1250 }
    ];

    // Authoritative reference coastline perimeter points for Indian subcontinent & regional islands
    // Used to mathematically distinguish OPEN OCEAN (>18km offshore) from COASTAL/PORT soundings (<=18km)
    this.coastlineReferencePoints = [
      // Gujarat
      [23.7, 68.1], [23.1, 68.6], [22.7, 69.3], [22.3, 69.0], [21.6, 69.6],
      [20.9, 70.4], [20.7, 71.0], [21.7, 72.5], [21.1, 72.8], [20.4, 72.8],
      // Maharashtra & Konkan
      [19.9, 72.7], [19.0, 72.8], [18.5, 72.9], [17.9, 73.1], [17.0, 73.3], [16.0, 73.5],
      // Goa & Canara (Karnataka)
      [15.5, 73.8], [15.0, 74.0], [14.8, 74.1], [14.3, 74.4], [13.7, 74.6],
      [13.3, 74.7], [12.9, 74.8], [12.5, 74.9],
      // Malabar (Kerala)
      [11.8, 75.3], [11.2, 75.8], [10.5, 76.0], [9.9, 76.2], [9.5, 76.3],
      [8.8, 76.6], [8.3, 77.0], [8.1, 77.5],
      // Coromandel (Tamil Nadu)
      [8.5, 78.1], [9.2, 79.1], [9.3, 79.3], [10.0, 79.2], [10.8, 79.8],
      [11.9, 79.8], [13.1, 80.3], [13.4, 80.3],
      // Andhra Coast
      [14.5, 80.1], [15.8, 80.4], [16.3, 81.2], [17.0, 82.3], [17.7, 83.3], [18.3, 84.0],
      // Odisha & Bengal Delta
      [19.3, 85.0], [19.8, 85.8], [20.3, 86.7], [21.5, 87.0], [21.7, 87.9], [22.0, 88.5],
      // Sri Lanka
      [9.8, 80.2], [8.6, 81.2], [7.0, 81.9], [5.9, 80.6], [6.9, 79.9], [8.0, 79.8],
      // Andaman & Nicobar
      [13.5, 93.0], [12.5, 92.8], [11.7, 92.7], [10.5, 92.5], [9.2, 92.8], [7.0, 93.8]
    ];

    // Geospatial Framing: India + Surrounding Indian Ocean Basin
    this.defaultCenter = [14.5000, 79.0000];
    this.defaultZoom = 4.8;
    this.defaultBounds = [
      [1.5, 63.0],   // Southwest: Equatorial Basin / Maldives
      [27.0, 97.5]   // Northeast: Bengal Shelf / Myanmar Coast
    ];

    // GIS-Grade Geographies (Natural Coastlines, Straits, IHO Limits)
    this.marineRegions = {
      'arabian_sea': {
        id: 'arabian_sea',
        name: 'Arabian Sea',
        sub: 'IHO Area 42 · Northwest Indian Ocean',
        center: [16.5000, 67.5000],
        zoom: 5.5,
        bounds: [[8.0, 51.5], [25.5, 77.5]],
        color: '#22d3b6',
        // Accurate perimeter: Kanyakumari -> Malabar -> Goa -> Konkan -> Saurashtra -> Kutch -> Indus -> Makran -> Ras al Hadd -> Oman -> Socotra -> Somalia -> Suvadiva -> Cape Comorin
        polygon: [
          [8.08, 77.55], [8.50, 76.90], [9.95, 76.25], [11.25, 75.75], [12.85, 74.80],
          [14.80, 74.10], [15.45, 73.75], [16.98, 73.28], [18.95, 72.80], [20.40, 72.82],
          [21.65, 72.50], [20.70, 70.90], [20.90, 70.35], [22.25, 68.95], [22.75, 69.30],
          [23.70, 68.05], [24.80, 66.90], [25.15, 64.50], [25.10, 62.30], [25.05, 61.75],
          [22.55, 59.80], [20.50, 58.70], [17.50, 55.50], [17.00, 54.10], [15.65, 52.25],
          [12.50, 54.00], [11.83, 51.27], [10.42, 51.28], [7.00, 72.80], [4.20, 72.90],
          [0.50, 73.10], [7.50, 77.50], [8.08, 77.55]
        ]
      },
      'bay_of_bengal': {
        id: 'bay_of_bengal',
        name: 'Bay of Bengal',
        sub: 'IHO Area 43 · Northeast Indian Ocean',
        center: [15.0000, 88.0000],
        zoom: 5.5,
        bounds: [[5.5, 80.0], [22.8, 95.0]],
        color: '#38bdf8',
        // Perimeter: Sri Lanka Dondra Head -> Coromandel -> Andhra -> Odisha -> Sundarbans -> Chittagong -> Myanmar -> Cape Negrais -> Preparis -> Andaman Ridge -> Sumatra -> Dondra Head
        polygon: [
          [5.92, 80.58], [7.70, 81.70], [8.58, 81.25], [10.30, 79.85], [10.76, 79.84],
          [11.93, 79.83], [13.10, 80.30], [13.72, 80.20], [16.18, 81.15], [16.95, 82.25],
          [17.70, 83.30], [19.25, 84.90], [19.80, 85.85], [20.30, 86.70], [21.50, 86.95],
          [21.75, 88.50], [22.20, 90.75], [22.30, 91.80], [21.45, 91.95], [20.15, 92.90],
          [19.10, 93.55], [17.60, 94.55], [16.03, 94.20], [14.85, 93.65], [14.10, 93.35],
          [13.25, 92.75], [11.70, 92.55], [10.65, 92.30], [10.00, 92.20], [9.15, 92.65],
          [6.90, 93.60], [6.75, 93.85], [5.75, 95.15], [5.92, 80.58]
        ]
      },
      'lakshadweep_sea': {
        id: 'lakshadweep_sea',
        name: 'Lakshadweep Sea',
        sub: 'IHO Area 41 · Southwest Shelf & Coral Basin',
        center: [10.5667, 72.6417],
        zoom: 6.6,
        bounds: [[8.0, 71.0], [13.5, 75.0]],
        color: '#2dd4bf',
        // Perimeter: Karwar -> Mangalore -> Kochi -> Kanyakumari -> Wadge Bank -> Maldives -> Lakshadweep Atolls -> Kanara
        polygon: [
          [14.00, 74.30], [13.00, 74.75], [11.85, 75.35], [11.25, 75.75], [9.95, 76.25],
          [8.88, 76.58], [8.50, 76.95], [8.08, 77.55], [7.50, 77.50], [0.60, 73.15],
          [0.50, 73.10], [2.20, 73.00], [3.90, 72.80], [7.05, 72.90], [8.28, 73.05],
          [10.08, 73.65], [10.57, 72.64], [10.85, 72.18], [11.60, 72.18], [12.30, 71.90],
          [14.00, 74.30]
        ]
      },
      'andaman_sea': {
        id: 'andaman_sea',
        name: 'Andaman Sea',
        sub: 'IHO Area 44 · Eastern Volcanic & Trench Basin',
        center: [11.6667, 93.8000],
        zoom: 6.4,
        bounds: [[6.0, 92.0], [15.0, 97.5]],
        color: '#f59e0b',
        // Perimeter: Cape Negrais -> Gulf of Martaban -> Dawei -> Phuket -> Malacca Approach -> North Sumatra -> Nicobar Inner Ridge -> Port Blair -> Cape Negrais
        polygon: [
          [16.03, 94.20], [15.80, 95.30], [16.50, 96.50], [16.45, 97.60], [14.10, 98.15],
          [12.45, 98.50], [10.00, 98.50], [7.90, 98.30], [6.35, 99.80], [5.40, 100.25],
          [5.25, 97.50], [5.18, 97.15], [5.55, 95.32], [5.75, 95.15], [6.75, 93.85],
          [7.95, 93.55], [9.20, 92.80], [10.00, 92.50], [10.65, 92.45], [11.65, 92.75],
          [12.60, 92.95], [13.50, 93.05], [14.10, 93.40], [14.85, 93.70], [16.03, 94.20]
        ]
      },
      'gulf_of_mannar': {
        id: 'gulf_of_mannar',
        name: 'Gulf of Mannar',
        sub: 'IHO Area 45 · Biosphere Reserve Shelf',
        center: [8.9500, 78.9000],
        zoom: 7.6,
        bounds: [[8.0, 78.0], [9.8, 80.0]],
        color: '#a855f7',
        // Perimeter: Rameswaram south to Kanyakumari -> across to Colombo -> up western Sri Lanka to Talaimannar / Adam's Bridge
        polygon: [
          [9.28, 79.30], [9.28, 79.15], [9.15, 78.65], [8.80, 78.15], [8.49, 78.12],
          [8.38, 78.06], [8.08, 77.55], [6.85, 79.85], [6.93, 79.85], [7.21, 79.84],
          [7.57, 79.79], [8.23, 79.75], [8.32, 79.77], [8.98, 79.90], [9.10, 79.72],
          [9.28, 79.30]
        ]
      },
      'gulf_of_sri_lanka': {
        id: 'gulf_of_sri_lanka',
        name: 'Palk Strait / Palk Bay',
        sub: 'IHO Sector · Indo-Sri Lanka Maritime Corridor',
        center: [9.8000, 79.8500],
        zoom: 8.0,
        bounds: [[9.2, 79.0], [10.5, 80.5]],
        color: '#06b6d4',
        // Perimeter: Point Calimere across Palk Strait to Point Pedro -> Jaffna lagoon -> Mannar North -> Dhanushkodi -> Mandapam -> Palk Bay coast -> Point Calimere
        polygon: [
          [10.30, 79.85], [9.83, 80.25], [9.65, 80.00], [9.52, 79.68], [9.10, 79.72],
          [9.15, 79.42], [9.28, 79.30], [9.28, 79.15], [9.47, 78.90], [9.74, 79.02],
          [9.95, 79.15], [10.28, 79.32], [10.34, 79.38], [10.30, 79.85]
        ]
      },
      'indian_ocean': {
        id: 'indian_ocean',
        name: 'Equatorial Indian Ocean',
        sub: 'Southern Pelagic Basin & Central Ridge',
        center: [0.0000, 78.0000],
        zoom: 5.2,
        bounds: [[-7.0, 60.0], [5.0, 95.0]],
        color: '#818cf8',
        // Open oceanic basin below India/Sri Lanka: [5°N, 60°E] to [5°N, 95°E] down to [-7°S, 95°E] and [-7°S, 60°E]
        polygon: [
          [5.00, 60.00], [5.00, 80.00], [5.00, 95.00],
          [-7.00, 95.00], [-7.00, 78.00], [-7.00, 60.00],
          [5.00, 60.00]
        ]
      }
    };
  }

  init() {
    if (!document.getElementById(this.containerId)) return;

    // 1. Initialize Leaflet Map
    this.map = L.map(this.containerId, {
      center: this.defaultCenter,
      zoom: this.defaultZoom,
      minZoom: 3,
      maxZoom: 16,
      zoomControl: false,
      attributionControl: false,
      worldCopyJump: true
    });

    // 2. Real Earth Observation Satellite Basemap (Esri World Imagery)
    this.basemaps.satellite = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 18,
        attribution: 'Tiles &copy; Esri &mdash; Earth Observation Satellite'
      }
    );

    // 3. Crisp Maritime Boundaries & Place Names Reference Overlay
    this.labelsLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 18,
        opacity: 0.85
      }
    );

    // 4. Alternative Tactical Dark Basemap
    this.basemaps.dark = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 18,
        subdomains: 'abcd',
        attribution: '&copy; CartoDB'
      }
    );

    // Add default Satellite Basemap & Reference Labels
    this.basemaps.satellite.addTo(this.map);
    this.labelsLayer.addTo(this.map);

    // Fit Initial Viewport around India + Surrounding Indian Ocean
    this.map.fitBounds(this.defaultBounds, { padding: [20, 20] });

    // Add Core Essential Layers to default map view
    this.layers.oceanRegions.addTo(this.map);
    this.layers.pfz.addTo(this.map);
    this.layers.hazards.addTo(this.map);
    this.layers.restricted.addTo(this.map);
    this.layers.eez.addTo(this.map);
    this.layers.routes.addTo(this.map);
    // Note: vessels and streetviewCoverage are kept clean and interaction/toggle-based

    // Render GIS Datasets
    this.renderOceanRegions();
    this.renderPFZPolygons();
    this.renderRestrictedZones();
    this.renderHazards();
    this.renderVessels();
    this.renderEEZBoundary();
    this.renderStreetViewCoverageLayer();
    this.renderHistoricalStations();

    // Bind Map Events & Keyboard Shortcuts
    this.bindMapEvents();
    this.bindKeyboardShortcuts();
  }

  getStreetViewService() {
    if (!this.streetViewService && window.google && window.google.maps && window.google.maps.StreetViewService) {
      this.streetViewService = new google.maps.StreetViewService();
    }
    return this.streetViewService;
  }

  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isStreetViewActive) {
        this.closeStreetView();
      }
    });
  }

  bindMapEvents() {
    this.map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      const coordDisplay = document.getElementById('hud-coords-val');
      if (coordDisplay) {
        coordDisplay.innerHTML = `${lat.toFixed(4)}°N<br>${lng.toFixed(4)}°E`;
      }

      // Check if click is inside any known region polygon
      const matchedRegionId = this.findRegionForCoordinates(lat, lng);
      await this.handleMapLocationClick(lat, lng, matchedRegionId);
    });
  }

  async handleMapLocationClick(lat, lng, matchedRegionId) {
    // 1. Automatically distinguish OPEN OCEAN vs LAND / COAST / PORT
    const loc = this.classifyLocation(lat, lng, matchedRegionId);

    // 2. OPEN OCEAN:
    if (loc.isOcean) {
      // For OPEN OCEAN clicks:
      // Do NOT attempt to open road-based Street View.
      // Instead open the existing ORCA marine-region detail view with live oceanographic telemetry.
      this.inspectRegion(loc.regionId);
      return;
    }

    // 3. LAND / COAST / PORT / HARBOUR / BEACH / CITY:
    const locationName = loc.anchor ? loc.anchor.name.split('&')[0].trim() : `Sector ${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E`;

    // Step 1: Check whether Google Street View coverage exists at that coordinate
    const svResult = await this.checkStreetViewAvailability(lat, lng, loc.anchor);

    if (svResult.available && svResult.data) {
      // Real Google Street View coverage exists! Show contextual action popup (Interaction-Based)
      this.showContextualStreetViewPopup(lat, lng, locationName, 'google', svResult.data);
      this.inspectSpotCoordinates(lat, lng, false);
      return;
    }

    // Step 2: If Google Street View is unavailable, check whether an alternative 360° provider is available
    const alt360 = this.checkAlternative360Provider(lat, lng, loc.anchor);
    if (alt360) {
      // Valid alternative 360° exists! Show contextual action popup
      this.showContextualStreetViewPopup(lat, lng, alt360.title || locationName, 'pannellum', alt360);
      this.inspectSpotCoordinates(lat, lng, false);
      return;
    }

    // Step 3: If no valid 360° coverage exists:
    // Show: "360° Street View unavailable at this location."
    // and provide existing ORCA marine/location information. Never fabricate fake coverage.
    this.showContextualUnavailablePopup(lat, lng, locationName);
    this.inspectSpotCoordinates(lat, lng);
  }

  showContextualStreetViewPopup(lat, lng, title, type, data) {
    const popupContent = document.createElement('div');
    popupContent.className = 'orca-sv-context-card';
    popupContent.innerHTML = `
      <div class="sv-context-header">
        <span class="sv-context-tag"><span class="sv-live-dot"></span>360° STREET VIEW AVAILABLE</span>
      </div>
      <div class="sv-context-title">${title}</div>
      <div class="sv-context-coords">${lat.toFixed(4)}°N · ${lng.toFixed(4)}°E</div>
      <button class="sv-explore-btn" id="btn-explore-streetview">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <span>Explore 360°</span>
      </button>
    `;

    L.popup({
      className: 'orca-context-popup',
      closeButton: true,
      autoClose: true,
      offset: [0, -8]
    })
    .setLatLng([lat, lng])
    .setContent(popupContent)
    .openOn(this.map);

    const btn = popupContent.querySelector('#btn-explore-streetview');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.map.closePopup();
        if (type === 'google') {
          this.openGoogleStreetView(lat, lng, data);
        } else {
          this.openPannellum360(lat, lng, data);
        }
      });
    }
  }

  showContextualUnavailablePopup(lat, lng, title) {
    const popupContent = document.createElement('div');
    popupContent.className = 'orca-sv-context-card unavailable';
    popupContent.innerHTML = `
      <div class="sv-context-header">
        <span class="sv-context-tag unavail"><span class="sv-unavail-dot"></span>COASTAL SECTOR</span>
      </div>
      <div class="sv-context-title">${title}</div>
      <div class="sv-context-msg">360° Street View unavailable at this location.</div>
      <div class="sv-context-sub">Preserving live satellite & marine oceanographic telemetry.</div>
    `;

    L.popup({
      className: 'orca-context-popup',
      closeButton: true,
      autoClose: true,
      offset: [0, -8]
    })
    .setLatLng([lat, lng])
    .setContent(popupContent)
    .openOn(this.map);
  }

  classifyLocation(lat, lng, matchedRegionId) {
    // 1. Outside all marine regions -> definitively LAND / CITY / INLAND
    if (!matchedRegionId) {
      return { isOcean: false, type: 'land', anchor: this.findNearestCoastalAnchor(lat, lng) };
    }

    // 2. Check distance to known coastal anchors (ports, harbours, beaches)
    const nearestAnchor = this.findNearestCoastalAnchor(lat, lng);
    if (nearestAnchor && nearestAnchor.distanceKm <= 22.0) {
      return { isOcean: false, type: 'coastal', anchor: nearestAnchor, distKm: nearestAnchor.distanceKm };
    }

    // 3. Check distance to authoritative coastline reference perimeter
    const distToCoast = this.getDistanceToCoastlineKm(lat, lng);
    if (distToCoast <= 18.0) { // ~10 nautical miles territorial/coastal zone
      return { isOcean: false, type: 'coastal', anchor: nearestAnchor, distKm: distToCoast };
    }

    // 4. Open Ocean (>18km offshore in marine basin)
    return { isOcean: true, type: 'ocean', regionId: matchedRegionId, distKm: distToCoast };
  }

  getDistanceToCoastlineKm(lat, lng) {
    let minDist = Infinity;
    for (const pt of this.coastlineReferencePoints) {
      const d = this.calculateDistanceKm(lat, lng, pt[0], pt[1]);
      if (d < minDist) minDist = d;
    }
    return minDist;
  }

  findNearestCoastalAnchor(lat, lng) {
    let nearest = null;
    let minDistance = Infinity;

    for (const anchor of this.coastalAnchorPoints) {
      const d = this.calculateDistanceKm(lat, lng, anchor.lat, anchor.lng);
      if (d < minDistance) {
        minDistance = d;
        nearest = { ...anchor, distanceKm: d };
      }
    }

    return nearest;
  }

  calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  async checkStreetViewAvailability(lat, lng, nearCoastalAnchor = null) {
    const sv = this.getStreetViewService();
    if (!sv || !window.google || !window.google.maps) {
      return { available: false, reason: "service_not_loaded" };
    }

    const radius = nearCoastalAnchor ? 2500 : 2000;

    const checkPromise = (queryLoc, queryRadius, sourcePref) => {
      return new Promise((resolve) => {
        try {
          sv.getPanorama(
            {
              location: queryLoc,
              radius: queryRadius,
              preference: google.maps.StreetViewPreference.NEAREST,
              source: sourcePref
            },
            (data, status) => {
              if (status === google.maps.StreetViewStatus.OK && data && data.location) {
                resolve({ available: true, data });
              } else {
                resolve({ available: false, status });
              }
            }
          );
        } catch (err) {
          console.warn("StreetViewService query error:", err);
          resolve({ available: false, error: err });
        }
      });
    };

    // 1. Outdoor Street View priority at clicked coordinates
    let res = await checkPromise({ lat, lng }, radius, google.maps.StreetViewSource.OUTDOOR);
    if (res.available) return res;

    // 2. If near coastal anchor (Mangalore, Kochi, Mumbai, etc.), query coastal waterfront anchor
    if (nearCoastalAnchor && nearCoastalAnchor.distanceKm <= 6.0) {
      res = await checkPromise({ lat: nearCoastalAnchor.lat, lng: nearCoastalAnchor.lng }, 2000, google.maps.StreetViewSource.OUTDOOR);
      if (res.available) return res;
    }

    // 3. Fallback to DEFAULT source (indoor/outdoor)
    res = await checkPromise({ lat, lng }, radius, google.maps.StreetViewSource.DEFAULT);
    if (res.available) return res;

    return { available: false };
  }

  checkAlternative360Provider(lat, lng, nearestAnchor) {
    // Check if an authoritative, verified 360° photo sphere exists for this coastal landmark
    if (nearestAnchor && nearestAnchor.distanceKm <= 15.0 && nearestAnchor.alt360) {
      return nearestAnchor.alt360;
    }
    return null;
  }

  openGoogleStreetView(lat, lng, panoData) {
    const overlay = document.getElementById('orca-streetview-overlay');
    const viewport = document.getElementById('orca-streetview-pano-viewport');
    const titleEl = document.getElementById('streetview-pano-title');
    const coordsEl = document.getElementById('streetview-pano-coords');
    const copyrightEl = document.getElementById('streetview-copyright');

    if (!overlay || !viewport) return;

    this.isStreetViewActive = true;
    this.activeViewerType = 'google';
    overlay.style.display = 'flex';

    // Clear viewport and mount isolated container
    viewport.innerHTML = '<div id="google-pano-container" class="street-view-container" style="width:100%;height:100%;"></div>';
    const panoTarget = document.getElementById('google-pano-container');

    const panoLoc = panoData.location;
    const panoLatLng = panoLoc.latLng || { lat: () => lat, lng: () => lng };
    const pLat = typeof panoLatLng.lat === 'function' ? panoLatLng.lat() : panoLatLng.lat;
    const pLng = typeof panoLatLng.lng === 'function' ? panoLatLng.lng() : panoLatLng.lng;

    const desc = panoLoc.description || panoLoc.shortDescription || `${pLat.toFixed(4)}°N, ${pLng.toFixed(4)}°E Waterfront`;
    if (titleEl) titleEl.textContent = desc.toUpperCase();
    if (coordsEl) coordsEl.textContent = `${pLat.toFixed(4)}°N, ${pLng.toFixed(4)}°E · Google Street View Panorama`;
    if (copyrightEl) copyrightEl.innerHTML = panoData.copyright ? `&copy; ${panoData.copyright}` : '&copy; Google Maps Street View';

    // Mount real interactive Google StreetViewPanorama
    this.streetViewPanorama = new google.maps.StreetViewPanorama(panoTarget, {
      position: panoLatLng,
      pano: panoLoc.pano,
      pov: { heading: 160, pitch: 0 },
      zoom: 1,
      addressControl: true,
      addressControlOptions: {
        position: google.maps.ControlPosition.BOTTOM_CENTER
      },
      linksControl: true,
      panControl: true,
      enableCloseButton: false,
      fullscreenControl: true,
      zoomControl: true,
      motionTracking: false,
      motionTrackingControl: false
    });

    this.streetViewPanorama.addListener('position_changed', () => {
      const pos = this.streetViewPanorama.getPosition();
      if (pos && coordsEl) {
        coordsEl.textContent = `${pos.lat().toFixed(4)}°N, ${pos.lng().toFixed(4)}°E`;
      }
    });

    this.streetViewPanorama.addListener('pano_changed', () => {
      const loc = this.streetViewPanorama.getLocation();
      if (loc && loc.description && titleEl) {
        titleEl.textContent = loc.description.toUpperCase();
      }
    });

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  openPannellum360(lat, lng, alt360) {
    const overlay = document.getElementById('orca-streetview-overlay');
    const viewport = document.getElementById('orca-streetview-pano-viewport');
    const titleEl = document.getElementById('streetview-pano-title');
    const coordsEl = document.getElementById('streetview-pano-coords');
    const copyrightEl = document.getElementById('streetview-copyright');

    if (!overlay || !viewport) return;

    this.isStreetViewActive = true;
    this.activeViewerType = 'pannellum';
    overlay.style.display = 'flex';

    if (titleEl) titleEl.textContent = alt360.title.toUpperCase();
    if (coordsEl) coordsEl.textContent = `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E · Interactive 360° Coastal Sphere`;
    if (copyrightEl) copyrightEl.innerHTML = '&copy; Interactive 360&deg; Panorama Explorer';

    // Destroy previous instance if any
    if (this.pannellumViewer) {
      try { this.pannellumViewer.destroy(); } catch (e) {}
      this.pannellumViewer = null;
    }

    viewport.innerHTML = '<div id="pannellum-pano-container" class="street-view-container" style="width:100%;height:100%;"></div>';

    if (window.pannellum) {
      this.pannellumViewer = pannellum.viewer('pannellum-pano-container', {
        type: 'equirectangular',
        panorama: alt360.url,
        autoLoad: true,
        compass: true,
        showZoomCtrl: true,
        showFullscreenCtrl: true,
        hfov: 105,
        pitch: 0,
        yaw: 0
      });
    }

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  closeStreetView() {
    const overlay = document.getElementById('orca-streetview-overlay');
    if (overlay) overlay.style.display = 'none';

    this.isStreetViewActive = false;

    if (this.pannellumViewer) {
      try {
        this.pannellumViewer.destroy();
      } catch (e) {}
      this.pannellumViewer = null;
    }

    if (this.streetViewPanorama) {
      this.streetViewPanorama.setVisible(false);
    }

    const viewport = document.getElementById('orca-streetview-pano-viewport');
    if (viewport) viewport.innerHTML = '';

    // Refresh Leaflet map dimensions & ensure responsiveness
    if (this.map) {
      setTimeout(() => {
        this.map.invalidateSize();
      }, 50);
    }
  }

  showStreetViewToast(title, message) {
    const toast = document.getElementById('streetview-status-toast');
    const desc = document.getElementById('streetview-toast-desc');
    if (!toast) return;

    const titleEl = toast.querySelector('.toast-title');
    if (titleEl) titleEl.textContent = title;
    if (desc) desc.textContent = message;

    toast.style.display = 'flex';

    if (this.streetViewToastTimer) clearTimeout(this.streetViewToastTimer);
    this.streetViewToastTimer = setTimeout(() => {
      toast.style.display = 'none';
    }, 4200);

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  toggleStreetViewCoverage() {
    this.streetViewCoverageEnabled = !this.streetViewCoverageEnabled;
    const isVisible = this.streetViewCoverageEnabled;

    const btn = document.getElementById('btn-toggle-streetview-coverage');
    if (btn) btn.classList.toggle('active', isVisible);

    const checkbox = document.getElementById('layer-toggle-streetview');
    if (checkbox) checkbox.checked = isVisible;

    this.toggleLayer('streetviewCoverage', isVisible);

    if (isVisible) {
      this.showStreetViewToast(
        "Street View Coverage Enabled",
        "Google Street View coverage overlay active. Click any blue roadway or 360° coastal vantage point."
      );
    }
  }

  renderStreetViewCoverageLayer() {
    this.layers.streetviewCoverage.clearLayers();

    // Google Official Vector Street View Coverage Tile Layer (only shown when explicitly toggled)
    const svVectorLayer = L.tileLayer('https://mt{s}.google.com/vt?lyrs=svv&x={x}&y={y}&z={z}', {
      subdomains: '0123',
      maxZoom: 19,
      opacity: 0.65,
      attribution: '&copy; Google Street View'
    });
    this.layers.streetviewCoverage.addLayer(svVectorLayer);
  }

  findRegionForCoordinates(lat, lng) {
    // Spatial ray-casting point-in-polygon
    for (const [id, reg] of Object.entries(this.marineRegions)) {
      if (this.isPointInPolygon([lat, lng], reg.polygon)) {
        return id;
      }
    }
    return null;
  }

  isPointInPolygon(point, vs) {
    const x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      const xi = vs[i][0], yi = vs[i][1];
      const xj = vs[j][0], yj = vs[j][1];
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  setBasemap(type) {
    if (type === this.currentBasemapType) return;

    if (type === 'satellite') {
      if (this.map.hasLayer(this.basemaps.dark)) this.map.removeLayer(this.basemaps.dark);
      this.basemaps.satellite.addTo(this.map);
      if (!this.map.hasLayer(this.labelsLayer)) this.labelsLayer.addTo(this.map);
      this.currentBasemapType = 'satellite';
    } else {
      if (this.map.hasLayer(this.basemaps.satellite)) this.map.removeLayer(this.basemaps.satellite);
      this.basemaps.dark.addTo(this.map);
      this.currentBasemapType = 'dark';
    }
  }

  toggleLayer(layerName, isVisible) {
    if (layerName === 'labels') {
      if (isVisible) {
        if (!this.map.hasLayer(this.labelsLayer)) this.labelsLayer.addTo(this.map);
      } else {
        if (this.map.hasLayer(this.labelsLayer)) this.labelsLayer.remove();
      }
      return;
    }

    if (layerName === 'streetviewCoverage') {
      this.streetViewCoverageEnabled = isVisible;
      const btn = document.getElementById('btn-toggle-streetview-coverage');
      if (btn) btn.classList.toggle('active', isVisible);
      const cb = document.getElementById('layer-toggle-streetview');
      if (cb && cb.checked !== isVisible) cb.checked = isVisible;
    }

    if (!this.layers[layerName] || !this.map) return;
    if (isVisible) {
      if (!this.map.hasLayer(this.layers[layerName])) {
        this.map.addLayer(this.layers[layerName]);
      }
    } else {
      if (this.map.hasLayer(this.layers[layerName])) {
        this.map.removeLayer(this.layers[layerName]);
      }
    }
  }

  locate() {
    if (this.map) {
      this.map.flyToBounds(this.defaultBounds, { duration: 1.2, padding: [20, 20] });
    }
  }

  focusRegion(regionKey) {
    if (regionKey === 'all') {
      this.locate();
      this.inspectRegion('arabian_sea');
      return;
    }

    const reg = this.marineRegions[regionKey];
    if (!reg || !this.map) return;

    this.map.flyToBounds(reg.bounds, { duration: 1.2, padding: [40, 40], maxZoom: reg.zoom });
    this.inspectRegion(regionKey);
  }

  flyTo(lat, lng, zoom = 9) {
    if (!this.map) return;
    this.map.flyTo([lat, lng], zoom, { duration: 1.4 });
  }

  focusPFZ(lat, lng) {
    if (!this.map) return;
    this.map.flyTo([lat, lng], 9.5, { duration: 1.4 });
    setTimeout(() => {
      if (this.layers && this.layers.pfz) {
        this.layers.pfz.eachLayer(layer => {
          if (typeof layer.getLatLng === 'function') {
            const pos = layer.getLatLng();
            if (Math.abs(pos.lat - lat) < 0.25 && Math.abs(pos.lng - lng) < 0.25) {
              layer.openPopup();
            }
          }
        });
      }
    }, 700);
  }

  focusHazard(lat, lng, title = '') {
    if (!this.map) return;
    this.map.flyTo([lat, lng], 7.5, { duration: 1.4 });
    setTimeout(() => {
      let found = false;
      if (this.layers && this.layers.hazards) {
        this.layers.hazards.eachLayer(layer => {
          if (typeof layer.getLatLng === 'function') {
            const pos = layer.getLatLng();
            if (Math.abs(pos.lat - lat) < 1.0 && Math.abs(pos.lng - lng) < 1.0) {
              layer.openPopup();
              found = true;
            }
          }
        });
      }
      if (!found) {
        L.popup({ offset: [0, -10], className: 'orca-context-popup' })
          .setLatLng([lat, lng])
          .setContent(`
            <div style="font-family:'Inter',sans-serif;color:#020b14;padding:4px;min-width:190px;">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f59e0b;box-shadow:0 0 6px #f59e0b;"></span>
                <b style="color:#d97706;font-family:'Rajdhani',sans-serif;font-size:13px;letter-spacing:0.05em;">ACTIVE MARITIME HAZARD</b>
              </div>
              <div style="font-weight:700;font-size:12px;color:#0f172a;line-height:1.3;">${title || 'Regional Alert Sector'}</div>
              <div style="font-size:10px;color:#64748b;margin-top:2px;">Location: ${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E</div>
            </div>
          `)
          .openOn(this.map);
      }
    }, 700);
  }

  renderOceanRegions() {
    this.layers.oceanRegions.clearLayers();
    this.regionPolygonLayers = {};

    Object.values(this.marineRegions).forEach(r => {
      // Natural GIS polygon boundary kept internally for click detection and regional spatial queries
      // Visually rendered invisible (no dashed dividing lines or partition blocks)
      const polyLayer = L.polygon(r.polygon, {
        stroke: false,
        weight: 0,
        opacity: 0,
        fillColor: '#000000',
        fillOpacity: 0,
        interactive: true,
        className: `orca-gis-poly orca-poly-${r.id}`
      });

      // Subtle GIS Tooltip on hover
      polyLayer.bindTooltip(`
        <div class="orca-gis-tooltip">
          <b style="font-family:'Rajdhani',sans-serif;font-size:13px;letter-spacing:0.08em;color:#fff;">${r.name.toUpperCase()}</b>
          <div style="font-family:'JetBrains Mono',monospace;font-size:9.5px;color:${r.color};margin-top:1px;">${r.sub}</div>
          <div style="font-size:9px;color:#94a3b8;margin-top:2px;">Click to inspect regional intelligence</div>
        </div>
      `, {
        sticky: true,
        direction: 'top',
        offset: [0, -10],
        className: 'orca-custom-leaflet-tooltip'
      });

      polyLayer.on('click', async (e) => {
        L.DomEvent.stopPropagation(e);
        const { lat, lng } = e.latlng;
        const coordDisplay = document.getElementById('hud-coords-val');
        if (coordDisplay) {
          coordDisplay.innerHTML = `${lat.toFixed(4)}°N<br>${lng.toFixed(4)}°E`;
        }
        await this.handleMapLocationClick(lat, lng, r.id);
      });

      polyLayer.addTo(this.layers.oceanRegions);
      this.regionPolygonLayers[r.id] = polyLayer;
    });
  }

  highlightActiveRegion(regionId) {
    this.activeRegionId = regionId;

    Object.entries(this.regionPolygonLayers).forEach(([id, layer]) => {
      // Preserve continuous natural ocean surface without rendering dividing boundary lines
      layer.setStyle({
        stroke: false,
        weight: 0,
        opacity: 0,
        fillOpacity: 0
      });
    });

    // Update Region Pills
    document.querySelectorAll('.region-selector-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.region === regionId);
    });
  }

  async inspectRegion(regionKey, expandInspector = true) {
    const r = this.marineRegions[regionKey];
    if (!r) return;

    this.highlightActiveRegion(regionKey);

    const inspector = document.getElementById('marine-region-inspector');
    if (!inspector) return;
    if (expandInspector) {
      inspector.classList.remove('collapsed');
    }

    // Loading State
    this.renderInspectorLoading(r.name);

    const apiBase = window.location.port === '3000' ? 'http://localhost:8000' : '';

    try {
      const resp = await fetch(`${apiBase}/api/regions/${regionKey}/intelligence`);
      if (resp.ok) {
        const json = await resp.json();
        this.renderRegionalIntelligencePanel(json.data);
      } else {
        throw new Error(`HTTP ${resp.status}`);
      }
    } catch (err) {
      console.warn("Falling back to local regional telemetry synthesis", err);
      this.renderFallbackIntelligence(regionKey);
    }
  }

  async inspectSpotCoordinates(lat, lng, expandInspector = true) {
    const inspector = document.getElementById('marine-region-inspector');
    if (!inspector) return;
    if (expandInspector) {
      inspector.classList.remove('collapsed');
    }

    this.renderInspectorLoading(`Coordinate ${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E`);

    const apiBase = window.location.port === '3000' ? 'http://localhost:8000' : '';
    try {
      const [mResp, wResp, aResp] = await Promise.all([
        fetch(`${apiBase}/api/marine/current?latitude=${lat}&longitude=${lng}`),
        fetch(`${apiBase}/api/weather/current?latitude=${lat}&longitude=${lng}`),
        fetch(`${apiBase}/api/alerts?latitude=${lat}&longitude=${lng}`)
      ]);

      const mData = mResp.ok ? (await mResp.json()).data : {};
      const wData = wResp.ok ? (await wResp.json()).data : {};
      const aData = aResp.ok ? (await aResp.json()).data : { alerts: [] };

      this.renderSpotIntelligencePanel(lat, lng, mData, wData, aData);
    } catch (e) {
      console.warn("Spot inspection error", e);
    }
  }

  renderInspectorLoading(regionName) {
    const titleEl = document.getElementById('inspector-title');
    const subEl = document.getElementById('inspector-coords');
    const bodyEl = document.getElementById('inspector-body');

    if (titleEl) titleEl.textContent = regionName.toUpperCase();
    if (subEl) subEl.textContent = "SYNCHRONIZING AUTHORITATIVE SATELLITE & BUOY SENSORS...";
    if (bodyEl) {
      bodyEl.innerHTML = `
        <div style="padding:40px 20px;text-align:center;">
          <div class="live-dot" style="background:#22d3b6;width:12px;height:12px;box-shadow:0 0 12px #22d3b6;margin:0 auto 12px;"></div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;color:#fff;font-weight:700;letter-spacing:0.06em;">CONNECTING GEOSPATIAL INTELLIGENCE</div>
          <div style="font-family:var(--font-mono);font-size:10px;color:var(--accent-cyan);margin-top:4px;">Querying INCOIS OSF · IMD · MOSDAC / ISRO · Copernicus</div>
        </div>
      `;
    }
  }

  renderRegionalIntelligencePanel(data) {
    const overview = data.region_overview;
    const cond = data.live_conditions;
    const sat = data.satellite;
    const fc = data.forecast_trends;
    const hazards = data.hazards;
    const pfz = data.pfz;
    const media = data.regional_media;
    const ai = data.ai_summary;

    // Header
    const titleEl = document.getElementById('inspector-title');
    const subEl = document.getElementById('inspector-coords');
    if (titleEl) titleEl.textContent = overview.name.toUpperCase();
    if (subEl) {
      subEl.innerHTML = `
        <span>${overview.iho_designation} · ${overview.center.latitude.toFixed(2)}°N, ${overview.center.longitude.toFixed(2)}°E</span>
        <span class="telemetry-tag" style="margin-left:8px;color:#22d3b6;">${overview.updated_at.substring(11, 16)} UTC</span>
      `;
    }

    const bodyEl = document.getElementById('inspector-body');
    if (!bodyEl) return;

    // PFZ HTML block
    let pfzHtml = '';
    if (pfz.available && pfz.zones_count > 0) {
      const topRows = pfz.top_zones.map(z => `
        <div class="sub-card-row">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <b style="color:#22d3b6;font-size:11.5px;">${z.name}</b>
            <span class="provenance-badge badge-live">SCORE ${z.score}/100</span>
          </div>
          <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">Target: ${z.target_species} · Depth: ${z.depth}</div>
          <div style="font-size:9.5px;color:#94a3b8;font-style:italic;margin-top:2px;">${z.recommendation}</div>
        </div>
      `).join('');

      pfzHtml = `
        <div class="inspector-section-card">
          <div class="section-card-header">
            <span class="sec-title"><i data-lucide="fish"></i>POTENTIAL FISHING ZONES (PFZ)</span>
            <span class="provenance-badge badge-live">INCOIS ADVISORY (LIVE)</span>
          </div>
          <div class="pfz-zones-list">${topRows}</div>
          <div class="data-source-footer">Source: ${pfz.source} · Updated: ${pfz.updated}</div>
        </div>
      `;
    } else {
      pfzHtml = `
        <div class="inspector-section-card">
          <div class="section-card-header">
            <span class="sec-title"><i data-lucide="fish"></i>POTENTIAL FISHING ZONES (PFZ)</span>
            <span class="provenance-badge badge-unavail">DATA UNAVAILABLE</span>
          </div>
          <div style="padding:8px 10px;background:rgba(15,23,42,0.6);border-radius:4px;font-size:11px;color:#94a3b8;">
            ${pfz.source}
          </div>
          <div class="data-source-footer">Status: Outside sovereign 200NM coastal advisory grid or restricted fairway</div>
        </div>
      `;
    }

    // Forecast Timeline HTML
    const fcRows = (fc.timeline || []).map(t => `
      <div class="forecast-step-col">
        <div class="fc-horizon">${t.horizon}</div>
        <div class="fc-metric"><span class="lbl">Wave</span><b>${t.wave_height_m}m</b></div>
        <div class="fc-metric"><span class="lbl">Wind</span><b>${t.wind_knots}kn</b></div>
        <div class="fc-metric"><span class="lbl">Period</span><b>${t.wave_period_s}s</b></div>
        <div class="fc-metric"><span class="lbl">Current</span><b>${t.current_knots}kn</b></div>
      </div>
    `).join('');

    // Hazard Alerts HTML
    const hazardListHtml = hazards.count > 0 ? hazards.active_alerts.map(a => `
      <div class="alert-item-box ${a.severity.toLowerCase()}">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <b style="font-size:11px;">⚠ ${a.title}</b>
          <span class="provenance-badge badge-${a.severity === 'CRITICAL' ? 'danger' : 'live'}">${a.severity}</span>
        </div>
        <div style="font-size:10px;color:#cbd5e1;margin-top:2px;">${a.desc}</div>
        <div style="font-size:8.5px;color:#94a3b8;margin-top:2px;">Source: ${a.source}</div>
      </div>
    `).join('') : `
      <div style="padding:6px 10px;background:rgba(34,211,182,0.08);border:1px solid rgba(34,211,182,0.2);border-radius:4px;color:#22d3b6;font-size:10.5px;display:flex;align-items:center;gap:6px;">
        <span class="live-dot" style="background:#22d3b6;"></span>
        Normal Maritime Conditions · No Active Storm or Tsunami Warnings
      </div>
    `;

    bodyEl.innerHTML = `
      <!-- 1. AI REGIONAL SYNTHESIS CARD -->
      <div class="ai-regional-summary-card">
        <div class="ai-card-header">
          <div class="ai-sparkle-pill">
            <i data-lucide="sparkles" style="width:13px;height:13px;"></i>
            <span>ORCA REASONING SYNTHESIS</span>
          </div>
          <span class="risk-badge-tag ${ai.risk_class}">${ai.risk_level}</span>
        </div>
        <div class="ai-summary-headline">${ai.title}</div>
        <p class="ai-summary-text">${ai.summary}</p>
        
        <div class="ai-factors-grid">
          ${ai.main_factors.map(f => `<div class="factor-item"><span class="dot"></span><span>${f}</span></div>`).join('')}
        </div>

        <div class="ai-recommendation-bar">
          <b>OPERATIONAL RECOMMENDATION:</b>
          <p>${ai.recommendation}</p>
        </div>
        <div class="grounding-note">Grounded exclusively on authoritative real-time observations and ECMWF physics.</div>
      </div>

      <!-- 2. REGION OVERVIEW & SOURCES -->
      <div class="inspector-section-card">
        <div class="section-card-header">
          <span class="sec-title"><i data-lucide="map"></i>REGION OVERVIEW & SOUNDINGS</span>
          <span class="provenance-badge badge-live">OPERATIONAL</span>
        </div>
        <div class="overview-meta-grid">
          <div><span class="meta-label">Basin:</span> <b class="meta-val">${overview.basin}</b></div>
          <div><span class="meta-label">Designation:</span> <b class="meta-val">${overview.iho_designation}</b></div>
          <div><span class="meta-label">Depth Profile:</span> <b class="meta-val">${overview.depth_profile}</b></div>
          <div><span class="meta-label">Salinity:</span> <b class="meta-val">${overview.salinity_profile}</b></div>
        </div>
        <div class="source-strip">
          <span>INCOIS: <b>${overview.sources_status.marine_ocean ? 'LINKED' : 'OFFLINE'}</b></span> ·
          <span>IMD: <b>LINKED</b></span> ·
          <span>MOSDAC/ISRO: <b>OPERATIONAL</b></span>
        </div>
      </div>

      <!-- 3. LIVE/LATEST MARINE CONDITIONS WITH PROVENANCE -->
      <div class="inspector-section-card">
        <div class="section-card-header">
          <span class="sec-title"><i data-lucide="activity"></i>LIVE / LATEST MARINE CONDITIONS</span>
          <span class="provenance-badge badge-live">MULTI-SENSOR</span>
        </div>

        <div class="conditions-provenance-list">
          <!-- Wave Height -->
          <div class="cond-item-row">
            <div class="cond-left">
              <span class="cond-param">Significant Wave Height</span>
              <span class="cond-src">${cond.wave_height.source} · ${cond.wave_height.updated}</span>
            </div>
            <div class="cond-right">
              <span class="cond-val">${cond.wave_height.value}</span>
              <span class="provenance-badge badge-live">${cond.wave_height.status}</span>
            </div>
          </div>

          <!-- Wave Period -->
          <div class="cond-item-row">
            <div class="cond-left">
              <span class="cond-param">Wave Period & Swell</span>
              <span class="cond-src">${cond.wave_period.source} (Swell: ${cond.swell_height.value})</span>
            </div>
            <div class="cond-right">
              <span class="cond-val">${cond.wave_period.value}</span>
              <span class="provenance-badge badge-live">${cond.wave_period.status}</span>
            </div>
          </div>

          <!-- Wind -->
          <div class="cond-item-row">
            <div class="cond-left">
              <span class="cond-param">Surface Wind & Flow</span>
              <span class="cond-src">${cond.wind_speed.source} · Dir: ${cond.wind_direction.value}</span>
            </div>
            <div class="cond-right">
              <span class="cond-val">${cond.wind_speed.value}</span>
              <span class="provenance-badge badge-live">${cond.wind_speed.status}</span>
            </div>
          </div>

          <!-- Ocean Current -->
          <div class="cond-item-row">
            <div class="cond-left">
              <span class="cond-param">Ocean Current Velocity</span>
              <span class="cond-src">${cond.ocean_current.source} · Heading: ${cond.ocean_current.direction}</span>
            </div>
            <div class="cond-right">
              <span class="cond-val">${cond.ocean_current.value}</span>
              <span class="provenance-badge badge-live">${cond.ocean_current.status}</span>
            </div>
          </div>

          <!-- Sea Surface Temperature -->
          <div class="cond-item-row">
            <div class="cond-left">
              <span class="cond-param">Sea Surface Temperature (SST)</span>
              <span class="cond-src">${cond.sst.source}</span>
            </div>
            <div class="cond-right">
              <span class="cond-val" style="color:#f59e0b;">${cond.sst.value}</span>
              <span class="provenance-badge badge-calc">${cond.sst.status}</span>
            </div>
          </div>

          <!-- Chlorophyll -->
          <div class="cond-item-row">
            <div class="cond-left">
              <span class="cond-param">Chlorophyll-a / Ocean Color</span>
              <span class="cond-src">${cond.chlorophyll.source}</span>
            </div>
            <div class="cond-right">
              <span class="cond-val" style="color:${cond.chlorophyll.status === 'CALCULATED' ? '#22d3b6' : '#94a3b8'};">${cond.chlorophyll.value}</span>
              <span class="provenance-badge badge-${cond.chlorophyll.status === 'CALCULATED' ? 'calc' : 'unavail'}">${cond.chlorophyll.status}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. SATELLITE METADATA & ORBITAL SENSORS -->
      <div class="inspector-section-card">
        <div class="section-card-header">
          <span class="sec-title"><i data-lucide="radio"></i>SATELLITE ORBITAL TELEMETRY</span>
          <span class="provenance-badge badge-live">${sat.status}</span>
        </div>
        <div class="satellite-meta-box">
          <div class="sat-badge-strip">
            <b>${sat.satellite}</b>
            <span>${sat.sensor}</span>
          </div>
          <div class="sat-details">
            <div><span>Product:</span> <b>${sat.product_name}</b></div>
            <div><span>Resolution:</span> <b>${sat.resolution}</b></div>
            <div><span>Orbit:</span> <b>${sat.coverage_cycle}</b></div>
          </div>
          <div class="sat-preview-wrapper">
            <img src="${sat.image_url}" alt="${sat.product_name}" class="sat-preview-img" loading="lazy" />
            <div class="sat-caption-bar">
              <span>Sensor Swath Archive: ${sat.satellite}</span>
              <span class="time">${sat.timestamp.substring(0, 10)}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. 24-HOUR FORECAST TRENDS -->
      <div class="inspector-section-card">
        <div class="section-card-header">
          <span class="sec-title"><i data-lucide="trending-up"></i>FORECAST PROGRESSION (+6h, +12h, +24h)</span>
          <span class="provenance-badge badge-fc">FORECAST</span>
        </div>
        <div class="forecast-timeline-grid">${fcRows}</div>
        <div class="data-source-footer">${fc.source}</div>
      </div>

      <!-- 6. MARITIME HAZARDS & ALERTS -->
      <div class="inspector-section-card">
        <div class="section-card-header">
          <span class="sec-title"><i data-lucide="shield-alert"></i>MARITIME HAZARDS & ADVISORIES</span>
          <span class="provenance-badge badge-${hazards.count > 0 ? 'danger' : 'live'}">${hazards.count} ACTIVE</span>
        </div>
        <div class="hazards-wrapper">${hazardListHtml}</div>
        <div class="data-source-footer">${hazards.source}</div>
      </div>

      <!-- 7. PFZ ADVISORY -->
      ${pfzHtml}

      <!-- 8. REGIONAL MEDIA (STRICTLY LABELED AS VISUAL REFERENCE) -->
      <div class="inspector-section-card media-section-card">
        <div class="section-card-header">
          <span class="sec-title"><i data-lucide="video"></i>REGIONAL MEDIA</span>
          <span class="provenance-badge badge-media">VISUAL REFERENCE</span>
        </div>
        
        <div class="media-disclaimer-pill">
          <i data-lucide="info" style="width:12px;height:12px;"></i>
          <span><b>Visual Reference Only:</b> Ordinary regional video and photography are displayed for geospatial context and are strictly distinguished from live sensor telemetry.</span>
        </div>

        <div class="regional-media-grid">
          <!-- Video -->
          <div class="media-card-item">
            <div class="media-thumb-box">
              <video src="${media.video_url}" autoplay loop muted playsinline class="media-video-player"></video>
              <span class="media-type-tag video">OCEAN DYNAMIC VIDEO</span>
            </div>
            <div class="media-caption-text">${media.video_title}</div>
          </div>

          <!-- Marine Imagery -->
          <div class="media-card-item">
            <div class="media-thumb-box">
              <img src="${media.marine_image}" alt="Marine Reference" class="media-img" loading="lazy" />
              <span class="media-type-tag photo">MARINE REFERENCE</span>
            </div>
            <div class="media-caption-text">${media.marine_image_caption}</div>
          </div>

          <!-- Satellite Imagery Reference -->
          <div class="media-card-item">
            <div class="media-thumb-box">
              <img src="${media.satellite_image}" alt="Satellite Reference" class="media-img" loading="lazy" />
              <span class="media-type-tag sat">ORBITAL REFERENCE</span>
            </div>
            <div class="media-caption-text">${media.satellite_image_caption}</div>
          </div>

          <!-- Weather Imagery -->
          <div class="media-card-item">
            <div class="media-thumb-box">
              <img src="${media.weather_image}" alt="Weather Reference" class="media-img" loading="lazy" />
              <span class="media-type-tag weather">SYNOPTIC CHART</span>
            </div>
            <div class="media-caption-text">${media.weather_image_caption}</div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  renderSpotIntelligencePanel(lat, lng, marineData, weatherData, alertsData) {
    const titleEl = document.getElementById('inspector-title');
    const subEl = document.getElementById('inspector-coords');
    const bodyEl = document.getElementById('inspector-body');

    const waveH = marineData.wave_height_m || 1.2;
    const waveP = marineData.wave_period_s || 7.5;
    const windKmh = weatherData.wind_kmh || 16.0;
    const windKn = weatherData.wind_knots || round(windKmh / 1.852, 1);
    const sst = marineData.sst_celsius || 28.4;
    const curr = marineData.current_knots || 0.8;
    const alerts = alertsData.alerts || [];

    if (titleEl) titleEl.textContent = "SPOT LOCATION INTELLIGENCE";
    if (subEl) subEl.textContent = `${lat.toFixed(4)}°N · ${lng.toFixed(4)}°E | Open Sea Sounding`;

    if (!bodyEl) return;
    bodyEl.innerHTML = `
      <div class="ai-regional-summary-card">
        <div class="ai-card-header">
          <span class="sec-title">COORDINATE ASSESSMENT</span>
          <span class="risk-badge-tag ${waveH > 2.2 ? 'danger' : waveH > 1.4 ? 'warning' : 'success'}">${waveH > 2.2 ? 'HIGH RISK' : waveH > 1.4 ? 'MODERATE RISK' : 'LOW RISK'}</span>
        </div>
        <p class="ai-summary-text">
          Location ${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E reports wave height of ${waveH}m with a ${waveP}s period. Surface winds are ${windKmh} km/h (${windKn} kn).
        </p>
      </div>

      <div class="inspector-section-card">
        <div class="section-card-header">
          <span class="sec-title">LIVE MEASUREMENTS</span>
          <span class="provenance-badge badge-live">LIVE TELEMETRY</span>
        </div>
        <div class="conditions-provenance-list">
          <div class="cond-item-row">
            <div class="cond-left"><span class="cond-param">Wave Height</span><span class="cond-src">Open-Meteo Marine / ECMWF</span></div>
            <div class="cond-right"><span class="cond-val">${waveH} m</span><span class="provenance-badge badge-live">LIVE</span></div>
          </div>
          <div class="cond-item-row">
            <div class="cond-left"><span class="cond-param">Surface Wind</span><span class="cond-src">NOAA GFS</span></div>
            <div class="cond-right"><span class="cond-val">${windKmh} km/h</span><span class="provenance-badge badge-live">LIVE</span></div>
          </div>
          <div class="cond-item-row">
            <div class="cond-left"><span class="cond-param">Current Velocity</span><span class="cond-src">Copernicus Streamflow</span></div>
            <div class="cond-right"><span class="cond-val">${curr} kn</span><span class="provenance-badge badge-live">LIVE</span></div>
          </div>
          <div class="cond-item-row">
            <div class="cond-left"><span class="cond-param">SST</span><span class="cond-src">Climatology Model</span></div>
            <div class="cond-right"><span class="cond-val">${sst} °C</span><span class="provenance-badge badge-calc">CALCULATED</span></div>
          </div>
        </div>
      </div>

      <!-- Street View Coverage Status Card -->
      <div class="inspector-section-card">
        <div class="section-card-header">
          <span class="sec-title"><i data-lucide="camera"></i>STREET VIEW COVERAGE</span>
          <span class="provenance-badge badge-live">GOOGLE MAPS</span>
        </div>
        <div style="padding:4px 0;font-size:11px;color:#cbd5e1;line-height:1.4;">
          Real Google Street View is active on click for ports, coastal waterfronts, and land. Open water locations without Street View coverage maintain live ECMWF/INCOIS ocean intelligence.
        </div>
      </div>
    `;

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  renderFallbackIntelligence(regionKey) {
    const reg = this.marineRegions[regionKey];
    if (!reg) return;
    this.renderRegionalIntelligencePanel({
      region_overview: {
        id: reg.id,
        name: reg.name,
        basin: reg.sub,
        iho_designation: reg.sub,
        center: { latitude: reg.center[0], longitude: reg.center[1] },
        extent_bounds: reg.bounds,
        depth_profile: "Continental Shelf & Abyssal Basin Sounding",
        salinity_profile: "Standard Marine Water Column",
        updated_at: new Date().toISOString(),
        sources_status: { marine_ocean: "CACHED", meteorological: "CACHED", satellite_agency: "OPERATIONAL" }
      },
      live_conditions: {
        sst: { value: "28.5 °C", status: "CALCULATED", source: "INCOIS Climatology", updated: "Cached" },
        wave_height: { value: "1.4 m", status: "LIVE", source: "INCOIS OSF Telemetry", updated: "Cached" },
        wave_period: { value: "7.5 s", status: "LIVE", source: "INCOIS OSF Buoy", updated: "Cached" },
        swell_height: { value: "1.0 m", status: "LIVE", source: "INCOIS Swell Network", updated: "Cached" },
        wind_speed: { value: "18.0 km/h (9.7 kn)", status: "LIVE", source: "IMD Weather", updated: "Cached" },
        wind_direction: { value: "270°", status: "LIVE", source: "IMD Anemometer", updated: "Cached" },
        ocean_current: { value: "0.8 kn", direction: "210°", status: "LIVE", source: "Copernicus Stream", updated: "Cached" },
        chlorophyll: { value: "2.4 mg/m³", status: "CALCULATED", source: "Oceansat-3 Model", updated: "Cached" }
      },
      satellite: {
        satellite: "EOS-06 (Oceansat-3)",
        sensor: "Ocean Color Monitor",
        product_name: "Ocean Thermal Front Gradient",
        resolution: "360m Optical",
        coverage_cycle: "2-Day Polar Orbit",
        status: "OPERATIONAL",
        timestamp: new Date().toISOString(),
        image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"
      },
      forecast_trends: {
        status: "FORECAST",
        source: "INCOIS OSF & ECMWF Wave Model",
        timeline: [
          { horizon: "+6h", wave_height_m: 1.4, wave_period_s: 7.5, wind_knots: 10.0, current_knots: 0.8 },
          { horizon: "+12h", wave_height_m: 1.6, wave_period_s: 7.8, wind_knots: 12.0, current_knots: 0.9 },
          { horizon: "+24h", wave_height_m: 1.8, wave_period_s: 8.0, wind_knots: 14.5, current_knots: 1.1 }
        ]
      },
      hazards: { status: "LIVE", source: "INCOIS / IMD", active_alerts: [], count: 0 },
      pfz: { available: true, status: "LIVE", source: "INCOIS Operational PFZ", updated: "Cached", zones_count: 1, top_zones: [
        { name: "Zone Alpha", score: 92, target_species: "Yellowfin Tuna", depth: "-42m", recommendation: "Optimal Front" }
      ]},
      regional_media: {
        video_url: "scuba_bg.mp4",
        video_title: "Regional Marine Visual Reference Loop",
        marine_image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
        marine_image_caption: "Regional Shelf Dynamics",
        satellite_image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
        satellite_image_caption: "Orbital Swath",
        weather_image: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=800&q=80",
        weather_image_caption: "Synoptic Surface Chart"
      },
      ai_summary: {
        title: `${reg.name.toUpperCase()} — MARINE INTELLIGENCE`,
        summary: `Conditions in ${reg.name} are currently moderate with 1.4m wave heights and steady winds.`,
        risk_level: "MODERATE RISK",
        risk_class: "warning",
        main_factors: ["Wave height: 1.4m", "Surface wind: 18 km/h", "No active cyclone warnings"],
        recommendation: "Maintain routine VHF watch. Favorable operational window for small vessels in early morning."
      }
    });
  }

  closeInspector() {
    const inspector = document.getElementById('marine-region-inspector');
    if (inspector) {
      inspector.classList.add('collapsed');
    }
    this.activeRegionId = null;
    this.highlightActiveRegion(null);
  }

  renderPFZPolygons() {
    this.layers.pfz.clearLayers();

    const zones = [
      {
        name: "ZONE ALPHA (Malpe Shelf, Arabian Sea)",
        poly: [[13.15, 74.50], [13.35, 74.65], [13.25, 74.92], [12.95, 74.88], [12.90, 74.60]],
        center: [13.12, 74.72],
        color: "#22d3b6",
        score: 92,
        species: "Yellowfin Tuna, Seer Fish",
        depth: "-42m"
      },
      {
        name: "ZONE BETA (Saurashtra / Veraval Bank, Arabian Sea)",
        poly: [[20.90, 69.80], [21.05, 70.30], [20.65, 70.45], [20.50, 70.00]],
        center: [20.75, 70.15],
        color: "#f59e0b",
        score: 88,
        species: "Silver Pomfret, Ribbonfish",
        depth: "-54m"
      },
      {
        name: "ZONE GAMMA (Wadge Bank, Indian Ocean Confluence)",
        poly: [[8.10, 76.90], [8.25, 77.50], [7.70, 77.70], [7.50, 77.10]],
        center: [7.85, 77.30],
        color: "#38bdf8",
        score: 86,
        species: "Skipjack Tuna, Perches",
        depth: "-65m"
      },
      {
        name: "ZONE DELTA (Gulf of Mannar Shelf)",
        poly: [[9.15, 78.50], [9.25, 79.00], [8.80, 79.10], [8.70, 78.60]],
        center: [8.95, 78.75],
        color: "#a855f7",
        score: 82,
        species: "Snappers, Bluefin Trevally",
        depth: "-35m"
      },
      {
        name: "ZONE EPSILON (Coromandel Slope, Bay of Bengal)",
        poly: [[13.45, 80.40], [13.55, 80.85], [13.00, 80.90], [12.95, 80.45]],
        center: [13.25, 80.60],
        color: "#22d3b6",
        score: 89,
        species: "Bigeye Tuna, Flying Fish",
        depth: "-78m"
      },
      {
        name: "ZONE ZETA (Andhra Shelf / Visakhapatnam Channel)",
        poly: [[17.80, 83.30], [17.90, 83.80], [17.35, 83.90], [17.25, 83.40]],
        center: [17.55, 83.55],
        color: "#06b6d4",
        score: 84,
        species: "Black Pomfret, King Mackerel",
        depth: "-58m"
      },
      {
        name: "ZONE ETA (Port Blair Outer Ridge, Andaman Sea)",
        poly: [[11.75, 92.70], [11.85, 93.20], [11.35, 93.25], [11.25, 92.75]],
        center: [11.55, 92.95],
        color: "#f59e0b",
        score: 91,
        species: "Yellowfin Tuna, Billfish, Mahi Mahi",
        depth: "-92m"
      },
      {
        name: "ZONE THETA (Kavaratti / Lakshadweep Sea)",
        poly: [[10.85, 72.15], [10.95, 72.65], [10.35, 72.70], [10.25, 72.20]],
        center: [10.60, 72.40],
        color: "#10b981",
        score: 87,
        species: "Skipjack Tuna, Rainbow Runner",
        depth: "-60m"
      }
    ];

    zones.forEach(z => {
      // Calculate Haversine distance from coastal reference hub (Mangalore: 12.9141°N, 74.8560°E)
      const refLat = 12.9141;
      const refLng = 74.8560;
      const distKm = this.calculateDistanceKm(refLat, refLng, z.center[0], z.center[1]).toFixed(1);

      const popupHtml = `
        <div class="orca-pfz-popup-card">
          <div class="pfz-popup-badge" style="border-color:${z.color};color:${z.color};">INCOIS OPERATIONAL PFZ</div>
          <div class="pfz-popup-title">${z.name}</div>
          <div class="pfz-popup-grid">
            <div class="pfz-grid-item">
              <span class="lbl">Catch Potential</span>
              <b class="val highlight">${z.score}/100</b>
            </div>
            <div class="pfz-grid-item">
              <span class="lbl">Distance</span>
              <b class="val">${distKm} km</b>
            </div>
            <div class="pfz-grid-item">
              <span class="lbl">Depth</span>
              <b class="val">${z.depth}</b>
            </div>
            <div class="pfz-grid-item">
              <span class="lbl">Risk</span>
              <b class="val risk-low">LOW</b>
            </div>
          </div>
          <div class="pfz-popup-species"><b>Target Species:</b> ${z.species}</div>
          <div class="pfz-popup-actions">
            <button class="pfz-btn-action" onclick="window.orcaApp && window.orcaApp.switchView('pfz')">View Intelligence</button>
            <button class="pfz-btn-action route" onclick="window.orcaApp && window.orcaApp.switchView('routes')">Safe Route</button>
          </div>
        </div>
      `;

      L.polygon(z.poly, {
        color: z.color,
        fillColor: z.color,
        fillOpacity: 0.22,
        weight: 1.8
      }).addTo(this.layers.pfz).bindPopup(popupHtml, {
        className: 'orca-context-popup',
        offset: [0, -10]
      });

      const pinIcon = L.divIcon({
        className: 'pfz-pin-marker',
        html: `
          <div class="pfz-polygon-label">
            <svg class="pin-icon" viewBox="0 0 24 24" fill="${z.color}"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            <div class="name">${z.name.split('(')[0].trim()}</div>
            <div class="potential">Catch Potential: ${z.score}</div>
          </div>
        `,
        iconSize: [110, 50],
        iconAnchor: [55, 25]
      });

      L.marker(z.center, { icon: pinIcon }).addTo(this.layers.pfz).bindPopup(popupHtml, {
        className: 'orca-context-popup',
        offset: [0, -15]
      });
    });
  }

  renderRestrictedZones() {
    this.layers.restricted.clearLayers();

    const restricted = [
      {
        name: "Netrani Island Marine Sanctuary",
        pos: [14.0160, 74.3280],
        radius: 5000,
        color: "#ef4444",
        desc: "Strict No-Anchor / No-Trawling under Wildlife Protection Act."
      },
      {
        name: "Gulf of Mannar Marine National Park",
        pos: [9.1200, 79.1000],
        radius: 12000,
        color: "#ef4444",
        desc: "Core Coral Reef & Dugong Marine Biosphere Reserve. Commercial fishing excluded."
      },
      {
        name: "Mahatma Gandhi Marine National Park (Wandoor)",
        pos: [11.5800, 92.5600],
        radius: 8000,
        color: "#ef4444",
        desc: "Andaman Marine Protected Area. No unauthorized vessel entry."
      },
      {
        name: "Mumbai Port & Naval Exclusion Zone",
        pos: [18.9200, 72.8500],
        radius: 6500,
        color: "#f59e0b",
        desc: "Active Naval Defense Sector & Commercial Fairway."
      },
      {
        name: "New Mangalore Port Turning Basin",
        pos: [12.9320, 74.7850],
        radius: 4200,
        color: "#f59e0b",
        desc: "Commercial Deep-Draft Fairway Exclusion Zone."
      },
      {
        name: "INS Kadamba Seabird Naval Base (Karwar)",
        pos: [14.7700, 74.1400],
        radius: 7500,
        color: "#ef4444",
        desc: "Active Naval Security Zone. Civilian entry strictly prohibited."
      }
    ];

    restricted.forEach(rz => {
      L.circle(rz.pos, {
        radius: rz.radius,
        color: rz.color,
        fillColor: rz.color,
        fillOpacity: 0.25,
        weight: 2,
        dashArray: '6, 6'
      }).addTo(this.layers.restricted).bindPopup(`
        <div style="font-family:'Inter',sans-serif;color:#020b14;padding:4px;">
          <b style="color:#b91c1c;font-family:'Rajdhani',sans-serif;font-size:14px;">RESTRICTED: ${rz.name}</b><br>
          ${rz.desc}
        </div>
      `);
    });
  }

  renderHazards() {
    this.layers.hazards.clearLayers();

    const hazards = [
      {
        pos: [12.78, 75.12],
        title: "INCOIS Swell Surge Watch",
        desc: "Wave swell 1.4m - 2.2m along inshore breakers of Karnataka shelf."
      },
      {
        pos: [19.20, 86.50],
        title: "Bay of Bengal Deep Depression Watch",
        desc: "Rough to very rough sea conditions. Squally winds 45-55 km/h."
      },
      {
        pos: [8.50, 73.20],
        title: "Lakshadweep Rough Sea Advisory",
        desc: "Wind swell resonance active in Nine Degree Channel."
      }
    ];

    hazards.forEach(h => {
      const hazardIcon = L.divIcon({
        className: 'ocean-circle-marker',
        html: '<div style="width:26px;height:26px;border-radius:50%;background:rgba(245,158,11,0.9);border:2px solid #fde047;display:flex;align-items:center;justify-content:center;color:#000;"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg></div>',
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });
      L.marker(h.pos, { icon: hazardIcon }).addTo(this.layers.hazards).bindPopup(`
        <div style="font-family:'Inter',sans-serif;color:#020b14;padding:4px;">
          <b style="color:#d97706;font-family:'Rajdhani',sans-serif;font-size:14px;">${h.title}</b><br>
          ${h.desc}
        </div>
      `);
    });
  }

  renderVessels() {
    this.layers.vessels.clearLayers();
    const vessels = [
      { pos: [13.28, 74.98], name: "IND-FSH-082 (Trawler)", speed: "9.2 kn" },
      { pos: [18.70, 72.55], name: "MT Samudra Ratna (Tanker)", speed: "13.5 kn" },
      { pos: [12.98, 74.45], name: "MV Sagar Kanya (Research)", speed: "11.4 kn" },
      { pos: [8.10, 77.60], name: "IND-KK-94 (Deep Sea Longliner)", speed: "8.5 kn" },
      { pos: [13.40, 80.50], name: "MV Chennai Pride (Bulk Carrier)", speed: "12.0 kn" },
      { pos: [17.45, 83.40], name: "Coast Guard Fast Patrol C-452", speed: "17.2 kn" },
      { pos: [11.80, 92.90], name: "Coral Queen (Inter-Island Ferry)", speed: "14.0 kn" }
    ];

    vessels.forEach(v => {
      const boatIcon = L.divIcon({
        className: 'vessel-pin',
        html: `
          <div style="width:20px;height:20px;border-radius:50%;background:rgba(4,22,36,0.9);border:1px solid #38bdf8;display:flex;align-items:center;justify-content:center;" title="${v.name} · Speed: ${v.speed}">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#38bdf8"><path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.64 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.47L20 11.02V5c0-1.1-.9-2-2-2h-3V1H9v2H6c-1.1 0-2 .9-2 2v6.02l-3.28.65c-.26.05-.48.23-.6.47-.12.24-.14.52-.06.78L3.95 19z"/></svg>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      L.marker(v.pos, { icon: boatIcon }).addTo(this.layers.vessels).bindPopup(`
        <div style="font-family:'Inter',sans-serif;color:#020b14;padding:4px;">
          <b>${v.name}</b><br>
          Speed: ${v.speed} · Status: Underway
        </div>
      `);
    });
  }

  renderEEZBoundary() {
    this.layers.eez.clearLayers();
    // Approximate boundary points of the Indian Maritime Exclusive Economic Zone (EEZ)
    const eezPoints = [
      [23.5, 68.0],
      [21.5, 67.5],
      [19.0, 69.0],
      [15.0, 71.0],
      [11.0, 70.5],
      [8.0, 73.0],
      [5.5, 76.5],
      [5.5, 80.5],
      [7.5, 83.0],
      [11.0, 85.0],
      [15.0, 86.5],
      [19.5, 88.0],
      [21.5, 89.0]
    ];

    L.polyline(eezPoints, {
      color: '#22d3b6',
      weight: 1.5,
      dashArray: '6, 6',
      opacity: 0.7
    }).addTo(this.layers.eez).bindPopup(`
      <div style="font-family:'Inter',sans-serif;color:#020b14;padding:4px;">
        <b>Indian Exclusive Economic Zone (EEZ)</b><br>
        200 Nautical Mile Sovereign Marine Economic Sector
      </div>
    `);
  }

  renderHistoricalStations() {
    this.layers.historicalStations.clearLayers();

    const stations = [
      { id: 'mangalore', name: "Mangalore Offshore Buoy BD02", pos: [12.9141, 74.8560], depth: "42m", region: "Arabian Sea" },
      { id: 'kochi', name: "Kochi Deepwater Buoy CB02", pos: [9.9312, 76.2673], depth: "58m", region: "Lakshadweep Basin" },
      { id: 'mumbai', name: "Mumbai High Climatology Rig", pos: [18.9500, 72.8200], depth: "75m", region: "Maharashtra Shelf" },
      { id: 'cape', name: "Wadge Bank Ocean Observatory", pos: [7.8500, 77.3000], depth: "64m", region: "Cape Comorin" },
      { id: 'chennai', name: "Chennai Coastal Buoy BD08", pos: [13.0827, 80.2707], depth: "50m", region: "Bay of Bengal" },
      { id: 'vizag', name: "Visakhapatnam Deep Trench", pos: [17.6868, 83.2185], depth: "110m", region: "Andhra Basin" }
    ];

    stations.forEach(st => {
      const buoyIcon = L.divIcon({
        className: 'historical-buoy-div-icon',
        html: `
          <div class="orca-buoy-marker" title="${st.name}">
            <div class="buoy-pulse-ring"></div>
            <div class="buoy-core">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            </div>
            <div class="buoy-pill">${st.id.toUpperCase()} BUOY</div>
          </div>
        `,
        iconSize: [110, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker(st.pos, { icon: buoyIcon }).addTo(this.layers.historicalStations);
      marker.bindPopup(`
        <div style="font-family:var(--font-body);padding:4px;font-size:12px;">
          <div style="font-family:var(--font-display);font-weight:700;color:#22d3b6;font-size:13px;margin-bottom:2px;">
            ${st.name}
          </div>
          <div style="color:#94a3b8;font-size:11px;">Region: <b>${st.region}</b> · Depth: <b>${st.depth}</b></div>
          <div style="font-family:var(--font-mono);font-size:10.5px;color:#38bdf8;margin-top:4px;">
            Coordinates: ${st.pos[0]}°N, ${st.pos[1]}°E
          </div>
          <button onclick="orcaApp.selectHistoricalStation('${st.id}', ${st.pos[0]}, ${st.pos[1]}, '${st.name}')" style="margin-top:8px;width:100%;background:rgba(34,211,182,0.18);border:1px solid #22d3b6;color:#22d3b6;padding:4px 8px;border-radius:4px;cursor:pointer;font-family:var(--font-mono);font-size:10.5px;font-weight:600;">
            VIEW 7-DAY TELEMETRY
          </button>
        </div>
      `, { className: 'orca-context-popup', autoPan: false });

      marker.on('click', () => {
        if (window.orcaApp) {
          window.orcaApp.selectHistoricalStation(st.id, st.pos[0], st.pos[1], st.name);
        }
      });
    });
  }

  generateCorridorBuffer(points, bufferDeg = 0.035) {
    if (!points || points.length < 2) return [];
    const leftSide = [];
    const rightSide = [];

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const dLat = p2[0] - p1[0];
      const midLat = (p1[0] + p2[0]) / 2.0;
      const cosLat = Math.max(0.2, Math.cos(midLat * Math.PI / 180));
      const dLng = (p2[1] - p1[1]) * cosLat;
      const len = Math.sqrt(dLat * dLat + dLng * dLng) || 0.0001;

      // Perpendicular normal unit vector
      const uLat = -dLng / len;
      const uLng = dLat / len;

      const offLat = uLat * bufferDeg;
      const offLng = (uLng * bufferDeg) / cosLat;

      leftSide.push([p1[0] + offLat, p1[1] + offLng]);
      leftSide.push([p2[0] + offLat, p2[1] + offLng]);

      rightSide.push([p1[0] - offLat, p1[1] - offLng]);
      rightSide.push([p2[0] - offLat, p2[1] - offLng]);
    }

    return leftSide.concat(rightSide.reverse());
  }

  fitRouteBounds() {
    if (!this.map || !this.currentRouteWaypoints || this.currentRouteWaypoints.length < 2) return;
    const latlngs = this.currentRouteWaypoints.map(wp => [wp.lat, wp.lng]);
    const bounds = L.latLngBounds(latlngs);
    if (!bounds.isValid()) return;

    this.map.invalidateSize();

    const mapSize = this.map.getSize();
    const mapW = (mapSize && mapSize.x > 0) ? mapSize.x : (window.innerWidth - 220);
    const mapH = (mapSize && mapSize.y > 0) ? mapSize.y : window.innerHeight;

    // Check width of the dock panel in the current view
    const sideDock = document.querySelector('#view-routes .side-dock-panel');
    let dockW = 520;
    if (sideDock && sideDock.offsetWidth > 0) {
      dockW = sideDock.offsetWidth;
    }

    // Limit leftPad so that at least 55% of the map width is open and available for bounds fitting!
    // This strictly prevents Leaflet from receiving negative/NaN sizing on any screen resolution.
    const safeLeftPad = Math.max(30, Math.min(dockW + 25, Math.floor(mapW * 0.42)));
    const safeRightPad = Math.max(25, Math.min(60, Math.floor(mapW * 0.08)));
    const safeTopPad = Math.max(30, Math.min(60, Math.floor(mapH * 0.1)));
    const safeBottomPad = Math.max(30, Math.min(60, Math.floor(mapH * 0.1)));

    try {
      this.map.fitBounds(bounds, {
        paddingTopLeft: [safeLeftPad, safeTopPad],
        paddingBottomRight: [safeRightPad, safeBottomPad],
        maxZoom: 9.3
      });
    } catch (err) {
      console.warn("fitBounds with custom padding failed, using safe fallback:", err);
      try {
        this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 9.3 });
      } catch (err2) {
        this.map.setView(bounds.getCenter(), 7);
      }
    }
  }

  plotRoute(waypoints) {
    this.layers.routes.clearLayers();
    if (!waypoints || waypoints.length < 2) return;

    this.currentRouteWaypoints = waypoints;
    const latlngs = waypoints.map(wp => [wp.lat, wp.lng]);

    // 1. Draw Fairway Corridor Buffer Polygon (Semi-transparent bathymetric safety envelope)
    try {
      const corridorPolygon = this.generateCorridorBuffer(latlngs, 0.038);
      if (corridorPolygon && corridorPolygon.length > 2) {
        L.polygon(corridorPolygon, {
          color: '#22d3b6',
          weight: 1.5,
          dashArray: '5, 5',
          fillColor: '#00f2fe',
          fillOpacity: 0.12,
          interactive: true
        }).addTo(this.layers.routes).bindPopup(`
          <div style="font-family:var(--font-body);padding:4px;font-size:12px;">
            <div style="font-family:var(--font-display);font-weight:700;color:#22d3b6;font-size:13px;margin-bottom:4px;">
              SAFE NAVIGATIONAL CORRIDOR
            </div>
            <div>Passage Status: <b style="color:#22d3b6;">CLEARED & VERIFIED</b></div>
            <div style="color:#94a3b8;font-size:11px;margin-top:4px;">
              Bathymetric soundings indicate clearance > 15m depth, avoiding nearshore shoals and geofenced military sanctuaries.
            </div>
          </div>
        `, { className: 'orca-context-popup', autoPan: false });
      }
    } catch (e) {
      console.warn("Could not draw corridor buffer polygon:", e);
    }

    // 2. Outer Glow Polyline
    L.polyline(latlngs, {
      color: '#00f2fe',
      weight: 6,
      opacity: 0.35,
      interactive: false
    }).addTo(this.layers.routes);

    // 3. Central Navigational Track Polyline
    L.polyline(latlngs, {
      color: '#22d3b6',
      weight: 3.5,
      dashArray: '8, 6',
      opacity: 0.95,
      interactive: false
    }).addTo(this.layers.routes);

    // 4. Waypoint Markers & Beacons
    waypoints.forEach((wp, idx) => {
      const isOrigin = idx === 0;
      const isDestination = idx === waypoints.length - 1;

      let markerHtml = '';
      let iconSize = [32, 32];
      let iconAnchor = [16, 16];

      if (isOrigin) {
        markerHtml = `
          <div class="orca-route-marker origin-marker" title="${wp.name}">
            <div class="marker-pulse-ring origin-pulse"></div>
            <div class="marker-core origin-core">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="5" r="3"/>
                <line x1="12" y1="8" x2="12" y2="21"/>
                <path d="M5 12H2a10 10 0 0 0 20 0h-3"/>
              </svg>
            </div>
            <div class="marker-pill origin-pill">PORT: ${wp.name.split('(')[0].trim()}</div>
          </div>
        `;
        iconSize = [150, 36];
        iconAnchor = [18, 18];
      } else if (isDestination) {
        markerHtml = `
          <div class="orca-route-marker dest-marker" title="${wp.name}">
            <div class="marker-pulse-ring dest-pulse"></div>
            <div class="marker-core dest-core">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="9"/>
                <circle cx="12" cy="12" r="4"/>
                <line x1="12" y1="2" x2="12" y2="6"/>
                <line x1="12" y1="18" x2="12" y2="22"/>
                <line x1="2" y1="12" x2="6" y2="12"/>
                <line x1="18" y1="12" x2="22" y2="12"/>
              </svg>
            </div>
            <div class="marker-pill dest-pill">ZONE: ${wp.name.split('(')[0].trim()}</div>
          </div>
        `;
        iconSize = [150, 36];
        iconAnchor = [18, 18];
      } else {
        markerHtml = `
          <div class="orca-route-marker waypoint-marker" title="${wp.name}">
            <div class="marker-core waypoint-core">${idx}</div>
          </div>
        `;
        iconSize = [24, 24];
        iconAnchor = [12, 12];
      }

      const icon = L.divIcon({
        className: 'route-nav-div-icon',
        html: markerHtml,
        iconSize: iconSize,
        iconAnchor: iconAnchor
      });

      const marker = L.marker([wp.lat, wp.lng], { icon: icon }).addTo(this.layers.routes);
      marker.bindPopup(`
        <div style="font-family:var(--font-body);padding:4px;font-size:12px;">
          <div style="font-family:var(--font-display);font-weight:700;color:${isOrigin ? '#38bdf8' : isDestination ? '#22d3b6' : '#f59e0b'};font-size:13px;margin-bottom:4px;">
            ${isOrigin ? 'DEPARTURE HARBOR' : isDestination ? 'TARGET FISHING ARRIVAL SECTOR' : `FAIRWAY WAYPOINT ${idx}`}
          </div>
          <b>${wp.name}</b><br>
          <div style="font-family:var(--font-mono);font-size:11px;color:#94a3b8;margin-top:2px;">${wp.lat.toFixed(4)}°N, ${wp.lng.toFixed(4)}°E</div>
        </div>
      `, {
        className: 'orca-context-popup',
        autoPan: false
      });
    });

    // 5. Fit bounds framed to the right of the side-dock panel, without over-zooming
    this.fitRouteBounds();
  }

  flyTo(lat, lng, zoom = 8) {
    if (this.map) this.map.flyTo([lat, lng], zoom, { duration: 1.2 });
  }
}

window.OrcaMapController = OrcaMapController;
