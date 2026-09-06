/**
 * ORCA What-If Decision Simulator
 * Multi-scenario departure time comparison & risk projection engine.
 * Connects to live backend /api/scenarios/compare endpoint.
 */

class OrcaSimulator {
  constructor() {
    this.chart = null;
    this.selectedLocation = { latitude: 12.9141, longitude: 74.8560 };
    this.selectedTimeA = "05:00";
    this.selectedTimeB = "10:00";
  }

  init() {
    this.bindEvents();
    this.runSimulation();
  }

  bindEvents() {
    const locSelect = document.getElementById('sim-location-select');
    const selectA = document.getElementById('sim-time-a');
    const selectB = document.getElementById('sim-time-b');

    if (locSelect) {
      locSelect.addEventListener('change', (e) => {
        const parts = e.target.value.split(',');
        this.selectedLocation = {
          latitude: parseFloat(parts[0]),
          longitude: parseFloat(parts[1])
        };
        this.runSimulation();
      });
    }

    if (selectA) {
      selectA.addEventListener('change', (e) => {
        this.selectedTimeA = e.target.value;
        this.runSimulation();
      });
    }

    if (selectB) {
      selectB.addEventListener('change', (e) => {
        this.selectedTimeB = e.target.value;
        this.runSimulation();
      });
    }
  }

  getApiBase() {
    return window.location.port === '3000' ? 'http://localhost:8000' : '';
  }

  async runSimulation() {
    let result = null;
    try {
      const resp = await fetch(`${this.getApiBase()}/api/scenarios/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: this.selectedLocation,
          time_a: this.selectedTimeA,
          time_b: this.selectedTimeB
        })
      });
      if (resp.ok) {
        const json = await resp.json();
        result = json.data;
      }
    } catch (e) {
      console.warn("Backend simulator endpoint unavailable, using local calculation.", e);
    }

    if (!result) {
      result = this.calculateLocalScenario(this.selectedTimeA, this.selectedTimeB);
    }

    const scA = result.scenario_a;
    const scB = result.scenario_b;

    this.updateScenarioCard('sc-a', scA);
    this.updateScenarioCard('sc-b', scB);

    const deltaEl = document.getElementById('sim-delta-risk');
    if (deltaEl) {
      deltaEl.textContent = result.recommendation || `Risk variance: ${Math.abs(result.risk_delta)} points.`;
    }

    this.renderComparisonTable(scA, scB);
    this.renderChart(scA, scB);
  }

  updateScenarioCard(cardId, data) {
    const card = document.getElementById(cardId);
    if (!card) return;

    const t = (k) => (window.orcaI18n ? window.orcaI18n.t(k) : k);

    const timeLabel = card.querySelector('.sc-time-label');
    const riskVal = card.querySelector('.sc-risk-val');
    const waveVal = card.querySelector('.sc-wave-val');
    const periodVal = card.querySelector('.sc-period-val');
    const windVal = card.querySelector('.sc-wind-val');
    const gustVal = card.querySelector('.sc-gust-val');
    const fishVal = card.querySelector('.sc-fish-val');
    const fuelVal = card.querySelector('.sc-fuel-val');
    const statusEl = card.querySelector('.sc-safety-status');

    const fuelEfficiency = Math.max(45, Math.round(100 - (data.wave_height_m * 14 + data.wind_knots * 1.5)));

    if (timeLabel) timeLabel.textContent = `${t('sim_departure')} ${data.time}`;
    if (riskVal) riskVal.textContent = `${data.risk.score}/100`;
    if (waveVal) waveVal.textContent = `${data.wave_height_m} m`;
    if (periodVal) periodVal.textContent = `${data.wave_period_s || 7.2} s`;
    if (windVal) windVal.textContent = `${Math.round(data.wind_knots * 1.852)} km/h (${data.wind_knots} kn)`;
    if (gustVal) gustVal.textContent = `${Math.round((data.wind_gusts_knots || data.wind_knots * 1.3) * 1.852)} km/h`;
    if (fishVal) fishVal.textContent = `${data.fishing_suitability_pct || 85}%`;
    if (fuelVal) fuelVal.textContent = `${fuelEfficiency}%`;

    if (statusEl) {
      const level = data.risk.level.toLowerCase();
      statusEl.textContent = level === 'low' ? t('sim_status_low') : level === 'moderate' ? t('sim_status_mod') : t('sim_status_high');
      statusEl.className = 'sc-safety-status ' + (data.risk.score >= 60 ? 'high' : data.risk.score >= 35 ? 'moderate' : 'low');
    }
  }

  renderComparisonTable(scA, scB) {
    const tbody = document.getElementById('sim-comp-tbody');
    if (!tbody) return;

    const t = (k) => (window.orcaI18n ? window.orcaI18n.t(k) : k);

    const fuelA = Math.max(45, Math.round(100 - (scA.wave_height_m * 14 + scA.wind_knots * 1.5)));
    const fuelB = Math.max(45, Math.round(100 - (scB.wave_height_m * 14 + scB.wind_knots * 1.5)));

    const waveDiff = (scB.wave_height_m - scA.wave_height_m).toFixed(2);
    const windDiff = Math.round((scB.wind_knots - scA.wind_knots) * 1.852);
    const riskDiff = Math.round(scB.risk.score - scA.risk.score);
    const fishDiff = Math.round((scA.fishing_suitability_pct || 85) - (scB.fishing_suitability_pct || 80));

    tbody.innerHTML = `
      <tr>
        <td><b>${t('sim_risk_score').replace(':', '')}</b></td>
        <td style="color:#22d3b6;text-align:center;font-family:var(--font-mono);font-weight:700;">${scA.risk.score}/100</td>
        <td style="color:#f59e0b;text-align:center;font-family:var(--font-mono);font-weight:700;">${scB.risk.score}/100</td>
        <td style="text-align:right;font-family:var(--font-mono);color:${riskDiff > 0 ? '#22d3b6' : riskDiff < 0 ? '#f59e0b' : '#94a3b8'};">
          ${riskDiff > 0 ? `✓ Scenario A is ${riskDiff} pts safer` : riskDiff < 0 ? `✓ Scenario B is ${-riskDiff} pts safer` : 'Identical Risk Profile'}
        </td>
      </tr>
      <tr>
        <td><b>${t('sim_wave_swell').replace(':', '')}</b></td>
        <td style="color:#22d3b6;text-align:center;font-family:var(--font-mono);">${scA.wave_height_m} m</td>
        <td style="color:#f59e0b;text-align:center;font-family:var(--font-mono);">${scB.wave_height_m} m</td>
        <td style="text-align:right;font-family:var(--font-mono);color:${waveDiff > 0 ? '#22d3b6' : waveDiff < 0 ? '#f59e0b' : '#94a3b8'};">
          ${waveDiff > 0 ? `✓ Scenario A calmer by ${waveDiff}m` : waveDiff < 0 ? `✓ Scenario B calmer by ${-waveDiff}m` : 'Equal Wave Swell'}
        </td>
      </tr>
      <tr>
        <td><b>${t('sim_surface_wind').replace(':', '')}</b></td>
        <td style="color:#22d3b6;text-align:center;font-family:var(--font-mono);">${Math.round(scA.wind_knots * 1.852)} km/h</td>
        <td style="color:#f59e0b;text-align:center;font-family:var(--font-mono);">${Math.round(scB.wind_knots * 1.852)} km/h</td>
        <td style="text-align:right;font-family:var(--font-mono);color:${windDiff > 0 ? '#22d3b6' : windDiff < 0 ? '#f59e0b' : '#94a3b8'};">
          ${windDiff > 0 ? `✓ Scenario A lighter wind (${windDiff} km/h less)` : windDiff < 0 ? `✓ Scenario B lighter wind` : 'Equal Surface Wind'}
        </td>
      </tr>
      <tr>
        <td><b>${t('sim_catch_potential').replace(':', '')}</b></td>
        <td style="color:#22d3b6;text-align:center;font-family:var(--font-mono);">${scA.fishing_suitability_pct || 85}%</td>
        <td style="color:#f59e0b;text-align:center;font-family:var(--font-mono);">${scB.fishing_suitability_pct || 80}%</td>
        <td style="text-align:right;font-family:var(--font-mono);color:${fishDiff > 0 ? '#22d3b6' : fishDiff < 0 ? '#f59e0b' : '#94a3b8'};">
          ${fishDiff > 0 ? `✓ Scenario A offers +${fishDiff}% higher yield` : fishDiff < 0 ? `✓ Scenario B offers +${-fishDiff}% higher yield` : 'Comparable Catch Window'}
        </td>
      </tr>
      <tr>
        <td><b>${t('sim_fuel_eff').replace(':', '')}</b></td>
        <td style="color:#22d3b6;text-align:center;font-family:var(--font-mono);">${fuelA}%</td>
        <td style="color:#f59e0b;text-align:center;font-family:var(--font-mono);">${fuelB}%</td>
        <td style="text-align:right;font-family:var(--font-mono);color:${fuelA >= fuelB ? '#22d3b6' : '#f59e0b'};">
          ${fuelA > fuelB ? `✓ Scenario A saves ~${fuelA - fuelB}% transit fuel` : fuelB > fuelA ? `✓ Scenario B saves ~${fuelB - fuelA}% transit fuel` : 'Equivalent Fuel Burn'}
        </td>
      </tr>
    `;
  }

  calculateLocalScenario(timeA, timeB) {
    const calc = (timeStr) => {
      const hr = parseInt(timeStr.split(':')[0], 10);
      let wave = 1.0 + (hr % 5) * 0.15;
      let wind = 8.0 + (hr % 6) * 2.0;
      let score = Math.round(Math.min(100, wave * 22 + wind * 1.5));
      return {
        time: timeStr,
        wave_height_m: Number(wave.toFixed(1)),
        wave_period_s: 7.5,
        wind_knots: wind,
        wind_gusts_knots: Number((wind * 1.3).toFixed(1)),
        risk: { score: score, level: score >= 60 ? 'high' : score >= 35 ? 'moderate' : 'low' },
        fishing_suitability_pct: Math.round(100 - score * 0.7)
      };
    };
    const scA = calc(timeA);
    const scB = calc(timeB);
    const delta = scB.risk.score - scA.risk.score;
    return {
      scenario_a: scA,
      scenario_b: scB,
      risk_delta: delta,
      recommendation: delta > 5
        ? `Departure at ${timeA} is recommended: lower wave swell (${scA.wave_height_m}m vs ${scB.wave_height_m}m) and ${delta} points lower risk score.`
        : delta < -5
        ? `Departure at ${timeB} is recommended: lower wave swell (${scB.wave_height_m}m vs ${scA.wave_height_m}m) and ${-delta} points lower risk score.`
        : `Both departure timestamps exhibit comparable maritime navigation conditions.`
    };
  }

  renderChart(scA, scB) {
    const ctx = document.getElementById('sim-chart-canvas');
    if (!ctx || !window.Chart) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const safeA = Math.max(10, 100 - scA.risk.score);
    const safeB = Math.max(10, 100 - scB.risk.score);
    const windSafeA = Math.max(10, 100 - scA.wind_knots * 3.5);
    const windSafeB = Math.max(10, 100 - scB.wind_knots * 3.5);
    const fuelA = Math.max(40, Math.round(100 - (scA.wave_height_m * 14 + scA.wind_knots * 1.5)));
    const fuelB = Math.max(40, Math.round(100 - (scB.wave_height_m * 14 + scB.wind_knots * 1.5)));

    this.chart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Wave Safety', 'Wind Stability', 'Catch Potential', 'Visibility', 'Fuel Economy'],
        datasets: [
          {
            label: `Scenario A (${scA.time})`,
            data: [safeA, windSafeA, scA.fishing_suitability_pct || 88, 92, fuelA],
            backgroundColor: 'rgba(34, 211, 182, 0.22)',
            borderColor: '#22d3b6',
            borderWidth: 2,
            pointBackgroundColor: '#22d3b6',
            pointBorderColor: '#ffffff',
            pointRadius: 4
          },
          {
            label: `Scenario B (${scB.time})`,
            data: [safeB, windSafeB, scB.fishing_suitability_pct || 78, 80, fuelB],
            backgroundColor: 'rgba(245, 158, 11, 0.22)',
            borderColor: '#f59e0b',
            borderWidth: 2,
            pointBackgroundColor: '#f59e0b',
            pointBorderColor: '#ffffff',
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: 'rgba(36, 160, 200, 0.25)' },
            grid: { color: 'rgba(36, 160, 200, 0.18)' },
            pointLabels: {
              color: '#d1e8f2',
              font: { family: "'Valley Sans', 'Inter', sans-serif", size: 11, weight: '600' }
            },
            ticks: { display: false, max: 100, min: 0 }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#ffffff',
              font: { family: "'Valley Sans', 'Inter', sans-serif", size: 12, weight: '600' },
              padding: 12
            }
          }
        }
      }
    });
  }
}

window.OrcaSimulator = OrcaSimulator;

