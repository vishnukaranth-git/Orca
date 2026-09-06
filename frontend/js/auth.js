/**
 * ORCA Authentication & Mission Clearance Manager
 * Provides tactical access, officer sign-in, station registration,
 * session storage, and workspace orchestration.
 */

class OrcaAuth {
  constructor() {
    this.currentUser = null;
    this.token = null;
    this.selectedRole = 'fishery';
    this.apiBase = window.location.port === '3000' ? 'http://localhost:8000' : '';
    this.loadLocalSession();
  }

  init() {
    this.bindModalEvents();
    this.updateUserUI();
    if (this.currentUser) {
      this.syncUserChatHistory();
    }
  }

  loadLocalSession() {
    try {
      const savedUser = localStorage.getItem('orca_user');
      const savedToken = localStorage.getItem('orca_token');
      if (savedUser && savedToken) {
        this.currentUser = JSON.parse(savedUser);
        this.token = savedToken;
      }
    } catch (e) {
      console.warn('Failed to parse saved auth session', e);
    }
  }

  saveSession(user, token) {
    this.currentUser = user;
    this.token = token;
    localStorage.setItem('orca_user', JSON.stringify(user));
    localStorage.setItem('orca_token', token);
    this.updateUserUI();
    this.syncUserChatHistory();
  }

  logout() {
    this.currentUser = null;
    this.token = null;
    localStorage.removeItem('orca_user');
    localStorage.removeItem('orca_token');
    this.updateUserUI();
    
    // Clear recent queries sidebar list
    const historyList = document.getElementById('ask-orca-history-list');
    if (historyList) {
      historyList.innerHTML = '';
    }

    if (window.orcaAIAssistant) {
      window.orcaAIAssistant.startNewChat();
    }

    // Smoothly transition back to landing page hero section
    if (window.orcaApp) {
      window.orcaApp.switchView('landing');
    }
  }

  selectRole(role, btnEl) {
    this.selectedRole = role;
    document.querySelectorAll('.tactical-role-card').forEach(card => card.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
  }

  launchTacticalWorkspace() {
    this.closeModal();
    if (window.orcaApp) {
      window.orcaApp.switchView('ask-orca');
    }

    // Contextual prompt starter based on selected operational role
    setTimeout(() => {
      const input = document.getElementById('ai-query-input');
      if (input) {
        input.focus();
        if (!input.value.trim()) {
          const suggestions = {
            fishery: 'What are the current Potential Fishing Zones (PFZ) and SST gradients off the coast?',
            navigation: 'Is sea condition and wave height safe for navigation tomorrow morning?',
            research: 'Analyze hydrodynamic anomalies and chlorophyll-a trends in the Arabian Sea.',
            disaster: 'Check active cyclone tracks, storm surge alerts, and high-wave advisories.'
          };
          if (suggestions[this.selectedRole]) {
            input.placeholder = suggestions[this.selectedRole];
          }
        }
      }
    }, 250);
  }

  bindModalEvents() {
    const backdrop = document.getElementById('orca-auth-modal-backdrop');
    const closeBtn = document.getElementById('btn-close-auth-modal');
    const tabLogin = document.getElementById('auth-tab-login');
    const tabSignup = document.getElementById('auth-tab-signup');
    const formLogin = document.getElementById('auth-form-login');
    const formSignup = document.getElementById('auth-form-signup');
    const errorEl = document.getElementById('auth-modal-error');

    if (closeBtn && backdrop) {
      closeBtn.addEventListener('click', () => this.closeModal());
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) this.closeModal();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && backdrop.style.display === 'flex') {
          this.closeModal();
        }
      });
    }

    const switchTab = (activeTab, activeForm, inactiveTab, inactiveForm) => {
      if (activeTab) activeTab.classList.add('active');
      if (inactiveTab) inactiveTab.classList.remove('active');
      if (activeForm) activeForm.style.display = 'flex';
      if (inactiveForm) inactiveForm.style.display = 'none';
      if (errorEl) errorEl.style.display = 'none';
    };

    if (tabSignup && formSignup && tabLogin && formLogin) {
      tabSignup.addEventListener('click', () => {
        switchTab(tabSignup, formSignup, tabLogin, formLogin);
      });

      tabLogin.addEventListener('click', () => {
        switchTab(tabLogin, formLogin, tabSignup, formSignup);
      });
    }

    // Submit Login
    if (formLogin) {
      formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();
        await this.handleLogin(email, password);
      });
    }

    // Submit Signup
    if (formSignup) {
      formSignup.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value.trim();
        await this.handleSignup(name, email, password);
      });
    }

    // General auth button triggers
    document.querySelectorAll('.btn-trigger-auth').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.currentUser) {
          if (confirm(`Operational Officer: ${this.currentUser.email}. Do you want to sign out?`)) {
            this.logout();
          }
        } else {
          this.openAccessPortal(btn.dataset.mode || 'signup');
        }
      });
    });
  }

  openAccessPortal(mode = 'signup') {
    const backdrop = document.getElementById('orca-auth-modal-backdrop');
    const tabLogin = document.getElementById('auth-tab-login');
    const tabSignup = document.getElementById('auth-tab-signup');
    const formLogin = document.getElementById('auth-form-login');
    const formSignup = document.getElementById('auth-form-signup');
    const errorEl = document.getElementById('auth-modal-error');

    if (errorEl) errorEl.style.display = 'none';

    if (mode === 'login') {
      if (tabLogin) tabLogin.click();
    } else {
      if (tabSignup) tabSignup.click();
    }

    if (backdrop) backdrop.style.display = 'flex';
    if (window.lucide) lucide.createIcons();
  }

  openModal(mode = 'signup') {
    this.openAccessPortal(mode);
  }

  closeModal() {
    const backdrop = document.getElementById('orca-auth-modal-backdrop');
    if (backdrop) backdrop.style.display = 'none';
  }

  showError(msg) {
    const errorEl = document.getElementById('auth-modal-error');
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
    }
  }

  async handleSignup(name, email, password) {
    if (!password || password.length < 4) {
      this.showError('Password must be at least 4 characters.');
      return;
    }

    try {
      const resp = await fetch(`${this.apiBase}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const res = await resp.json();
      if (!resp.ok || !res.data) {
        const errMsg = (res.errors && res.errors[0]?.message) || 'Account registration failed';
        throw new Error(errMsg);
      }

      // Reset form
      const formSignup = document.getElementById('auth-form-signup');
      if (formSignup) formSignup.reset();

      this.saveSession(res.data.user, res.data.token);
      this.closeModal();
      if (window.orcaApp) {
        window.orcaApp.switchView('ask-orca');
      }
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('already exists')) {
        const loginEmail = document.getElementById('login-email');
        if (loginEmail) loginEmail.value = email;
        this.showError(`${err.message} You can click "Sign In" above to log into this account.`);
      } else {
        this.showError(err.message);
      }
    }
  }

  async handleLogin(email, password) {
    try {
      const resp = await fetch(`${this.apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const res = await resp.json();
      if (!resp.ok || !res.data) {
        throw new Error((res.errors && res.errors[0]?.message) || 'Sign in failed. Check your email and password.');
      }

      // Reset form
      const formLogin = document.getElementById('auth-form-login');
      if (formLogin) formLogin.reset();

      this.saveSession(res.data.user, res.data.token);
      this.closeModal();
      if (window.orcaApp) {
        window.orcaApp.switchView('ask-orca');
      }
    } catch (err) {
      this.showError(err.message);
    }
  }

  updateUserUI() {
    const userCard = document.getElementById('sidebar-user-card');
    if (userCard) {
      if (this.currentUser) {
        const initial = (this.currentUser.name || this.currentUser.email || 'O')[0].toUpperCase();
        const displayName = this.currentUser.name || this.currentUser.email.split('@')[0];
        userCard.innerHTML = `
          <div class="sidebar-user-info-wrap">
            <div class="sidebar-user-info">
              <div class="sidebar-user-avatar">${initial}</div>
              <div class="sidebar-user-details">
                <span class="sidebar-user-name" title="${this.currentUser.email}">${displayName}</span>
                <span class="sidebar-user-role">Officer · Active</span>
              </div>
            </div>
            <button class="sidebar-logout-btn" id="btn-sidebar-logout" title="Sign Out / Logout">
              <i data-lucide="log-out"></i>
            </button>
          </div>
        `;
        const logoutBtn = userCard.querySelector('#btn-sidebar-logout');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Operational Officer: ${displayName} (${this.currentUser.email}).\nDo you want to sign out?`)) {
              this.logout();
            }
          });
        }
      } else {
        userCard.innerHTML = `
          <button class="sidebar-signin-btn" onclick="orcaAuth.openAccessPortal('login')">
            <i data-lucide="log-in"></i>
            <span>Sign In / Register</span>
          </button>
        `;
      }
    }

    const userBadges = document.querySelectorAll('.auth-user-badge');
    userBadges.forEach(badge => {
      if (this.currentUser) {
        badge.innerHTML = `
          <div class="user-avatar-circle">${(this.currentUser.name || this.currentUser.email)[0].toUpperCase()}</div>
          <span class="user-display-name">${this.currentUser.name || this.currentUser.email}</span>
        `;
        badge.title = `Officer: ${this.currentUser.email} (Click to Sign Out)`;
        badge.classList.add('logged-in');
      } else {
        badge.innerHTML = `
          <i data-lucide="shield" style="width:13px;height:13px;"></i>
          <span>Clearance</span>
        `;
        badge.title = 'Access ORCA Intelligence Portal';
        badge.classList.remove('logged-in');
      }
    });

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  async syncUserChatHistory() {
    if (!this.currentUser) return;
    try {
      const resp = await fetch(`${this.apiBase}/api/chat/history?user_id=${encodeURIComponent(this.currentUser.id)}`);
      if (resp.ok) {
        const json = await resp.json();
        const history = json.data?.history || [];
        if (history.length > 0 && window.orcaAIAssistant) {
          const list = document.getElementById('ask-orca-history-list');
          if (list) list.innerHTML = '';
          history.forEach(item => {
            if (item.query && item.data) {
              window.orcaAIAssistant.addHistorySidebarItem(item.query, item.data);
            }
          });
        }
      }
    } catch (e) {
      console.warn('Failed to load user chat history', e);
    }
  }

  async persistUserChat(queryText, reportData) {
    if (!this.currentUser) return;
    try {
      await fetch(`${this.apiBase}/api/chat/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: this.currentUser.id,
          query: queryText,
          data: reportData
        })
      });
    } catch (e) {
      console.warn('Failed to persist chat message', e);
    }
  }
}

window.orcaAuth = new OrcaAuth();

