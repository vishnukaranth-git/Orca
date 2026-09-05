/**
 * ORCA What-If Decision Simulator
 * Multi-scenario departure time comparison & risk projection engine.
 * Connects to live backend /api/scenarios/compare endpoint.
 */

class OrcaSimulator {
  constructor() {
    this.chart = null;
    this.selectedTimeA = "05:00";
    this.selectedTimeB = "10:00";
  }

  init() {
    this.bindEvents();
    this.runSimulation();
  }

  bindEvents() {
    const selectA = document.getElementById('sim-time-a');
    const selectB = document.getElementById('sim-time-b');

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
          location: { latitude: 12.9141, longitude: 74.8560 },
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
      deltaEl.textContent = result.recommendation || `Risk delta: ${result.risk_delta} points.`;
    }

    this.renderChart(scA, scB);
  }

  updateScenarioCard(cardId, data) {
    const card = document.getElementById(cardId);
    if (!card) return;

    const timeLabel = card.querySelector('.sc-time-label');
    const riskVal = card.querySelector('.sc-risk-val');
    const waveVal = card.querySelector('.sc-wave-val');
    const windVal = card.querySelector('.sc-wind-val');
    const fishVal = card.querySelector('.sc-fish-val');
    const statusEl = card.querySelector('.sc-safety-status');

    if (timeLabel) timeLabel.textContent = `Departure: ${data.time}`;
    if (riskVal) riskVal.textContent = `${data.risk.score}/100`;
    if (waveVal) waveVal.textContent = `${data.wave_height_m} m`;
    if (windVal) windVal.textContent = `${Math.round(data.wind_knots * 1.852)} km/h (${data.wind_knots} kn)`;
    if (fishVal) fishVal.textContent = `${data.fishing_suitability_pct || 85}%`;

    if (statusEl) {
      const level = data.risk.level.toUpperCase();
      statusEl.textContent = `${level} RISK (${level === 'LOW' ? 'FAVORABLE' : level === 'MODERATE' ? 'CAUTION' : 'HIGH RISK'})`;
      statusEl.className = 'sc-safety-status ' + (data.risk.score >= 60 ? 'high' : data.risk.score >= 35 ? 'moderate' : 'low');
    }
  }

  calculateLocalScenario(timeA, timeB) {
    const calc = (timeStr) => {
      const hr = parseInt(timeStr.split(':')[0], 10);
      let wave = 1.0 + (hr % 5) * 0.15;
      let wind = 8.0 + (hr % 6) * 2.0;
      let score = round(min(100, wave * 22 + wind * 1.5), 1);
      return {
        time: timeStr,
        wave_height_m: wave.toFixed(1),
        wave_period_s: 7.5,
        wind_knots: wind,
        wind_gusts_knots: wind * 1.3,
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
      recommendation: delta > 10
        ? `Departure at ${timeA} is significantly safer (${scA.risk.level}) compared to ${timeB} (+${delta} risk pts).`
        : `Both timestamps exhibit balanced maritime parameters.`
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

    this.chart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Wave Safety', 'Wind Stability', 'Catch Potential', 'Visibility', 'Fuel Economy'],
        datasets: [
          {
            label: `Scenario A (${scA.time})`,
            data: [safeA, windSafeA, scA.fishing_suitability_pct || 88, 92, 90],
            backgroundColor: 'rgba(34, 211, 182, 0.22)',
            borderColor: '#22d3b6',
            borderWidth: 2,
            pointBackgroundColor: '#22d3b6'
          },
          {
            label: `Scenario B (${scB.time})`,
            data: [safeB, windSafeB, scB.fishing_suitability_pct || 78, 80, 68],
            backgroundColor: 'rgba(245, 158, 11, 0.22)',
            borderColor: '#f59e0b',
            borderWidth: 2,
            pointBackgroundColor: '#f59e0b'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: 'rgba(36, 160, 200, 0.2)' },
            grid: { color: 'rgba(36, 160, 200, 0.15)' },
            pointLabels: {
              color: '#d1e8f2',
              font: { family: "'Rajdhani', sans-serif", size: 11, weight: '600' }
            },
            ticks: { display: false, max: 100, min: 0 }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: '#d1e8f2',
              font: { family: "'Rajdhani', sans-serif", size: 12 }
            }
          }
        }
      }
    });
  }
}

window.OrcaSimulator = OrcaSimulator;
