/**
 * ORCA Realistic Ocean & Satellite Intelligence Background FX
 * Visual Atmosphere: Deep Oceanic Abyssal Sounding + Satellite Earth Observation Sweep
 * Features:
 * - Subtle bathymetric depth contours & ocean current streamlines
 * - Translucent satellite orbital scan sweep & geospatial graticule
 * - Gentle marine particulate drift (upwelling & marine snow)
 * - Distant, restrained deep-ocean marine life silhouettes (pelagic whale & fish schools)
 */

class UnderwaterBackgroundFX {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    this.time = 0;
    this.scanY = 0;
    this.scanSpeed = 0.45;

    // Particles (marine drift / upwelling)
    this.particles = [];
    this.particleCount = 38;

    // Current Streamlines
    this.streamlines = [];

    // Subtle deep marine life silhouettes
    this.whale = {
      x: -250,
      y: this.height * 0.72,
      speedX: 0.28,
      scale: 0.85,
      phase: 0
    };

    this.fishSchools = [];

    this.init();
    this.bindEvents();
    this.animate();
  }

  init() {
    this.resize();
    this.initParticles();
    this.initStreamlines();
    this.initFishSchools();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    if (this.whale.y > this.height) {
      this.whale.y = this.height * 0.72;
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 1.5 + 0.5,
        speedX: Math.random() * 0.25 - 0.05,
        speedY: Math.random() * -0.35 - 0.1, // gentle upward oceanic drift
        opacity: Math.random() * 0.18 + 0.06,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  initStreamlines() {
    this.streamlines = [
      { yRatio: 0.28, amp: 22, freq: 0.0018, speed: 0.008, alpha: 0.05, width: 1.2 },
      { yRatio: 0.45, amp: 35, freq: 0.0012, speed: 0.006, alpha: 0.04, width: 1.0 },
      { yRatio: 0.65, amp: 28, freq: 0.0015, speed: 0.007, alpha: 0.05, width: 1.4 },
      { yRatio: 0.84, amp: 40, freq: 0.0009, speed: 0.005, alpha: 0.035, width: 1.0 }
    ];
  }

  initFishSchools() {
    this.fishSchools = [
      {
        x: this.width * 0.3,
        y: this.height * 0.55,
        count: 14,
        speedX: 0.32,
        speedY: 0.05,
        spreadX: 120,
        spreadY: 40
      },
      {
        x: this.width * 0.75,
        y: this.height * 0.38,
        count: 10,
        speedX: -0.22,
        speedY: -0.04,
        spreadX: 90,
        spreadY: 30
      }
    ];
  }

  animate() {
    this.time += 0.02;
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Base Oceanic Deep Abyss Background Gradient
    this.drawDeepOceanAbyss();

    // 2. Subtle Ocean Current Streamlines (Bathymetric drift)
    this.drawCurrentStreamlines();

    // 3. Subtle Satellite Earth Observation Scan Sweep
    this.drawSatelliteScanline();

    // 4. Subtle Marine Particulate Drift (Bioluminescent snow / nutrients)
    this.drawMarineParticles();

    // 5. Restrained Distant Marine Life Silhouettes
    this.drawDistantPelagicLife();

    requestAnimationFrame(() => this.animate());
  }

  drawDeepOceanAbyss() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Deep realistic ocean gradient: near-black void to deep indigo-graphite abyss
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#04070b');
    grad.addColorStop(0.35, '#070d15');
    grad.addColorStop(0.70, '#09131e');
    grad.addColorStop(1, '#050a10');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle radial light vignette simulating satellite optical sensor focus
    const radGrad = ctx.createRadialGradient(w * 0.5, h * 0.45, w * 0.1, w * 0.5, h * 0.45, w * 0.85);
    radGrad.addColorStop(0, 'rgba(14, 28, 42, 0.15)');
    radGrad.addColorStop(0.6, 'rgba(6, 14, 22, 0.08)');
    radGrad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle Geospatial Graticule Grid (Very faint satellite reference ticks)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
    ctx.lineWidth = 1;
    const gridSize = 140;
    for (let x = gridSize; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = gridSize; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  drawCurrentStreamlines() {
    const ctx = this.ctx;
    const w = this.width;

    this.streamlines.forEach(stream => {
      const baseY = this.height * stream.yRatio;
      ctx.save();
      ctx.strokeStyle = `rgba(45, 212, 191, ${stream.alpha})`;
      ctx.lineWidth = stream.width;
      ctx.setLineDash([12, 18]);
      ctx.lineDashOffset = -this.time * 25 * stream.speed;

      ctx.beginPath();
      for (let x = 0; x <= w; x += 15) {
        const y = baseY + Math.sin(x * stream.freq + this.time * stream.speed) * stream.amp
                        + Math.cos(x * stream.freq * 0.5 + this.time * 0.01) * (stream.amp * 0.4);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    });
  }

  drawSatelliteScanline() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    this.scanY += this.scanSpeed;
    if (this.scanY > h + 40) {
      this.scanY = -40;
    }

    const y = this.scanY;

    // Faint satellite sensor sweep beam
    const sweepGrad = ctx.createLinearGradient(0, y - 35, 0, y + 8);
    sweepGrad.addColorStop(0, 'rgba(45, 212, 191, 0)');
    sweepGrad.addColorStop(0.85, 'rgba(45, 212, 191, 0.035)');
    sweepGrad.addColorStop(1, 'rgba(139, 92, 246, 0.05)');

    ctx.fillStyle = sweepGrad;
    ctx.fillRect(0, y - 35, w, 43);

    // Ultra-thin scan pass line
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();

    // Satellite Observation Telemetry Marker along scanline
    ctx.save();
    ctx.fillStyle = 'rgba(148, 163, 184, 0.22)';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText('SENTINEL-3 / EOS-06 RADIAL SWATH [PASS ' + Math.floor(this.time * 2 % 900 + 100) + ']', 24, y - 5);
    ctx.restore();
  }

  drawMarineParticles() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    this.particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;

      // Wrap around screen edges
      if (p.y < -10) {
        p.y = h + 10;
        p.x = Math.random() * w;
      }
      if (p.x > w + 10) p.x = -10;
      if (p.x < -10) p.x = w + 10;

      const currentAlpha = p.opacity * (0.7 + 0.3 * Math.sin(this.time * 2 + p.phase));

      ctx.save();
      ctx.fillStyle = `rgba(165, 243, 252, ${currentAlpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  drawDistantPelagicLife() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 1. Distant Blue Whale / Pelagic Silhouette (Drifting smoothly in deep ocean background)
    const wh = this.whale;
    wh.x += wh.speedX;
    if (wh.x > w + 300) {
      wh.x = -320;
      wh.y = h * (0.65 + Math.random() * 0.18);
    }

    ctx.save();
    ctx.translate(wh.x, wh.y);
    ctx.scale(wh.scale, wh.scale);

    // Deep ocean silhouette styling (Restrained, subtle graphite-blue at ~0.09 opacity)
    ctx.fillStyle = 'rgba(22, 38, 56, 0.14)';
    ctx.beginPath();
    
    // Smooth, realistic whale body contours
    ctx.moveTo(0, 0);
    // Head rostrum curve
    ctx.bezierCurveTo(45, -12, 110, -14, 150, -6);
    // Dorsal line to tail
    ctx.bezierCurveTo(200, 4, 250, 10, 275, 4);
    // Tail peduncle
    ctx.bezierCurveTo(285, 2, 292, -2, 298, -12);
    // Upper fluke
    ctx.lineTo(306, -18);
    ctx.lineTo(302, -2);
    // Lower fluke
    ctx.lineTo(306, 12);
    ctx.lineTo(296, 6);
    // Ventral groove back to belly
    ctx.bezierCurveTo(280, 12, 230, 24, 180, 26);
    // Pectoral fin
    ctx.bezierCurveTo(145, 34, 130, 48, 122, 54);
    ctx.bezierCurveTo(126, 42, 136, 30, 145, 24);
    // Throat grooves to chin
    ctx.bezierCurveTo(110, 22, 50, 14, 0, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // 2. Subtle Distant Pelagic Fish Schools
    this.fishSchools.forEach(school => {
      school.x += school.speedX;
      school.y += school.speedY;

      if (school.speedX > 0 && school.x > w + 150) {
        school.x = -150;
        school.y = h * (0.3 + Math.random() * 0.4);
      } else if (school.speedX < 0 && school.x < -150) {
        school.x = w + 150;
        school.y = h * (0.3 + Math.random() * 0.4);
      }

      ctx.save();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      for (let i = 0; i < school.count; i++) {
        const fx = school.x + Math.sin(i * 1.5 + this.time) * (school.spreadX * 0.5) + (i * 8);
        const fy = school.y + Math.cos(i * 1.2 + this.time * 0.8) * (school.spreadY * 0.5);
        
        ctx.beginPath();
        // Tiny fish silhouette dart
        ctx.ellipse(fx, fy, 4.5, 1.8, school.speedX > 0 ? 0.05 : Math.PI - 0.05, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }
}

// Instantiate upon DOM load
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('underwater-canvas')) {
    window.orcaBackgroundFX = new UnderwaterBackgroundFX('underwater-canvas');
  }
});
