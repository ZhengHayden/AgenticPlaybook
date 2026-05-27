/**
 * Client-side access control for static PS playbook hub.
 * Not production security — use SSO / server auth for real deployments.
 */
(function (global) {
  const SESSION_KEY = "ps-playbook-session-v1";

  const USERS = {
    demo: {
      password: "demo2026",
      role: "client",
      label: "Demo User",
      description: "Client-facing CXO materials only",
    },
    warroom: {
      password: "warroom2026",
      role: "warroom",
      label: "Development War Room",
      description: "Internal portfolio and client development",
    },
    architect: {
      password: "architect2026",
      role: "architect",
      label: "Architect",
      description: "Full confidential playbook and library",
    },
  };

  const ROLE_RANK = { client: 1, warroom: 2, architect: 3 };

  const AREAS = {
    cxo: { minRole: "client", label: "CXO Deck" },
    portfolio: { minRole: "warroom", label: "Portfolio Tracking" },
    plan_editor: { minRole: "warroom", label: "Playbook Plan Editor" },
    action_tracker: { minRole: "warroom", label: "Action Tracker" },
    playbook: { minRole: "architect", label: "Playbook & Library" },
  };

  function getSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw);
      if (session.expires && Date.now() > session.expires) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  function login(username, password) {
    const key = (username || "").trim().toLowerCase();
    const user = USERS[key];
    if (!user || user.password !== password) return { ok: false, error: "Invalid username or password." };
    const session = {
      username: key,
      role: user.role,
      label: user.label,
      loginAt: Date.now(),
      expires: Date.now() + 8 * 60 * 60 * 1000,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true, session };
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function hasAccess(area) {
    const session = getSession();
    if (!session) return false;
    const need = AREAS[area]?.minRole;
    if (!need) return false;
    return ROLE_RANK[session.role] >= ROLE_RANK[need];
  }

  function requireAccess(area, loginPath) {
    const base = loginPath || "./login.html";
    const session = getSession();
    if (!session) {
      const next = encodeURIComponent(global.location.pathname.split("/").pop() + global.location.search);
      global.location.href = `${base}?next=${next}`;
      return null;
    }
    if (!hasAccess(area)) {
      global.location.href = `./dashboard.html?denied=${area}`;
      return null;
    }
    return session;
  }

  function requireLogin(loginPath) {
    const session = getSession();
    if (!session) {
      global.location.href = loginPath || "./login.html";
      return null;
    }
    return session;
  }

  function renderUserBadge(containerId) {
    const el = document.getElementById(containerId);
    const session = getSession();
    if (!el || !session) return;
    el.innerHTML = `
      <span class="ps-session-wrap">
        <span class="ps-session-label">${session.label}</span>
        <button type="button" data-auth-logout class="ps-session-logout">Sign out</button>
      </span>`;
    el.querySelector("[data-auth-logout]")?.addEventListener("click", () => {
      logout();
      global.location.href = "./login.html";
    });
  }

  global.PSAuth = {
    USERS,
    AREAS,
    getSession,
    login,
    logout,
    hasAccess,
    requireAccess,
    requireLogin,
    renderUserBadge,
    isClient: () => getSession()?.role === "client",
    isWarroom: () => ROLE_RANK[getSession()?.role || ""] >= ROLE_RANK.warroom,
    isArchitect: () => getSession()?.role === "architect",
  };
})(window);
