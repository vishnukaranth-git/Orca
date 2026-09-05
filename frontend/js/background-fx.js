/**
 * ORCA Living Bioluminescent Deep Ocean Ecosystem & ISRO Sonar Radar Canvas
 * Fusion of deep-sea abyssal biology and satellite/submarine mission telemetry.
 * 
 * Multi-layer rendering pipeline:
 *  - Layer 0: Abyssal void depth gradient (#01050C -> #041428 -> #062038)
 *  - Layer 1: Drifting ocean caustics & soft god-rays
 *  - Layer 2: Distant pelagic megafauna silhouettes (Blue Whale, Whale Shark, Manta Rays)
 *  - Layer 3: Midground marine life (Bioluminescent Jellyfish, Sea Turtles, Fish Schools, Shark)
 *  - Layer 4: Seafloor bathymetry (Swaying kelp forest, coral silhouettes, Anglerfish with glowing esca)
 *  - Layer 5: Bioluminescent plankton embers & rising micro-bubbles
 *  - Layer 6: Subtle ISRO / Sonar acoustic radar range rings & rotating radial sweep
 */

class UnderwaterBackgroundFX {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    this.time = 0;
    this.radarAngle = 0;
    this.prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Entities
    this.plankton = [];
    this.bubbles = [];
    this.jellyfish = [];
    this.schools = [];
    this.kelpStrands = [];
    this.turtles = [];
    this.manta = null;
    this.whale = null;
    this.whaleShark = null;
    this.shark = null;
    this.anglerfish = null;

    this.init();
    this.bindEvents();

    if (this.prefersReducedMotion) {
      this.renderStaticFrame();
    } else {
      this.animate();
    }
  }

  init() {
    this.resize();
    this.initParticles();
    this.initFauna();
    this.initSeafloor();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.initSeafloor();
      if (this.prefersReducedMotion) this.renderStaticFrame();
    });

    if (window.matchMedia) {
      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => {
        this.prefersReducedMotion = e.matches;
        if (!this.prefersReducedMotion) this.animate();
        else this.renderStaticFrame();
      });
    }
  }

  initParticles() {
    // Bioluminescent Plankton Embers
    this.plankton = [];
    const pCount = Math.min(55, Math.floor(this.width / 26));
    for (let i = 0; i < pCount; i++) {
      this.plankton.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 2.0 + 0.6,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -0.15 - Math.random() * 0.25,
        baseAlpha: Math.random() * 0.35 + 0.2,
        pulseSpeed: Math.random() * 0.03 + 0.015,
        phase: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.4 ? '0, 245, 212' : '58, 160, 255' // Teal or ISRO Blue
      });
    }

    // Micro-bubbles
    this.bubbles = [];
    for (let i = 0; i < 22; i++) {
      this.bubbles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        r: Math.random() * 2.2 + 0.8,
        vy: -0.4 - Math.random() * 0.6,
        vx: (Math.random() - 0.5) * 0.15,
        alpha: Math.random() * 0.25 + 0.08
      });
    }
  }

  initFauna() {
    // Distant Blue Whale
    this.whale = {
      x: -340,
      y: this.height * 0.62,
      vx: 0.32,
      scale: 0.88,
      tailPhase: 0
    };

    // Distant Whale Shark with spots
    this.whaleShark = {
      x: this.width + 300,
      y: this.height * 0.38,
      vx: -0.28,
      scale: 0.72,
      tailPhase: 1.5
    };

    // Manta Ray
    this.manta = {
      x: this.width * 0.45,
      y: this.height * 0.24,
      vx: 0.38,
      vy: 0.06,
      scale: 0.65,
      wingPhase: 0
    };

    // Bioluminescent Jellyfish
    this.jellyfish = [
      { x: this.width * 0.18, y: this.height * 0.42, r: 24, vy: -0.22, pulse: 0, color: '0, 245, 212' },
      { x: this.width * 0.78, y: this.height * 0.68, r: 32, vy: -0.28, pulse: 1.8, color: '0, 194, 209' },
      { x: this.width * 0.88, y: this.height * 0.28, r: 18, vy: -0.18, pulse: 3.4, color: '58, 160, 255' }
    ];

    // Sea Turtles
    this.turtles = [
      {
        x: this.width * 0.12,
        y: this.height * 0.78,
        vx: 0.42,
        vy: -0.08,
        scale: 0.55,
        flipperPhase: 0
      }
    ];

    // Cruising Shark
    this.shark = {
      x: -220,
      y: this.height * 0.82,
      vx: 0.45,
      scale: 0.68,
      phase: 0
    };

    // Anglerfish with glowing esca
    this.anglerfish = {
      x: this.width * 0.82,
      y: this.height - 42,
      scale: 0.48,
      glowPhase: 0
    };

    // Schools of Fish
    this.schools = [
      {
        x: this.width * 0.35,
        y: this.height * 0.48,
        vx: 0.55,
        vy: 0.04,
        count: 16,
        spreadX: 110,
        spreadY: 45
      },
      {
        x: this.width * 0.65,
        y: this.height * 0.32,
        vx: -0.42,
        vy: -0.06,
        count: 14,
        spreadX: 95,
        spreadY: 38
      }
    ];
  }

  initSeafloor() {
    // Kelp Strands along bottom
    this.kelpStrands = [];
    const numKelp = Math.floor(this.width / 42);
    for (let i = 0; i < numKelp; i++) {
      this.kelpStrands.push({
        x: i * 42 + (Math.random() * 14 - 7),
        height: Math.random() * 110 + 65,
        width: Math.random() * 8 + 6,
        phase: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.015 + 0.008
      });
    }
  }

  animate() {
    if (this.prefersReducedMotion) return;
    this.time += 0.02;
    this.radarAngle = (this.radarAngle + 0.008) % (Math.PI * 2);

    this.renderFrame();
    requestAnimationFrame(() => this.animate());
  }

  renderStaticFrame() {
    this.time = 1.5;
    this.radarAngle = 0.8;
    this.renderFrame();
  }

  renderFrame() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 0. Base Abyssal Depth Gradient (#01050C -> #041428 -> #062038)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#01050C');
    bgGrad.addColorStop(0.35, '#041428');
    bgGrad.addColorStop(0.72, '#062038');
    bgGrad.addColorStop(1, '#020A16');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 1. Drifting Caustic God-Rays
    this.drawCaustics();

    // 2. ISRO Acoustic Radar Range Grid & Sweep
    this.drawSonarRadar();

    // 3. Deep Background Megafauna (Whale, Whale Shark, Manta)
    this.drawDistantMegafauna();

    // 4. Midground Marine Life (Jellyfish, Turtles, Fish Schools, Pelagic Shark)
    this.drawMidgroundFauna();

    // 5. Seafloor Bathymetry (Swaying Kelp, Coral, Anglerfish)
    this.drawSeafloor();

    // 6. Foreground Bioluminescent Plankton & Bubbles
    this.drawParticles();
  }

  drawCaustics() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.save();
    // Light shafts descending from water surface
    const rayCount = 6;
    for (let i = 0; i < rayCount; i++) {
      const xOrigin = (w / (rayCount + 1)) * (i + 1) + Math.sin(this.time * 0.4 + i) * 35;
      const rayWidth = 80 + Math.sin(this.time * 0.3 + i * 2) * 20;

      const grad = ctx.createLinearGradient(xOrigin, 0, xOrigin + 120, h * 0.7);
      grad.addColorStop(0, 'rgba(0, 245, 212, 0.045)');
      grad.addColorStop(0.3, 'rgba(58, 160, 255, 0.03)');
      grad.addColorStop(1, 'rgba(1, 5, 12, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(xOrigin - rayWidth * 0.2, 0);
      ctx.lineTo(xOrigin + rayWidth * 0.4, 0);
      ctx.lineTo(xOrigin + 160 + rayWidth, h * 0.7);
      ctx.lineTo(xOrigin + 120 - rayWidth * 0.5, h * 0.7);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  drawSonarRadar() {
    const ctx = this.ctx;
    const cx = this.width * 0.88;
    const cy = this.height * 0.22;
    const maxRadius = Math.min(this.width * 0.18, 180);

    ctx.save();
    ctx.translate(cx, cy);

    // Range rings (1000m, 2500m, 4000m)
    const rings = [0.33, 0.66, 1.0];
    const ringLabels = ['1,000M', '2,500M', '4,000M'];

    ctx.strokeStyle = 'rgba(0, 245, 212, 0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);

    rings.forEach((ratio, idx) => {
      const r = maxRadius * ratio;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();

      // Range label
      ctx.fillStyle = 'rgba(127, 168, 184, 0.22)';
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillText(ringLabels[idx], 4, -r + 10);
    });

    // Crosshairs
    ctx.setLineDash([2, 4]);
    ctx.strokeStyle = 'rgba(58, 160, 255, 0.08)';
    ctx.beginPath();
    ctx.moveTo(-maxRadius, 0);
    ctx.lineTo(maxRadius, 0);
    ctx.moveTo(0, -maxRadius);
    ctx.lineTo(0, maxRadius);
    ctx.stroke();
    ctx.setLineDash([]);

    // Degree markers
    ctx.fillStyle = 'rgba(127, 168, 184, 0.25)';
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('000°', 0, -maxRadius - 4);
    ctx.fillText('090°', maxRadius + 14, 3);
    ctx.fillText('180°', 0, maxRadius + 11);
    ctx.fillText('270°', -maxRadius - 14, 3);

    // Rotating Radar Sweep Cone
    const sweepGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius);
    sweepGrad.addColorStop(0, 'rgba(0, 245, 212, 0.12)');
    sweepGrad.addColorStop(0.7, 'rgba(0, 245, 212, 0.04)');
    sweepGrad.addColorStop(1, 'rgba(0, 245, 212, 0)');

    ctx.fillStyle = sweepGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, maxRadius, this.radarAngle - 0.35, this.radarAngle);
    ctx.closePath();
    ctx.fill();

    // Leading sweep line
    ctx.strokeStyle = 'rgba(0, 245, 212, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(this.radarAngle) * maxRadius, Math.sin(this.radarAngle) * maxRadius);
    ctx.stroke();

    ctx.restore();
  }

  drawDistantMegafauna() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 1. Blue Whale
    const wh = this.whale;
    wh.x += wh.vx;
    wh.tailPhase += 0.02;
    if (wh.x > w + 360) {
      wh.x = -360;
      wh.y = h * (0.55 + Math.random() * 0.2);
    }

    ctx.save();
    ctx.translate(wh.x, wh.y);
    ctx.scale(wh.scale, wh.scale);

    // Atmosphere silhouette color: deep abyssal blue-grey
    ctx.fillStyle = 'rgba(10, 30, 52, 0.22)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(55, -14, 130, -18, 180, -8);
    ctx.bezierCurveTo(240, 4, 300, 10, 330, 4);
    
    // Tail oscillation
    const tailY = Math.sin(wh.tailPhase) * 6;
    ctx.bezierCurveTo(345, 2 + tailY, 355, -2 + tailY, 362, -14 + tailY);
    ctx.lineTo(372, -22 + tailY);
    ctx.lineTo(366, -2 + tailY);
    ctx.lineTo(372, 14 + tailY);
    ctx.lineTo(360, 6 + tailY);

    ctx.bezierCurveTo(340, 14, 280, 28, 220, 30);
    // Pectoral flipper
    ctx.bezierCurveTo(175, 40, 158, 56, 148, 62);
    ctx.bezierCurveTo(154, 48, 166, 36, 176, 28);
    // Belly groove
    ctx.bezierCurveTo(130, 26, 60, 16, 0, 0);
    ctx.closePath();
    ctx.fill();

    // Subtle bioluminescent rim glow
    ctx.strokeStyle = 'rgba(0, 245, 212, 0.05)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();

    // 2. Whale Shark (Swimming right to left)
    const ws = this.whaleShark;
    ws.x += ws.vx;
    ws.tailPhase += 0.025;
    if (ws.x < -360) {
      ws.x = w + 360;
      ws.y = h * (0.3 + Math.random() * 0.25);
    }

    ctx.save();
    ctx.translate(ws.x, ws.y);
    ctx.scale(-ws.scale, ws.scale); // flip to swim left

    ctx.fillStyle = 'rgba(8, 26, 48, 0.20)';
    ctx.beginPath();
    // Broad flat head
    ctx.moveTo(0, 4);
    ctx.bezierCurveTo(25, -16, 80, -22, 140, -16);
    // Dorsal fin 1
    ctx.lineTo(165, -34);
    ctx.lineTo(175, -12);
    ctx.bezierCurveTo(210, -6, 250, 0, 280, 2);
    // Dorsal fin 2
    ctx.lineTo(290, -10);
    ctx.lineTo(296, 4);
    // Tail peduncle
    const wsTail = Math.sin(ws.tailPhase) * 7;
    ctx.lineTo(320, -2 + wsTail);
    // Big heterocercal caudal fin
    ctx.lineTo(336, -26 + wsTail);
    ctx.lineTo(328, 0 + wsTail);
    ctx.lineTo(338, 18 + wsTail);
    ctx.lineTo(320, 8 + wsTail);
    // Ventral line
    ctx.bezierCurveTo(270, 16, 210, 22, 160, 22);
    // Pectoral fin
    ctx.lineTo(135, 48);
    ctx.lineTo(145, 20);
    ctx.bezierCurveTo(90, 18, 40, 14, 0, 4);
    ctx.closePath();
    ctx.fill();

    // Spots on dorsal back (bioluminescent marine snow reflection)
    ctx.fillStyle = 'rgba(0, 245, 212, 0.12)';
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 4; c++) {
        const sx = 60 + r * 38 + (c % 2) * 8;
        const sy = -8 + c * 7;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // 3. Manta Ray Gliding
    const m = this.manta;
    m.x += m.vx;
    m.y += Math.sin(this.time * 0.5) * 0.2;
    m.wingPhase += 0.04;
    if (m.x > w + 200) {
      m.x = -200;
      m.y = h * (0.18 + Math.random() * 0.2);
    }

    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.scale(m.scale, m.scale);

    const wingFlap = Math.sin(m.wingPhase) * 9;
    ctx.fillStyle = 'rgba(6, 24, 44, 0.25)';
    ctx.beginPath();
    ctx.moveTo(0, 0); // Head center
    // Left wing
    ctx.bezierCurveTo(-25, -20 + wingFlap, -65, -35 + wingFlap * 1.5, -95, -28 + wingFlap * 1.8);
    ctx.bezierCurveTo(-70, -10, -35, 10, -15, 20);
    // Tail
    ctx.lineTo(-4, 25);
    ctx.lineTo(-2, 75); // Long whip tail
    ctx.lineTo(2, 75);
    ctx.lineTo(4, 25);
    // Right wing
    ctx.lineTo(15, 20);
    ctx.bezierCurveTo(35, 10, 70, -10, 95, -28 - wingFlap * 1.8);
    ctx.bezierCurveTo(65, -35 - wingFlap * 1.5, 25, -20 - wingFlap, 0, 0);
    ctx.closePath();
    ctx.fill();

    // Cephalic horns
    ctx.beginPath();
    ctx.moveTo(-10, -4);
    ctx.lineTo(-15, -14);
    ctx.lineTo(-8, -10);
    ctx.moveTo(10, -4);
    ctx.lineTo(15, -14);
    ctx.lineTo(8, -10);
    ctx.strokeStyle = 'rgba(6, 24, 44, 0.25)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
  }

  drawMidgroundFauna() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 1. Bioluminescent Jellyfish
    this.jellyfish.forEach(j => {
      j.y += j.vy;
      j.pulse += 0.035;

      if (j.y < -80) {
        j.y = h + 60;
        j.x = Math.random() * (w * 0.8) + (w * 0.1);
      }

      // Rhythmic bell pulsing
      const contraction = Math.sin(j.pulse);
      const scaleX = 1 + contraction * 0.12;
      const scaleY = 1 - contraction * 0.18;

      ctx.save();
      ctx.translate(j.x, j.y);
      ctx.scale(scaleX, scaleY);

      // Outer glowing bell
      const bellGrad = ctx.createRadialGradient(0, -j.r * 0.2, 2, 0, 0, j.r);
      bellGrad.addColorStop(0, `rgba(${j.color}, 0.45)`);
      bellGrad.addColorStop(0.65, `rgba(${j.color}, 0.18)`);
      bellGrad.addColorStop(1, `rgba(${j.color}, 0)`);

      ctx.fillStyle = bellGrad;
      ctx.beginPath();
      ctx.arc(0, 0, j.r, Math.PI, 0, false);
      ctx.bezierCurveTo(j.r * 0.6, j.r * 0.4, -j.r * 0.6, j.r * 0.4, -j.r, 0);
      ctx.closePath();
      ctx.fill();

      // Inner glowing organ / umbrella margin
      ctx.strokeStyle = `rgba(${j.color}, 0.6)`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, j.r * 0.95, Math.PI * 1.05, Math.PI * 1.95, false);
      ctx.stroke();

      // Flowing bioluminescent tentacles
      ctx.lineWidth = 1;
      const tentacleCount = 5;
      for (let t = 0; t < tentacleCount; t++) {
        const tx = ((t / (tentacleCount - 1)) - 0.5) * (j.r * 1.2);
        ctx.strokeStyle = `rgba(${j.color}, 0.28)`;
        ctx.beginPath();
        ctx.moveTo(tx, 4);

        const wave1 = Math.sin(this.time * 2 + t) * 6;
        const wave2 = Math.cos(this.time * 1.5 + t * 0.8) * 9;
        ctx.bezierCurveTo(tx + wave1, j.r * 0.8, tx - wave2, j.r * 1.6, tx + wave1 * 0.5, j.r * 2.5);
        ctx.stroke();
      }

      ctx.restore();
    });

    // 2. Sea Turtle
    this.turtles.forEach(t => {
      t.x += t.vx;
      t.y += t.vy;
      t.flipperPhase += 0.03;

      if (t.x > w + 160) {
        t.x = -160;
        t.y = h * (0.65 + Math.random() * 0.25);
      }

      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.scale(t.scale, t.scale);

      const stroke = Math.sin(t.flipperPhase) * 14;
      ctx.fillStyle = 'rgba(8, 28, 48, 0.24)';
      ctx.beginPath();
      // Carapace shell
      ctx.ellipse(0, 0, 24, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.beginPath();
      ctx.ellipse(30, -2, 8, 5, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Front Flippers
      ctx.beginPath();
      ctx.moveTo(14, -8);
      ctx.bezierCurveTo(24, -26 + stroke, 12, -34 + stroke, -2, -30 + stroke);
      ctx.lineTo(8, -8);
      ctx.moveTo(14, 8);
      ctx.bezierCurveTo(24, 26 - stroke, 12, 34 - stroke, -2, 30 - stroke);
      ctx.lineTo(8, 8);
      ctx.fill();

      // Rear Flippers
      ctx.beginPath();
      ctx.ellipse(-18, -10, 6, 3, -0.4, 0, Math.PI * 2);
      ctx.ellipse(-18, 10, 6, 3, 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // 3. Pelagic Cruising Shark
    const sk = this.shark;
    sk.x += sk.vx;
    sk.phase += 0.035;
    if (sk.x > w + 260) {
      sk.x = -260;
      sk.y = h * (0.75 + Math.random() * 0.15);
    }

    ctx.save();
    ctx.translate(sk.x, sk.y);
    ctx.scale(sk.scale, sk.scale);

    const tailSwing = Math.sin(sk.phase) * 6;
    ctx.fillStyle = 'rgba(7, 25, 46, 0.26)';
    ctx.beginPath();
    ctx.moveTo(0, 0); // Snout
    ctx.bezierCurveTo(20, -10, 60, -12, 100, -8);
    // Dorsal Fin
    ctx.lineTo(118, -32);
    ctx.lineTo(132, -4);
    ctx.bezierCurveTo(160, 0, 190, 4, 215, 4);
    // Tail
    ctx.lineTo(238, -20 + tailSwing);
    ctx.lineTo(230, 0 + tailSwing);
    ctx.lineTo(240, 14 + tailSwing);
    ctx.lineTo(218, 8 + tailSwing);
    // Belly
    ctx.bezierCurveTo(180, 14, 130, 16, 90, 14);
    // Pectoral fin
    ctx.lineTo(76, 32);
    ctx.lineTo(82, 12);
    ctx.bezierCurveTo(50, 10, 20, 6, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 4. Schools of Fish
    this.schools.forEach(school => {
      school.x += school.vx;
      school.y += school.vy;

      if (school.vx > 0 && school.x > w + 180) {
        school.x = -180;
        school.y = h * (0.28 + Math.random() * 0.35);
      } else if (school.vx < 0 && school.x < -180) {
        school.x = w + 180;
        school.y = h * (0.28 + Math.random() * 0.35);
      }

      ctx.save();
      ctx.fillStyle = 'rgba(0, 245, 212, 0.18)';
      for (let i = 0; i < school.count; i++) {
        const fx = school.x + Math.sin(i * 1.3 + this.time) * (school.spreadX * 0.5) + (i * 9);
        const fy = school.y + Math.cos(i * 1.1 + this.time * 0.8) * (school.spreadY * 0.5);

        ctx.beginPath();
        ctx.ellipse(fx, fy, 4.5, 1.6, school.vx > 0 ? 0.05 : Math.PI - 0.05, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  drawSeafloor() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Coral / Bathymetric ridge silhouette
    ctx.fillStyle = 'rgba(2, 8, 16, 0.65)';
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h - 35);
    for (let x = 0; x <= w; x += 40) {
      const cy = h - 28 + Math.sin(x * 0.008) * 14 + Math.cos(x * 0.02) * 8;
      ctx.lineTo(x, cy);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Swaying Kelp Forest
    this.kelpStrands.forEach(kelp => {
      ctx.save();
      const sway = Math.sin(this.time * 1.5 + kelp.phase) * 18;
      ctx.strokeStyle = 'rgba(0, 194, 209, 0.14)';
      ctx.lineWidth = kelp.width;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(kelp.x, h);
      ctx.bezierCurveTo(
        kelp.x + sway * 0.3, h - kelp.height * 0.4,
        kelp.x - sway * 0.5, h - kelp.height * 0.7,
        kelp.x + sway, h - kelp.height
      );
      ctx.stroke();

      // Kelp leaf blades
      ctx.fillStyle = 'rgba(0, 245, 212, 0.12)';
      for (let b = 0.2; b <= 0.8; b += 0.25) {
        const bx = kelp.x + sway * b;
        const by = h - kelp.height * b;
        ctx.beginPath();
        ctx.ellipse(bx + 6, by, 7, 2.5, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // Deep-Sea Anglerfish with Glowing Esca Lure
    const af = this.anglerfish;
    af.glowPhase += 0.04;
    ctx.save();
    ctx.translate(af.x, h - 32);
    ctx.scale(af.scale, af.scale);

    // Body
    ctx.fillStyle = 'rgba(4, 12, 22, 0.7)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 16, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Jaw and teeth
    ctx.strokeStyle = 'rgba(127, 168, 184, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-16, -2);
    ctx.lineTo(-24, 6);
    ctx.lineTo(-12, 10);
    ctx.stroke();

    // Illicium spine curving forward
    ctx.strokeStyle = 'rgba(0, 245, 212, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-4, -14);
    ctx.bezierCurveTo(-8, -32, -32, -32, -34, -20);
    ctx.stroke();

    // Bioluminescent Esca bulb (glowing lure)
    const escaAlpha = 0.6 + Math.sin(af.glowPhase) * 0.35;
    const escaGrad = ctx.createRadialGradient(-34, -20, 1, -34, -20, 12);
    escaGrad.addColorStop(0, `rgba(0, 245, 212, ${escaAlpha})`);
    escaGrad.addColorStop(0.5, `rgba(58, 160, 255, ${escaAlpha * 0.5})`);
    escaGrad.addColorStop(1, 'rgba(0, 245, 212, 0)');

    ctx.fillStyle = escaGrad;
    ctx.beginPath();
    ctx.arc(-34, -20, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawParticles() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Bioluminescent Plankton Embers
    this.plankton.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.y < -10) {
        p.y = h + 10;
        p.x = Math.random() * w;
      }
      if (p.x > w + 10) p.x = -10;
      if (p.x < -10) p.x = w + 10;

      const alpha = p.baseAlpha * (0.65 + 0.35 * Math.sin(this.time * 2 + p.phase));

      ctx.save();
      // Soft radial glow around ember
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
      grad.addColorStop(0, `rgba(${p.hue}, ${alpha})`);
      grad.addColorStop(1, `rgba(${p.hue}, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Micro-bubbles
    this.bubbles.forEach(b => {
      b.y += b.vy;
      b.x += b.vx + Math.sin(this.time + b.y * 0.05) * 0.15;

      if (b.y < -10) {
        b.y = h + 10;
        b.x = Math.random() * w;
      }

      ctx.save();
      ctx.strokeStyle = `rgba(165, 243, 252, ${b.alpha})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.stroke();
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
