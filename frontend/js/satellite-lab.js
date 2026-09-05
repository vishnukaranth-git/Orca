/**
 * ORCA Satellite Intelligence Lab
 * Interactive Before/After multispectral satellite slider & coastal change detection engine.
 */

class OrcaSatelliteLab {
  constructor() {
    this.currentBand = 'sst';
    this.sliderPos = 50; // percentage
    this.isDragging = false;
  }

  init() {
    this.bindEvents();
    this.renderCanvasLayers();
    this.setBand('sst');
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

    // Touch support for mobile/tablets
    divider.addEventListener('touchstart', () => { this.isDragging = true; });
    window.addEventListener('touchend', () => { this.isDragging = false; });
    window.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length > 0) onMove(e.touches[0].clientX);
    });
  }

  updateSlider() {
    const divider = document.getElementById('sat-split-divider');
    const beforeLayer = document.getElementById('sat-layer-before');
    if (divider) divider.style.left = `${this.sliderPos}%`;
    if (beforeLayer) beforeLayer.style.clipPath = `polygon(0 0, ${this.sliderPos}% 0, ${this.sliderPos}% 100%, 0 100%)`;
  }

  setBand(bandName) {
    this.currentBand = bandName;
    
    // Update active button state
    document.querySelectorAll('.sat-band-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.band === bandName);
    });

    // Update telemetry summary
    const metaTitle = document.getElementById('sat-meta-title');
    const metaDesc = document.getElementById('sat-meta-desc');
    const metaChange = document.getElementById('sat-meta-change');

    if (bandName === 'sst') {
      if (metaTitle) metaTitle.textContent = 'Sea Surface Temperature (SST) Thermal Anomaly';
      if (metaDesc) metaDesc.textContent = 'MODIS + VIIRS Sensor fusion at 1km resolution. Thermal front gradient detected off Mangalore Shelf.';
      if (metaChange) metaChange.innerHTML = '<span style="color:#28f0d0;">+0.8°C thermal front shift</span> (Optimal for Tuna)';
    } else if (bandName === 'chl') {
      if (metaTitle) metaTitle.textContent = 'Ocean Color & Chlorophyll-a Concentration';
      if (metaDesc) metaDesc.textContent = 'Sentinel-3 OLCI ocean color data. High chlorophyll zones signify high phytoplankton feeding grounds.';
      if (metaChange) metaChange.innerHTML = '<span style="color:#16d9ff;">2.4 mg/m³ peak density</span> (+34% primary production)';
    } else if (bandName === 'flood') {
      if (metaTitle) metaTitle.textContent = 'Sentinel-1 SAR Coastal Flood & Water Inundation';
      if (metaDesc) metaDesc.textContent = 'C-band Synthetic Aperture Radar penetration through heavy cloud cover. Analyzes surface water extent.';
      if (metaChange) metaChange.innerHTML = '<span style="color:#ff7b25;">14.2 sq km coastal inundation</span> detected post-monsoon surge';
    } else {
      if (metaTitle) metaTitle.textContent = 'Sentinel-2 True Color Surface Optical Imagery';
      if (metaDesc) metaDesc.textContent = 'Multispectral Instrument (MSI) 10m spatial resolution. Coastal morphology and sediment discharge.';
      if (metaChange) metaChange.innerHTML = '<span style="color:#ffd166;">River plume discharge</span> extend 12km into Arabian Sea';
    }

    this.renderCanvasLayers();
  }

  renderCanvasLayers() {
    const beforeCanvas = document.getElementById('sat-canvas-before');
    const afterCanvas = document.getElementById('sat-canvas-after');
    if (!beforeCanvas || !afterCanvas) return;

    const w = 900;
    const h = 550;
    beforeCanvas.width = w;
    beforeCanvas.height = h;
    afterCanvas.width = w;
    afterCanvas.height = h;

    const ctxB = beforeCanvas.getContext('2d');
    const ctxA = afterCanvas.getContext('2d');

    // Base Coastline geometry
    const drawBaseCoast = (ctx, theme) => {
      // Deep Ocean
      ctx.fillStyle = theme === 'sst' ? '#072438' : theme === 'chl' ? '#041d28' : '#041624';
      ctx.fillRect(0, 0, w, h);

      // Landmass on right side
      ctx.beginPath();
      ctx.moveTo(w * 0.75, 0);
      ctx.bezierCurveTo(w * 0.7, h * 0.3, w * 0.65, h * 0.7, w * 0.78, h);
      ctx.lineTo(w, h);
      ctx.lineTo(w, 0);
      ctx.closePath();
      ctx.fillStyle = '#081a17';
      ctx.fill();
      ctx.strokeStyle = '#16d9ff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    // Draw BEFORE canvas
    drawBaseCoast(ctxB, this.currentBand);
    ctxB.fillStyle = 'rgba(22, 217, 255, 0.15)';
    ctxB.beginPath();
    ctxB.arc(w * 0.4, h * 0.5, 90, 0, Math.PI * 2);
    ctxB.fill();
    ctxB.fillStyle = '#eafbff';
    ctxB.font = '13px "Omnium", "Rajdhani", sans-serif';
    ctxB.fillText('PRE-EVENT BASELINE (04:00 UTC)', 25, 40);

    // Draw AFTER canvas with heat/change overlays
    drawBaseCoast(ctxA, this.currentBand);
    if (this.currentBand === 'sst') {
      const grad = ctxA.createRadialGradient(w * 0.45, h * 0.45, 20, w * 0.45, h * 0.45, 180);
      grad.addColorStop(0, 'rgba(255, 123, 37, 0.65)');
      grad.addColorStop(0.5, 'rgba(40, 240, 208, 0.45)');
      grad.addColorStop(1, 'rgba(22, 217, 255, 0)');
      ctxA.fillStyle = grad;
      ctxA.beginPath();
      ctxA.arc(w * 0.45, h * 0.45, 180, 0, Math.PI * 2);
      ctxA.fill();
    } else if (this.currentBand === 'chl') {
      const grad = ctxA.createRadialGradient(w * 0.5, h * 0.55, 10, w * 0.5, h * 0.55, 140);
      grad.addColorStop(0, 'rgba(40, 240, 208, 0.8)');
      grad.addColorStop(0.6, 'rgba(8, 126, 164, 0.5)');
      grad.addColorStop(1, 'rgba(2, 11, 20, 0)');
      ctxA.fillStyle = grad;
      ctxA.beginPath();
      ctxA.arc(w * 0.5, h * 0.55, 140, 0, Math.PI * 2);
      ctxA.fill();
    } else if (this.currentBand === 'flood') {
      // Flood Inundation polygon
      ctxA.fillStyle = 'rgba(255, 51, 102, 0.55)';
      ctxA.beginPath();
      ctxA.ellipse(w * 0.68, h * 0.48, 55, 110, -0.3, 0, Math.PI * 2);
      ctxA.fill();
      ctxA.strokeStyle = '#ff3366';
      ctxA.lineWidth = 2;
      ctxA.stroke();
    }

    ctxA.fillStyle = '#28f0d0';
    ctxA.font = '13px "Omnium", "Rajdhani", sans-serif';
    ctxA.fillText('LIVE ANALYSIS OVERLAY (RECENT PASS)', w - 340, 40);

    this.updateSlider();
  }
}

window.OrcaSatelliteLab = OrcaSatelliteLab;
