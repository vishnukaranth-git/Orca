/**
 * ORCA Satellite Intelligence Lab
 * Advanced Multispectral Earth Observation & Coastal Change Engine
 * Features:
 * - Real Multispectral Bands: SST Thermal Anomaly, Chlorophyll-a Ocean Color, Sentinel-1 SAR Flood, Sentinel-2 Optical
 * - 5 Indian Ocean Sectors: Mangalore Shelf, Veraval Bank, Gulf of Mannar, Sundarbans Delta, Andaman Sea
 * - Photorealistic Procedural Earth Observation Canvas Engine (Bathymetry, Isotherms, Eddies, Radar Speckle)
 * - Live Interactive Pixel Telemetry Sounding HUD
 * - Real-time Split Slider & Direct Map Plot Redirection
 */

class OrcaSatelliteLab {
  constructor() {
    this.currentBand = 'sst';
    this.currentSector = 'mangalore';
    this.sliderPos = 50; // percentage
    this.isDragging = false;

    // 5 Key Indian Ocean Coastal & Pelagic Sectors
    this.sectors = {
      mangalore: {
        id: 'mangalore',
        name: 'Malpe Shelf & Mangalore (Arabian Sea)',
        center: [13.12, 74.72],
        latRange: [12.7, 13.5],
        lonRange: [74.3, 75.0],
        coastSide: 'east', // Land on right
        coastalFeature: 'Netravati Estuary & Malpe Headland',
        depthRange: '-18m to -120m',
        sstBase: 28.2,
        sstAnomalyText: '+0.8°C thermal front shift (Optimal for Tuna)',
        chlPeakText: '2.6 mg/m³ peak density (+34% primary production)',
        floodText: '14.2 sq km coastal inundation post-monsoon surge',
        opticalText: 'Netravati River sediment plume (11km discharge)'
      },
      veraval: {
        id: 'veraval',
        name: 'Saurashtra / Veraval Bank (Gujarat)',
        center: [20.75, 70.15],
        latRange: [20.4, 21.2],
        lonRange: [69.7, 70.5],
        coastSide: 'east',
        coastalFeature: 'Veraval Cape & Saurashtra Shelf',
        depthRange: '-22m to -85m',
        sstBase: 27.6,
        sstAnomalyText: '+1.1°C upwelling thermal shear (Pomfret & Ribbonfish)',
        chlPeakText: '3.1 mg/m³ shelf bloom (+42% biomass index)',
        floodText: '8.4 sq km tidal creek & mudflat overflow',
        opticalText: 'High-turbidity coastal gyre and sandy shoal'
      },
      mannar: {
        id: 'mannar',
        name: 'Gulf of Mannar & Palk Strait',
        center: [8.95, 78.75],
        latRange: [8.6, 9.4],
        lonRange: [78.3, 79.2],
        coastSide: 'strait',
        coastalFeature: 'Rameswaram Coral Shoals & Adam\'s Bridge',
        depthRange: '-8m to -45m',
        sstBase: 29.0,
        sstAnomalyText: '+0.6°C shallow lagoon front (Snapper & Coral Reef)',
        chlPeakText: '2.1 mg/m³ seagrass bed chlorophyll radiance',
        floodText: '6.2 sq km shallow sand spit tidal surge',
        opticalText: 'Adam\'s Bridge turquoise reef barrier & sediment dynamics'
      },
      bengal: {
        id: 'bengal',
        name: 'Sundarbans Estuary & Delta (Bay of Bengal)',
        center: [21.65, 88.60],
        latRange: [21.2, 22.1],
        lonRange: [88.1, 89.2],
        coastSide: 'north', // Land on top
        coastalFeature: 'Ganges-Brahmaputra Mangrove Distributaries',
        depthRange: '-5m to -65m',
        sstBase: 28.7,
        sstAnomalyText: '+0.9°C estuarine outflow plume (Hilsa Migration)',
        chlPeakText: '3.8 mg/m³ hyper-eutrophic mangrove export',
        floodText: '26.8 sq km cyclonic storm surge inundation',
        opticalText: 'Massive suspended sediment discharge extending 35km'
      },
      andaman: {
        id: 'andaman',
        name: 'Port Blair & Barren Island (Andaman Sea)',
        center: [11.65, 92.85],
        latRange: [11.2, 12.1],
        lonRange: [92.4, 93.3],
        coastSide: 'island', // Island chain
        coastalFeature: 'Andaman Trench Ridge & Coral Atolls',
        depthRange: '-30m to -850m',
        sstBase: 29.3,
        sstAnomalyText: '+0.7°C deep trench vortex (Yellowfin Tuna & Billfish)',
        chlPeakText: '1.9 mg/m³ oceanic upwelling filament',
        floodText: '4.5 sq km littoral coral flat inundation',
        opticalText: 'Pristine deep azure oceanic clarity & coral reef barrier'
      }
    };
  }

  init() {
    this.bindEvents();
    this.updateLegend();
    this.setBand('sst');
    this.renderCanvasLayers();

    window.addEventListener('resize', () => {
      this.renderCanvasLayers();
    });
  }

  bindEvents() {
    const divider = document.getElementById('sat-split-divider');
    const container = document.getElementById('satellite-split-viewer');

    if (!divider || !container) return;

    const onMove = (clientX) => {
      const rect = container.getBoundingClientRect();
      let offsetX = clientX - rect.left;
      if (offsetX < 0) offsetX = 0;
      if (offsetX > rect.width) offsetX = rect.width;
      this.sliderPos = (offsetX / rect.width) * 100;
      this.updateSlider();
    };

    divider.addEventListener('mousedown', () => { this.isDragging = true; });
    window.addEventListener('mouseup', () => { this.isDragging = false; });
    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) onMove(e.clientX);
    });

    // Touch support for tablets & mobile
    divider.addEventListener('touchstart', () => { this.isDragging = true; });
    window.addEventListener('touchend', () => { this.isDragging = false; });
    window.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length > 0) onMove(e.touches[0].clientX);
    });

    // Interactive Pixel Telemetry Sounding on Mousemove
    container.addEventListener('mousemove', (e) => {
      this.handlePixelInspection(e, container);
    });
  }

  handlePixelInspection(e, container) {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = Math.min(Math.max(x / rect.width, 0), 1);
    const normY = Math.min(Math.max(y / rect.height, 0), 1);

    const s = this.sectors[this.currentSector] || this.sectors.mangalore;
    const lat = (s.latRange[1] - normY * (s.latRange[1] - s.latRange[0])).toFixed(3);
    const lng = (s.lonRange[0] + normX * (s.lonRange[1] - s.lonRange[0])).toFixed(3);

    const hudText = document.getElementById('sat-cursor-telemetry-text');
    if (!hudText) return;

    const isAfter = (x / rect.width) * 100 > this.sliderPos;
    let valStr = '';

    if (this.currentBand === 'sst') {
      const temp = (s.sstBase + (isAfter ? 0.8 : 0) + (1 - normX) * 1.4 - normY * 0.5).toFixed(1);
      valStr = `SST: ${temp}°C · DELTA: ${isAfter ? '+0.8°C' : '0.0°C'} · DEPTH: -${Math.round(20 + (1 - normX) * 90)}m`;
    } else if (this.currentBand === 'chl') {
      const chl = (isAfter ? (normX > 0.4 && normX < 0.8 ? 2.6 : 0.6) : 0.3).toFixed(2);
      valStr = `CHL-a: ${chl} mg/m³ · RADIANCE: 443nm/560nm · BIOMASS: ${isAfter ? 'HIGH' : 'LOW'}`;
    } else if (this.currentBand === 'flood') {
      const sigma = (isAfter && normX > 0.6 ? -19.4 : -8.2).toFixed(1);
      valStr = `SAR BACKSCATTER: ${sigma} dB · POLARIZATION: VV+VH · SPECULAR: ${isAfter && normX > 0.6 ? 'INUNDATED' : 'TERRESTRIAL'}`;
    } else {
      valStr = `TRUE COLOR: B4+B3+B2 (10m) · REFLECTANCE: ${(normX * 0.35 + 0.12).toFixed(3)} · ALBEDO: CLEAR`;
    }

    hudText.innerHTML = `<b>SOUNDING:</b> ${lat}°N, ${lng}°E | <span style="color:var(--accent-aqua);">${valStr}</span>`;
  }

  updateSlider() {
    const divider = document.getElementById('sat-split-divider');
    const beforeLayer = document.getElementById('sat-layer-before');
    const ratioTag = document.getElementById('sat-split-ratio-tag');

    if (divider) divider.style.left = `${this.sliderPos}%`;
    if (beforeLayer) beforeLayer.style.clipPath = `polygon(0 0, ${this.sliderPos}% 0, ${this.sliderPos}% 100%, 0 100%)`;
    if (ratioTag) ratioTag.textContent = `SPLIT: ${Math.round(this.sliderPos)}%`;
  }

  setSector(sectorId) {
    if (!this.sectors[sectorId]) return;
    this.currentSector = sectorId;

    const sel = document.getElementById('sat-sector-select');
    if (sel && sel.value !== sectorId) sel.value = sectorId;

    this.updateTelemetryText();
    this.renderCanvasLayers();
  }

  setBand(bandName) {
    this.currentBand = bandName;

    // Update active button states
    document.querySelectorAll('.sat-band-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.band === bandName);
    });

    this.updateTelemetryText();
    this.updateLegend();
    this.renderCanvasLayers();
  }

  updateTelemetryText() {
    const s = this.sectors[this.currentSector] || this.sectors.mangalore;
    const metaTitle = document.getElementById('sat-meta-title');
    const metaDesc = document.getElementById('sat-meta-desc');
    const metaChange = document.getElementById('sat-meta-change');
    const sensorTag = document.getElementById('sat-sensor-tag');

    if (this.currentBand === 'sst') {
      if (metaTitle) metaTitle.textContent = `Sea Surface Temperature (SST) Thermal Anomaly · ${s.name}`;
      if (metaDesc) metaDesc.textContent = `MODIS + VIIRS Sensor fusion at 1km resolution. Thermal front detected along ${s.coastalFeature}. Depth profile: ${s.depthRange}.`;
      if (metaChange) metaChange.innerHTML = `<span style="color:#22d3b6;">${s.sstAnomalyText}</span>`;
      if (sensorTag) sensorTag.textContent = 'SENSOR: SENTINEL-3 SLSTR + VIIRS (1km)';
    } else if (this.currentBand === 'chl') {
      if (metaTitle) metaTitle.textContent = `Ocean Color & Chlorophyll-a Concentration · ${s.name}`;
      if (metaDesc) metaDesc.textContent = `Sentinel-3 OLCI multispectral ocean color bands. High phytoplankton density plume extends along ${s.coastalFeature}.`;
      if (metaChange) metaChange.innerHTML = `<span style="color:#00F5D4;">${s.chlPeakText}</span>`;
      if (sensorTag) sensorTag.textContent = 'SENSOR: SENTINEL-3 OLCI (300m Multispectral)';
    } else if (this.currentBand === 'flood') {
      if (metaTitle) metaTitle.textContent = `Sentinel-1 SAR Radar Coastal Inundation & Surges · ${s.name}`;
      if (metaDesc) metaDesc.textContent = `C-band Synthetic Aperture Radar microwave backscatter. Penetrates cloud cover to map flood extent along ${s.coastalFeature}.`;
      if (metaChange) metaChange.innerHTML = `<span style="color:#f59e0b;">${s.floodText}</span>`;
      if (sensorTag) sensorTag.textContent = 'SENSOR: SENTINEL-1 C-SAR (20m Dual-Pol)';
    } else {
      if (metaTitle) metaTitle.textContent = `Sentinel-2 MSI True Color Surface Optics · ${s.name}`;
      if (metaDesc) metaDesc.textContent = `10m Optical reflectance (Bands 4, 3, 2). High-resolution bathymetric shoals, surf breakers, and ${s.opticalText}.`;
      if (metaChange) metaChange.innerHTML = `<span style="color:#38bdf8;">${s.opticalText}</span>`;
      if (sensorTag) sensorTag.textContent = 'SENSOR: SENTINEL-2 MSI (10m True Color RGB)';
    }
  }

  updateLegend() {
    const title = document.getElementById('sat-legend-title');
    const ramp = document.getElementById('sat-legend-ramp');
    const minLbl = document.getElementById('sat-legend-min');
    const midLbl = document.getElementById('sat-legend-mid');
    const maxLbl = document.getElementById('sat-legend-max');

    if (!title || !ramp) return;

    if (this.currentBand === 'sst') {
      title.textContent = 'SST THERMAL FRONT (°C)';
      ramp.style.background = 'linear-gradient(90deg, #1e3a8a, #06b6d4, #10b981, #f59e0b, #ef4444)';
      if (minLbl) minLbl.textContent = '26.0°C';
      if (midLbl) midLbl.textContent = '28.5°C';
      if (maxLbl) maxLbl.textContent = '31.0°C';
    } else if (this.currentBand === 'chl') {
      title.textContent = 'CHLOROPHYLL-a (mg/m³)';
      ramp.style.background = 'linear-gradient(90deg, #020617, #0369a1, #06b6d4, #10b981, #4ade80)';
      if (minLbl) minLbl.textContent = '0.1';
      if (midLbl) midLbl.textContent = '1.5';
      if (maxLbl) maxLbl.textContent = '4.0+';
    } else if (this.currentBand === 'flood') {
      title.textContent = 'SAR RADAR BACKSCATTER (dB)';
      ramp.style.background = 'linear-gradient(90deg, #3b0764, #701a75, #db2777, #f43f5e, #fde047)';
      if (minLbl) minLbl.textContent = '-24 dB';
      if (midLbl) minLbl.textContent = '-14 dB';
      if (maxLbl) maxLbl.textContent = '-2 dB';
    } else {
      title.textContent = 'MSI OPTICAL RADIANCE';
      ramp.style.background = 'linear-gradient(90deg, #0f2744, #155e75, #0d9488, #ca8a04, #15803d)';
      if (minLbl) minLbl.textContent = 'Deep Sea';
      if (midLbl) minLbl.textContent = 'Shoal/Plume';
      if (maxLbl) maxLbl.textContent = 'Coastline';
    }
  }

  plotCurrentSectorOnMap() {
    const s = this.sectors[this.currentSector] || this.sectors.mangalore;
    if (window.orcaApp) {
      window.orcaApp.switchView('command');
      if (window.orcaApp.mapController) {
        window.orcaApp.mapController.flyTo(s.center[0], s.center[1], 9);
      }
    }
  }

  renderCanvasLayers() {
    const beforeCanvas = document.getElementById('sat-canvas-before');
    const afterCanvas = document.getElementById('sat-canvas-after');
    const container = document.getElementById('satellite-split-viewer');
    if (!beforeCanvas || !afterCanvas || !container) return;

    const w = container.clientWidth || 1000;
    const h = container.clientHeight || 580;
    beforeCanvas.width = w;
    beforeCanvas.height = h;
    afterCanvas.width = w;
    afterCanvas.height = h;

    const ctxB = beforeCanvas.getContext('2d');
    const ctxA = afterCanvas.getContext('2d');

    const s = this.sectors[this.currentSector] || this.sectors.mangalore;

    // Render Before (Baseline) & After (Live Observation)
    this.drawRealisticScene(ctxB, s, false, w, h);
    this.drawRealisticScene(ctxA, s, true, w, h);

    this.updateSlider();
  }

  drawRealisticScene(ctx, sector, isAfter, w, h) {
    // 1. Base Pelagic Oceanic Gradient
    const oceanGrad = ctx.createRadialGradient(w * 0.3, h * 0.4, 40, w * 0.5, h * 0.5, w * 0.8);
    if (this.currentBand === 'sst') {
      oceanGrad.addColorStop(0, '#0a233a');
      oceanGrad.addColorStop(0.5, '#051829');
      oceanGrad.addColorStop(1, '#020b14');
    } else if (this.currentBand === 'chl') {
      oceanGrad.addColorStop(0, '#041d2c');
      oceanGrad.addColorStop(0.6, '#02121e');
      oceanGrad.addColorStop(1, '#010910');
    } else if (this.currentBand === 'flood') {
      // SAR radar dark backscatter texture
      oceanGrad.addColorStop(0, '#0c1222');
      oceanGrad.addColorStop(1, '#04070f');
    } else {
      // Optical True Color
      oceanGrad.addColorStop(0, '#082f49');
      oceanGrad.addColorStop(0.6, '#0c2438');
      oceanGrad.addColorStop(1, '#04131f');
    }

    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Bathymetric Depth Contour Waves
    this.drawBathymetricContours(ctx, sector, w, h);

    // 3. Sector-Specific Realistic Coastline Geometry
    this.drawCoastline(ctx, sector, w, h);

    // 4. Multispectral Layer Overlays
    if (this.currentBand === 'sst') {
      this.drawSSTHeatmap(ctx, sector, isAfter, w, h);
    } else if (this.currentBand === 'chl') {
      this.drawChlorophyllSwirl(ctx, sector, isAfter, w, h);
    } else if (this.currentBand === 'flood') {
      this.drawSARFloodLayer(ctx, sector, isAfter, w, h);
    } else {
      this.drawOpticalTrueColor(ctx, sector, isAfter, w, h);
    }

    // 5. Scientific Graticule & HUD Overlay
    this.drawScientificGrid(ctx, sector, isAfter, w, h);
  }

  drawBathymetricContours(ctx, sector, w, h) {
    ctx.save();
    ctx.strokeStyle = 'rgba(34, 211, 182, 0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);

    const isobaths = [0.25, 0.4, 0.55, 0.7];
    isobaths.forEach((offset, idx) => {
      ctx.beginPath();
      ctx.moveTo(w * (offset - 0.05), 0);
      ctx.bezierCurveTo(
        w * (offset + 0.08), h * 0.35,
        w * (offset - 0.04), h * 0.65,
        w * (offset + 0.05), h
      );
      ctx.stroke();

      // Depth sounding tag
      ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(`-${(idx + 1) * 35}m`, w * offset + 6, h * 0.85 - idx * 40);
    });

    ctx.restore();
  }

  drawCoastline(ctx, sector, w, h) {
    ctx.save();

    ctx.beginPath();
    if (sector.coastSide === 'north') {
      // Sundarbans Delta: Mangrove mudflats on the top
      ctx.moveTo(0, h * 0.45);
      ctx.bezierCurveTo(w * 0.25, h * 0.4, w * 0.45, h * 0.55, w * 0.7, h * 0.42);
      ctx.bezierCurveTo(w * 0.85, h * 0.38, w * 0.95, h * 0.48, w, h * 0.44);
      ctx.lineTo(w, 0);
      ctx.lineTo(0, 0);
    } else if (sector.coastSide === 'strait') {
      // Palk Strait: Land on left (Tamil Nadu) and right (Sri Lanka)
      ctx.moveTo(0, 0);
      ctx.lineTo(w * 0.32, 0);
      ctx.bezierCurveTo(w * 0.28, h * 0.4, w * 0.35, h * 0.6, w * 0.25, h);
      ctx.lineTo(0, h);
    } else if (sector.coastSide === 'island') {
      // Andaman: Archipelago islands
      ctx.ellipse(w * 0.65, h * 0.45, w * 0.08, h * 0.32, -0.15, 0, Math.PI * 2);
      ctx.ellipse(w * 0.75, h * 0.2, w * 0.03, h * 0.08, 0.1, 0, Math.PI * 2);
    } else {
      // West Coast (Mangalore / Veraval): Land on right side
      ctx.moveTo(w * 0.72, 0);
      ctx.bezierCurveTo(w * 0.66, h * 0.25, w * 0.69, h * 0.55, w * 0.64, h * 0.78);
      ctx.bezierCurveTo(w * 0.62, h * 0.85, w * 0.68, h * 0.95, w * 0.67, h);
      ctx.lineTo(w, h);
      ctx.lineTo(w, 0);
    }

    ctx.closePath();

    // Natural Land Terrain Shading
    const landGrad = ctx.createLinearGradient(w * 0.6, 0, w, h);
    landGrad.addColorStop(0, '#0a1c18');
    landGrad.addColorStop(0.5, '#071613');
    landGrad.addColorStop(1, '#05110e');
    ctx.fillStyle = landGrad;
    ctx.fill();

    // High-resolution Coastline Edge Line
    ctx.strokeStyle = '#22d3b6';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(34, 211, 182, 0.4)';
    ctx.shadowBlur = 6;
    ctx.stroke();

    // Estuarine River Inlet (Netravati or local river)
    if (sector.coastSide === 'east') {
      ctx.beginPath();
      ctx.moveTo(w, h * 0.52);
      ctx.bezierCurveTo(w * 0.82, h * 0.50, w * 0.74, h * 0.56, w * 0.67, h * 0.53);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    ctx.restore();
  }

  drawSSTHeatmap(ctx, sector, isAfter, w, h) {
    ctx.save();

    if (!isAfter) {
      // BASELINE: Calm, uniform SST gradient with slight coastal warming
      const baseGrad = ctx.createRadialGradient(w * 0.35, h * 0.5, 30, w * 0.35, h * 0.5, w * 0.4);
      baseGrad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
      baseGrad.addColorStop(0.6, 'rgba(30, 58, 138, 0.2)');
      baseGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, w, h);

      // Baseline Isotherm Label
      ctx.fillStyle = 'rgba(34, 211, 182, 0.6)';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText('ISOTHERM: 28.2°C UNIFORM BASELINE', 24, h - 38);
    } else {
      // AFTER PASS: Upwelling Thermal Front with warm shelf pool & cool deep water
      // Primary Thermal Anomaly Core
      const coreX = w * 0.42;
      const coreY = h * 0.48;

      const thermalGrad = ctx.createRadialGradient(coreX, coreY, 20, coreX, coreY, w * 0.36);
      thermalGrad.addColorStop(0, 'rgba(245, 158, 11, 0.85)');   // Warmest front
      thermalGrad.addColorStop(0.3, 'rgba(239, 68, 68, 0.65)');  // Thermal shear
      thermalGrad.addColorStop(0.6, 'rgba(34, 211, 182, 0.45)');  // Upwelling boundary
      thermalGrad.addColorStop(0.85, 'rgba(6, 182, 212, 0.2)');
      thermalGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');

      ctx.fillStyle = thermalGrad;
      ctx.beginPath();
      ctx.ellipse(coreX, coreY, w * 0.26, h * 0.36, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Sharp Thermal Front Boundary Lines (Isotherms)
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(coreX - 80, coreY - 140);
      ctx.bezierCurveTo(coreX + 40, coreY - 60, coreX - 30, coreY + 60, coreX + 30, coreY + 140);
      ctx.stroke();

      // Front Dynamics Callout
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillText('THERMAL SHEAR FRONT Δ+0.8°C', coreX - 60, coreY - 150);

      // Upwelling Arrow Vectors
      ctx.setLineDash([]);
      ctx.strokeStyle = '#22d3b6';
      ctx.lineWidth = 2;
      this.drawArrow(ctx, coreX - 40, coreY + 40, coreX + 20, coreY + 10);
      this.drawArrow(ctx, coreX - 60, coreY - 20, coreX - 5, coreY - 50);
    }

    ctx.restore();
  }

  drawChlorophyllSwirl(ctx, sector, isAfter, w, h) {
    ctx.save();

    const startX = w * 0.65;
    const startY = h * 0.52;

    if (!isAfter) {
      // BASELINE: Low background chlorophyll
      ctx.fillStyle = 'rgba(6, 182, 212, 0.12)';
      ctx.beginPath();
      ctx.arc(startX - 90, startY, 70, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText('OLIGOTROPHIC BACKGROUND (0.28 mg/m³)', 24, h - 38);
    } else {
      // AFTER PASS: Vibrant Phytoplankton Swirl Plume with vortex eddies
      for (let i = 0; i < 4; i++) {
        const swirlGrad = ctx.createRadialGradient(
          startX - 110 - i * 30, startY + (i % 2 === 0 ? 30 : -30), 10,
          startX - 110 - i * 30, startY, 130 + i * 25
        );
        swirlGrad.addColorStop(0, 'rgba(34, 211, 182, 0.85)');
        swirlGrad.addColorStop(0.4, 'rgba(16, 185, 129, 0.6)');
        swirlGrad.addColorStop(0.75, 'rgba(6, 182, 212, 0.3)');
        swirlGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');

        ctx.fillStyle = swirlGrad;
        ctx.beginPath();
        ctx.ellipse(
          startX - 110 - i * 35, startY + (i * 12 - 18),
          120 + i * 20, 80 + i * 15,
          -0.28 + i * 0.08, 0, Math.PI * 2
        );
        ctx.fill();
      }

      // Streamline Filaments
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.7)';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(startX - 120, startY - 40, startX - 220, startY + 60, startX - 300, startY - 10);
      ctx.stroke();

      // Feeding Grounds Tag
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillText('PEAK PHYTOPLANKTON PLUME (2.6 mg/m³)', startX - 250, startY - 22);
    }

    ctx.restore();
  }

  drawSARFloodLayer(ctx, sector, isAfter, w, h) {
    ctx.save();

    // Radar Coherent Speckle Noise Simulation
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = 120;
    noiseCanvas.height = 120;
    const nCtx = noiseCanvas.getContext('2d');
    const nImg = nCtx.createImageData(120, 120);
    for (let p = 0; p < nImg.data.length; p += 4) {
      const val = Math.floor(Math.random() * 55 + (isAfter ? 18 : 8));
      nImg.data[p] = val;
      nImg.data[p + 1] = val + 15;
      nImg.data[p + 2] = val + 28;
      nImg.data[p + 3] = 45;
    }
    nCtx.putImageData(nImg, 0, 0);

    const pattern = ctx.createPattern(noiseCanvas, 'repeat');
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, w, h);
    }

    if (isAfter) {
      // INUNDATION AREA: Low backscatter specular radar absorption (dark red/magenta polygon)
      const floodX = w * 0.66;
      const floodY = h * 0.54;

      ctx.fillStyle = 'rgba(244, 63, 94, 0.55)';
      ctx.beginPath();
      ctx.ellipse(floodX, floodY, 95, 140, -0.32, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = 'rgba(244, 63, 94, 0.8)';
      ctx.shadowBlur = 10;
      ctx.stroke();

      // Hazard Box Label
      ctx.fillStyle = '#fecdd3';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillText('INUNDATION EXTENT: 14.2 km² (C-BAND SAR)', floodX - 70, floodY - 80);
    } else {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText('BASELINE SAR RADAR REFLECTANCE (-8.2 dB)', 24, h - 38);
    }

    ctx.restore();
  }

  drawOpticalTrueColor(ctx, sector, isAfter, w, h) {
    ctx.save();

    const mouthX = w * 0.66;
    const mouthY = h * 0.53;

    if (isAfter) {
      // Turbid River Sediment Plume (Tan / Turquoise silt cloud)
      const plumeGrad = ctx.createRadialGradient(mouthX, mouthY, 15, mouthX - 100, mouthY, 180);
      plumeGrad.addColorStop(0, 'rgba(202, 138, 4, 0.7)');     // Heavy brown river sediment
      plumeGrad.addColorStop(0.4, 'rgba(13, 148, 136, 0.6)');  // Turquoise shallow mix
      plumeGrad.addColorStop(0.8, 'rgba(14, 116, 144, 0.3)');  // Deep dispersion
      plumeGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');

      ctx.fillStyle = plumeGrad;
      ctx.beginPath();
      ctx.ellipse(mouthX - 85, mouthY, 160, 100, -0.15, 0, Math.PI * 2);
      ctx.fill();

      // Surf Breaker Fringe along coast
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(w * 0.71, 0);
      ctx.bezierCurveTo(w * 0.65, h * 0.25, w * 0.68, h * 0.55, w * 0.63, h * 0.78);
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillText('SUSPENDED SEDIMENT DISPERSION (11km PLUME)', mouthX - 180, mouthY - 45);
    } else {
      // Clear Baseline Water
      ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.beginPath();
      ctx.arc(mouthX - 50, mouthY, 50, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText('CLEAR WATER BASELINE REFLECTANCE (SENTINEL-2)', 24, h - 38);
    }

    ctx.restore();
  }

  drawScientificGrid(ctx, sector, isAfter, w, h) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    // Lat / Lon Graticule Lines
    const xSteps = 4;
    const ySteps = 3;

    for (let i = 1; i < xSteps; i++) {
      const gx = (w / xSteps) * i;
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();

      const lonVal = (sector.lonRange[0] + (i / xSteps) * (sector.lonRange[1] - sector.lonRange[0])).toFixed(2);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(`${lonVal}°E`, gx + 4, 18);
    }

    for (let j = 1; j < ySteps; j++) {
      const gy = (h / ySteps) * j;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();

      const latVal = (sector.latRange[1] - (j / ySteps) * (sector.latRange[1] - sector.latRange[0])).toFixed(2);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(`${latVal}°N`, 18, gy - 4);
    }

    // Crosshair in center
    const cx = w * 0.5;
    const cy = h * 0.5;
    ctx.strokeStyle = 'rgba(34, 211, 182, 0.18)';
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.moveTo(cx - 20, cy);
    ctx.lineTo(cx + 20, cy);
    ctx.moveTo(cx, cy - 20);
    ctx.lineTo(cx, cy + 20);
    ctx.stroke();

    ctx.restore();
  }

  drawArrow(ctx, fromX, fromY, toX, toY) {
    const headLen = 8;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  }
}

window.OrcaSatelliteLab = OrcaSatelliteLab;
