/**
 * ORCA Collaborative Agent Network Controller
 * Manages autonomous agent telemetry, state machine, and real-time collaborative reasoning stream.
 */

class OrcaAgentNetwork {
  constructor() {
    this.agents = [
      {
        id: 'ocean',
        name: 'Ocean Agent',
        role: 'Physical Oceanography & Waves',
        icon: 'waves',
        status: 'ACTIVE',
        metric: 'SST 28.4°C · Swell 1.2m',
        color: '#16d9ff'
      },
      {
        id: 'weather',
        name: 'Weather Agent',
        role: 'Atmospheric & Surface Winds',
        icon: 'cloud-rain',
        status: 'ACTIVE',
        metric: 'Wind 18 km/h · Fair',
        color: '#28f0d0'
      },
      {
        id: 'pfz',
        name: 'PFZ Agent',
        role: 'Fish Habitat & Chlorophyll',
        icon: 'fish',
        status: 'ACTIVE',
        metric: 'Chl-a 2.4 mg/m³ · 4 Hotspots',
        color: '#087ea4'
      },
      {
        id: 'satellite',
        name: 'Satellite Agent',
        role: 'Sentinel & SAR Multispectral',
        icon: 'radio',
        status: 'MONITORING',
        metric: 'SAR pass 04:12 UTC',
        color: '#ffd166'
      },
      {
        id: 'geospatial',
        name: 'Geospatial Agent',
        role: 'Bathymetry & Navigation Boundaries',
        icon: 'compass',
        status: 'ACTIVE',
        metric: 'Depth Sounding -42m',
        color: '#16d9ff'
      },
      {
        id: 'risk',
        name: 'Risk Agent',
        role: 'Multi-Factor Hazard Scorer',
        icon: 'shield-alert',
        status: 'ANALYZING',
        metric: 'Risk: MODERATE (38/100)',
        color: '#ff7b25'
      },
      {
        id: 'disaster',
        name: 'Disaster Agent',
        role: 'INCOIS / IMD / NOAA Alerts',
        icon: 'alert-triangle',
        status: 'MONITORING',
        metric: '1 Coastal Advisory active',
        color: '#ff3366'
      }
    ];

    this.logs = [
      { time: '16:02:10', agent: 'Ocean Agent', text: 'Telemetry ingest: SST 28.4°C, wave period 7.8s.' },
      { time: '16:02:14', agent: 'PFZ Agent', text: 'Detected thermal gradient front at 12.98°N, 74.52°E.' },
      { time: '16:02:19', agent: 'Weather Agent', text: 'Wind gust forecast steady at 18-22 km/h westerly.' },
      { time: '16:02:25', agent: 'Risk Agent', text: 'Synthesizing evidence: Zone Alpha safety score rated 94.' },
      { time: '16:02:31', agent: 'Disaster Agent', text: 'No active tsunami alerts; coastal surge watch active in shallow bays.' }
    ];

    this.timer = null;
  }

  init() {
    this.renderAgentCards();
    this.renderLogs();
    this.startLiveSimulation();
  }

  renderAgentCards() {
    const container = document.getElementById('agent-network-list');
    if (!container) return;

    container.innerHTML = this.agents.map(agent => `
      <div class="agent-node-row" data-agent-id="${agent.id}" onclick="orcaApp.inspectAgent('${agent.id}')" style="cursor:pointer;">
        <div class="agent-round-icon" style="border-color:${agent.color}">
          <i data-lucide="${agent.icon}"></i>
        </div>
        <div class="agent-info-col">
          <div class="agent-name-title">${agent.name}</div>
          <div class="agent-badge-tag ${agent.status.toLowerCase()}">${agent.status}</div>
          <div class="agent-sub-detail">${agent.metric}</div>
        </div>
      </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
  }

  renderLogs() {
    const feed = document.getElementById('agent-collab-feed');
    if (!feed) return;

    feed.innerHTML = this.logs.slice(-6).map(log => `
      <div class="collab-log-entry">
        <span class="time">[${log.time}]</span>
        <span class="agent-tag">${log.agent}:</span>
        <span>${log.text}</span>
      </div>
    `).join('');

    feed.scrollTop = feed.scrollHeight;
  }

  addLog(agentName, text) {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    this.logs.push({ time: timeStr, agent: agentName, text });
    this.renderLogs();
  }

  startLiveSimulation() {
    const simulatedEvents = [
      { agent: 'Ocean Agent', text: 'Current velocity adjusted to 0.8 knots south-southwest.' },
      { agent: 'Satellite Agent', text: 'MODIS chlorophyll-a composite imagery processed.' },
      { agent: 'Risk Agent', text: 'Evaluating wave resonance against 32ft fishing vessel dynamics.' },
      { agent: 'PFZ Agent', text: 'Chlorophyll bloom expansion verified in Zone Beta.' },
      { agent: 'Weather Agent', text: 'Barometric pressure holding steady at 1012.4 hPa.' }
    ];

    let idx = 0;
    setInterval(() => {
      const event = simulatedEvents[idx % simulatedEvents.length];
      this.addLog(event.agent, event.text);
      
      // Briefly animate agent card
      const targetAgent = this.agents.find(a => a.name === event.agent);
      if (targetAgent) {
        targetAgent.status = 'ANALYZING';
        this.renderAgentCards();
        setTimeout(() => {
          targetAgent.status = 'ACTIVE';
          this.renderAgentCards();
        }, 3000);
      }
      idx++;
    }, 9000);
  }
}

window.OrcaAgentNetwork = OrcaAgentNetwork;
