/**
 * ORCA Realistic Split-Level Ocean Background Canvas
 * Top horizon shows realistic vessels under sky, bottom 75% shows crystal underwater marine environment
 * with coral reef seabed, sunlight caustics, swimming fish schools, and distant manta ray.
 */

class UnderwaterBackgroundFX {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    this.time = 0;
    this.waterlineY = 160; // Split level surface horizon

    this.fishSchools = [];
    this.manta = { x: this.width * 0.55, y: 320, speedX: 0.18, phase: 0 };

    this.init();
    this.bindEvents();
    this.animate();
  }

  init() {
    this.resize();
    this.initFish();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.waterlineY = Math.max(120, this.height * 0.2);
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());
  }

  initFish() {
    this.fishSchools = [
      { x: this.width * 0.25, y: this.waterlineY + 120, count: 18, speedX: 0.35, size: 3.5, color: '#38bdf8' },
      { x: this.width * 0.65, y: this.waterlineY + 280, count: 12, speedX: -0.25, size: 4, color: '#2dd4bf' },
      { x: this.width * 0.40, y: this.waterlineY + 380, count: 15, speedX: 0.22, size: 3.2, color: '#e0f2fe' }
    ];
  }

  drawSkyAndSurface() {
    const ctx = this.ctx;
    const w = this.width;
    const wy = this.waterlineY;

    // 1. Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, wy);
    skyGrad.addColorStop(0, '#5891ba');
    skyGrad.addColorStop(0.65, '#90b9d6');
    skyGrad.addColorStop(1, '#c2dcf0');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, wy);

    // Distant mountain haze on left horizon
    ctx.fillStyle = 'rgba(70, 110, 140, 0.35)';
    ctx.beginPath();
    ctx.moveTo(0, wy);
    ctx.lineTo(0, wy - 35);
    ctx.bezierCurveTo(w * 0.08, wy - 55, w * 0.18, wy - 25, w * 0.3, wy);
    ctx.closePath();
    ctx.fill();

    // 2. Surface Water Line & Waves
    const surfaceGrad = ctx.createLinearGradient(0, wy - 30, 0, wy + 20);
    surfaceGrad.addColorStop(0, '#1a5f8e');
    surfaceGrad.addColorStop(1, '#0d4268');
    ctx.fillStyle = surfaceGrad;
    ctx.fillRect(0, wy - 25, w, 35);

    // 3. Ships on Surface Horizon
    this.drawSurfaceShips(ctx, wy);
  }

  drawSurfaceShips(ctx, wy) {
    ctx.save();

    // A. Fishing Boat (Left)
    const fbX = this.width * 0.22;
    const fbY = wy - 6;
    ctx.fillStyle = '#1e3448';
    ctx.beginPath();
    ctx.moveTo(fbX - 35, fbY);
    ctx.lineTo(fbX + 45, fbY);
    ctx.lineTo(fbX + 55, fbY - 14);
    ctx.lineTo(fbX - 28, fbY - 12);
    ctx.closePath();
    ctx.fill();
    // Cabin & Fishing Mast Rigging
    ctx.fillRect(fbX - 10, fbY - 26, 22, 14);
    ctx.strokeStyle = '#2a4760';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(fbX + 15, fbY - 12);
    ctx.lineTo(fbX + 15, fbY - 42); // Mast
    ctx.lineTo(fbX - 25, fbY - 12); // Rigging stay
    ctx.moveTo(fbX + 15, fbY - 38);
    ctx.lineTo(fbX + 45, fbY - 12);
    ctx.stroke();

    // B. Cargo Tanker (Center)
    const tgX = this.width * 0.44;
    const tgY = wy - 10;
    ctx.fillStyle = '#162836';
    ctx.beginPath();
    ctx.moveTo(tgX - 60, tgY);
    ctx.lineTo(tgX + 60, tgY);
    ctx.lineTo(tgX + 68, tgY - 12);
    ctx.lineTo(tgX - 52, tgY - 12);
    ctx.closePath();
    ctx.fill();
    // Cargo Deck cranes & aft bridge
    ctx.fillRect(tgX - 45, tgY - 28, 18, 16);
    ctx.fillRect(tgX + 25, tgY - 18, 4, 6);
    ctx.fillRect(tgX - 5, tgY - 18, 4, 6);

    // C. White Luxury Cruise Liner (Right)
    const crX = this.width * 0.72;
    const crY = wy - 8;
    ctx.fillStyle = '#e2edf6';
    ctx.beginPath();
    ctx.moveTo(crX - 85, crY);
    ctx.lineTo(crX + 95, crY);
    ctx.lineTo(crX + 110, crY - 24);
    ctx.lineTo(crX - 70, crY - 22);
    ctx.closePath();
    ctx.fill();
    // Multi-tier decks
    ctx.fillStyle = '#c7dceb';
    ctx.fillRect(crX - 55, crY - 36, 120, 14);
    ctx.fillStyle = '#9cbcd3';
    ctx.fillRect(crX - 35, crY - 46, 80, 10);
    // Dark Funnel
    ctx.fillStyle = '#1b3a52';
    ctx.fillRect(crX + 5, crY - 56, 16, 12);

    // D. Small Sailboat (Far Right)
    const sbX = this.width * 0.88;
    const sbY = wy - 8;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(sbX, sbY - 34);
    ctx.lineTo(sbX + 12, sbY - 4);
    ctx.lineTo(sbX, sbY - 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#1e3448';
    ctx.fillRect(sbX - 6, sbY - 4, 20, 4);

    ctx.restore();
  }

  drawUnderwaterEnvironment() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const wy = this.waterlineY;

    // 1. Deep Crystal Turquoise & Ocean Blue Gradient
    const waterGrad = ctx.createLinearGradient(0, wy, 0, h);
    waterGrad.addColorStop(0, '#0a4e75');     // Sunlit turquoise surface
    waterGrad.addColorStop(0.35, '#073352');  // Mid-depth marine
    waterGrad.addColorStop(0.75, '#052238');  // Deep reef slope
    waterGrad.addColorStop(1, '#02101c');     // Abyss
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, wy, w, h - wy);

    // 2. Sunlight Volumetric Rays
    ctx.save();
    const rayCount = 6;
    for (let i = 0; i < rayCount; i++) {
      const startX = w * (0.2 + i * 0.12) + Math.sin(this.time * 0.0006 + i) * 20;
      const angle = 0.25 + Math.sin(this.time * 0.0005 + i) * 0.05;
      const rayLength = (h - wy) * 0.9;
      
      const rGrad = ctx.createLinearGradient(startX, wy, startX + 150, wy + rayLength);
      rGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      rGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.06)');
      rGrad.addColorStop(1, 'rgba(10, 78, 117, 0)');

      ctx.fillStyle = rGrad;
      ctx.beginPath();
      ctx.moveTo(startX - 20, wy);
      ctx.lineTo(startX + 80, wy);
      ctx.lineTo(startX + 280, wy + rayLength);
      ctx.lineTo(startX + 140, wy + rayLength);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 3. Realistic Coral Reef Seabed on Left, Bottom, and Right
    this.drawCoralReef(ctx, w, h);

    // 4. Distant Manta Ray
    this.drawManta(ctx);

    // 5. Swimming Schools of Fish
    this.drawFishSchools(ctx);
  }

  drawCoralReef(ctx, w, h) {
    ctx.save();

    // Left Coral Seabed Mound
    ctx.fillStyle = '#081c28';
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h - 220);
    ctx.bezierCurveTo(w * 0.08, h - 180, w * 0.14, h - 120, w * 0.22, h - 90);
    ctx.bezierCurveTo(w * 0.35, h - 60, w * 0.45, h - 30, w * 0.55, h);
    ctx.closePath();
    ctx.fill();

    // Right Coral Seabed Wall (Karnataka Coast Shelf)
    ctx.fillStyle = '#071822';
    ctx.beginPath();
    ctx.moveTo(w, h);
    ctx.lineTo(w, this.waterlineY + 40);
    ctx.bezierCurveTo(w * 0.88, this.waterlineY + 120, w * 0.82, h - 220, w * 0.76, h - 160);
    ctx.bezierCurveTo(w * 0.70, h - 90, w * 0.62, h - 40, w * 0.52, h);
    ctx.closePath();
    ctx.fill();

    // Texturing on Reefs (subtle organic coral polyps & sea fans)
    ctx.fillStyle = 'rgba(34, 80, 100, 0.4)';
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(w * (0.05 + i * 0.03), h - 120 + (i * 10), 14, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawManta(ctx) {
    this.manta.x += this.manta.speedX;
    if (this.manta.x > this.width + 100) this.manta.x = -100;
    this.manta.phase += 0.02;

    const mx = this.manta.x;
    const my = this.manta.y;
    const wingFlap = Math.sin(this.manta.phase) * 6;

    ctx.save();
    ctx.translate(mx, my);
    ctx.fillStyle = 'rgba(6, 32, 50, 0.38)';

    // Manta Ray silhouette
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.bezierCurveTo(20, -10 + wingFlap, 45, -4 + wingFlap, 55, 6);
    ctx.bezierCurveTo(35, 12, 15, 10, 0, 16);
    ctx.bezierCurveTo(-15, 10, -35, 12, -55, 6);
    ctx.bezierCurveTo(-45, -4 + wingFlap, -20, -10 + wingFlap, 0, -6);
    ctx.closePath();
    ctx.fill();

    // Tail
    ctx.beginPath();
    ctx.moveTo(0, 16);
    ctx.lineTo(Math.sin(this.manta.phase) * 3, 52);
    ctx.strokeStyle = 'rgba(6, 32, 50, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  drawFishSchools(ctx) {
    ctx.save();
    for (let school of this.fishSchools) {
      school.x += school.speedX;
      if (school.x > this.width + 100) school.x = -100;
      if (school.x < -100) school.x = this.width + 100;

      ctx.fillStyle = school.color;
      ctx.globalAlpha = 0.55;

      for (let i = 0; i < school.count; i++) {
        const fx = school.x + Math.sin(this.time * 0.002 + i) * 22 + (i * 12);
        const fy = school.y + Math.cos(this.time * 0.002 + i) * 10 + (i * 5);
        
        ctx.beginPath();
        ctx.ellipse(fx, fy, school.size, school.size * 0.35, (school.speedX > 0 ? 0.08 : -0.08), 0, Math.PI * 2);
        ctx.fill();

        // Tiny caudal fin
        ctx.beginPath();
        const tailDir = school.speedX > 0 ? -school.size : school.size;
        ctx.moveTo(fx + tailDir, fy);
        ctx.lineTo(fx + tailDir * 1.5, fy - 2);
        ctx.lineTo(fx + tailDir * 1.5, fy + 2);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  }

  animate() {
    this.time += 16;
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.drawSkyAndSurface();
    this.drawUnderwaterEnvironment();

    requestAnimationFrame(() => this.animate());
  }
}

window.UnderwaterBackgroundFX = UnderwaterBackgroundFX;
