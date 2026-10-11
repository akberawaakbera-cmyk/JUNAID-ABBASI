(() => {
  "use strict";

  // ============================================
  // JUNAID ABBASI — CONTROL PANEL
  // Complete Responsive Application
  // ============================================

  if (window.__JUNAID_CONTROL_PANEL__) return;
  window.__JUNAID_CONTROL_PANEL__ = true;

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  const STORAGE = {
    controls: "junaidAbbasiControlStates",
    developer: "junaidAbbasiDeveloperSettings",
    logo: "junaidAbbasiCustomLogo",
    settings: "junaidAbbasiPanelSettings",
    theme: "junaidAbbasiTheme",
    logs: "junaidAbbasiActivityLogs"
  };

  const DEFAULT_SETTINGS = {
    panelName: "JUNAID ABBASI",
    panelVersion: "1.0.0",
    theme: "dark"
  };

  const DEFAULT_DEVELOPER = {
    developerMode: false,
    debugLogging: true,
    apiEnvironment: "development"
  };

  // ============================================
  // CONTROL DEFINITIONS
  // ============================================

  const CONTROL_LIST = [
    {
      id: "prefire",
      name: "Pre-Fire",
      icon: "🎯",
      description: "Pre-Fire preference setting.",
      type: "toggle",
      defaultValue: false
    },
    {
      id: "headshot",
      name: "Headshot",
      icon: "🎯",
      description: "Headshot preference setting.",
      type: "toggle",
      defaultValue: false
    },
    {
      id: "esp-line",
      name: "ESP Line",
      icon: "📏",
      description: "ESP line preference setting.",
      type: "toggle",
      defaultValue: false
    },
    {
      id: "esp-head",
      name: "ESP Head",
      icon: "👁️",
      description: "ESP head preference setting.",
      type: "toggle",
      defaultValue: false
    },
    {
      id: "esp-distance",
      name: "ESP Distance",
      icon: "📐",
      description: "Adjust the distance preference.",
      type: "range",
      min: 50,
      max: 500,
      step: 10,
      unit: "m",
      defaultValue: 150
    },
    {
      id: "silent-headshot",
      name: "Silent Headshot",
      icon: "⚡",
      description: "Headshot preference setting.",
      type: "toggle",
      defaultValue: false
    },
    {
      id: "aimbot",
      name: "Aimbot",
      icon: "🎮",
      description: "Aiming preference setting.",
      type: "toggle",
      defaultValue: false
    },
    {
      id: "aim-assist",
      name: "Aim Assist",
      icon: "🕹️",
      description: "Aim assistance preference.",
      type: "toggle",
      defaultValue: false
    },
    {
      id: "vector",
      name: "Vector",
      icon: "〽️",
      description: "Vector preference setting.",
      type: "toggle",
      defaultValue: false
    },
    {
      id: "sensitivity",
      name: "Sensitivity",
      icon: "🎚️",
      description: "Sensitivity preference setting.",
      type: "toggle",
      defaultValue: false
    },
    {
      id: "fov",
      name: "FOV",
      icon: "🔭",
      description: "Field of view preference.",
      type: "toggle",
      defaultValue: false
    },
    {
      id: "headshot-rate",
      name: "Headshot Rate",
      icon: "📊",
      description: "Adjust the percentage preference.",
      type: "range",
      min: 0,
      max: 100,
      step: 1,
      unit: "%",
      defaultValue: 50
    }
  ];

  const TOGGLE_CONTROLS = CONTROL_LIST.filter(
    item => item.type === "toggle"
  );

  const RANGE_CONTROLS = CONTROL_LIST.filter(
    item => item.type === "range"
  );

  // ============================================
  // STATE
  // ============================================

  const APP_STATE = {
    controls: {},
    controlValues: {},
    logs: [],
    developer: { ...DEFAULT_DEVELOPER },
    settings: { ...DEFAULT_SETTINGS }
  };

  CONTROL_LIST.forEach(control => {
    if (control.type === "toggle") {
      APP_STATE.controls[control.id] =
        control.defaultValue;
    } else {
      APP_STATE.controlValues[control.id] =
        control.defaultValue;
    }
  });

  // ============================================
  // STORAGE HELPERS
  // ============================================

  function safeRead(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch {
      return fallback;
    }
  }

  function safeWrite(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn("Unable to save local data.", error);
      return false;
    }
  }

  function safeRemove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  function readJSON(key, fallback) {
    try {
      const value = JSON.parse(
        safeRead(key, JSON.stringify(fallback))
      );

      return value && typeof value === "object"
        ? value
        : fallback;
    } catch {
      return fallback;
    }
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  // ============================================
  // TOAST NOTIFICATIONS
  // ============================================

  let toastTimer = null;

  function showToast(message, type = "success") {
    const container = $("#toastContainer");

    if (!container) {
      console.info(message);
      return;
    }

    let toast = $("#appToast", container);

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "appToast";

      Object.assign(toast.style, {
        position: "relative",
        marginTop: "8px",
        padding: "12px 18px",
        borderRadius: "12px",
        maxWidth: "min(420px, calc(100vw - 32px))",
        fontSize: "13px",
        fontWeight: "700",
        lineHeight: "1.5",
        boxShadow: "0 8px 28px rgba(0,0,0,.25)",
        opacity: "0",
        transform: "translateY(8px)",
        transition: "opacity .2s ease, transform .2s ease",
        overflowWrap: "anywhere"
      });

      container.appendChild(toast);
    }

    const backgrounds = {
      success: "#16845b",
      error: "#c53b48",
      info: "#344b70",
      warning: "#a66b12"
    };

    toast.textContent = message;
    toast.style.background =
      backgrounds[type] || backgrounds.info;
    toast.style.color = "#fff";
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
    }, 2800);
  }

  // ============================================
  // ACTIVITY LOGS
  // ============================================

  function loadLogs() {
    const saved = readJSON(STORAGE.logs, []);

    APP_STATE.logs = Array.isArray(saved)
      ? saved
          .filter(item =>
            item &&
            typeof item.message === "string"
          )
          .slice(0, 100)
      : [];
  }

  function saveLogs() {
    return safeWrite(
      STORAGE.logs,
      JSON.stringify(APP_STATE.logs.slice(0, 100))
    );
  }

  function formatLogTime(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Unknown time";
    }

    return date.toLocaleString();
  }

  function logIcon(type) {
    const icons = {
      success: "✓",
      error: "!",
      warning: "⚠",
      info: "●"
    };

    return icons[type] || "●";
  }

  function createLogItem(log) {
    const item = document.createElement("div");
    item.className = "activity-item";

    const icon = document.createElement("div");
    icon.className = "activity-icon";
    icon.textContent = logIcon(log.type);

    const content = document.createElement("div");
    content.className = "activity-content";

    const title = document.createElement("strong");
    title.textContent = log.message;

    const time = document.createElement("span");
    time.className = "activity-time";
    time.textContent = formatLogTime(log.time);

    content.append(title, time);
    item.append(icon, content);

    return item;
  }

  function renderLogs() {
    const container = $("#logsContainer");
    const recentContainer = $("#recentLogs");

    if (container) {
      container.replaceChildren();

      if (!APP_STATE.logs.length) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "No activity recorded yet.";
        container.appendChild(empty);
      } else {
        APP_STATE.logs.forEach(log => {
          const row = document.createElement("div");
          row.className = "log-item";

          const icon = document.createElement("div");
          icon.className = "log-icon";
          icon.textContent = logIcon(log.type);

          const content = document.createElement("div");
          content.className = "log-content";

          const message = document.createElement("strong");
          message.textContent = log.message;

          const time = document.createElement("span");
          time.className = "log-time";
          time.textContent = formatLogTime(log.time);

          const type = document.createElement("span");
          type.className = "badge";
          type.textContent = String(log.type || "info").toUpperCase();

          content.append(message, time);
          row.append(icon, content, type);
          container.appendChild(row);
        });
      }
    }

    if (recentContainer) {
      recentContainer.replaceChildren();

      const recent = APP_STATE.logs.slice(0, 5);

      if (!recent.length) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "No activity yet.";
        recentContainer.appendChild(empty);
      } else {
        recent.forEach(log => {
          recentContainer.appendChild(createLogItem(log));
        });
      }
    }

    const activityCount = $("#activityCount");

    if (activityCount) {
      activityCount.textContent = String(APP_STATE.logs.length);
    }
  }

  function addLog(message, type = "info") {
    APP_STATE.logs.unshift({
      message: String(message),
      type,
      time: new Date().toISOString()
    });

    APP_STATE.logs = APP_STATE.logs.slice(0, 100);

    saveLogs();
    renderLogs();
    updateControlCounter();
  }

  function clearActivityLogs() {
    APP_STATE.logs = [];
    saveLogs();
    renderLogs();
    updateControlCounter();

    showToast("Activity logs cleared.", "success");
  }

  // ============================================
  // CONTROL STORAGE
  // ============================================

  function clampRangeValue(control, value) {
    const numeric = Number(value);

    if (!Number.isFinite(numeric)) {
      return control.defaultValue;
    }

    const clamped = Math.min(
      control.max,
      Math.max(control.min, numeric)
    );

    const step = control.step || 1;

    const stepped = control.min +
      Math.round((clamped - control.min) / step) * step;

    return Math.min(control.max, Math.max(control.min, stepped));
  }

  function loadControlStates() {
    const saved = readJSON(STORAGE.controls, {});

    const toggles =
      saved.controls && typeof saved.controls === "object"
        ? saved.controls
        : saved;

    const values =
      saved.values && typeof saved.values === "object"
        ? saved.values
        : saved.__values && typeof saved.__values === "object"
          ? saved.__values
          : saved;

    TOGGLE_CONTROLS.forEach(control => {
      if (typeof toggles[control.id] === "boolean") {
        APP_STATE.controls[control.id] = toggles[control.id];
      }
    });

    RANGE_CONTROLS.forEach(control => {
      const value = values[control.id];

      if (
        value !== undefined &&
        value !== null &&
        Number.isFinite(Number(value))
      ) {
        APP_STATE.controlValues[control.id] =
          clampRangeValue(control, value);
      }
    });
  }

  function saveControlStates() {
    return safeWrite(
      STORAGE.controls,
      JSON.stringify({
        controls: APP_STATE.controls,
        values: APP_STATE.controlValues
      })
    );
  }

  // ============================================
  // CONTROL CARDS
  // ============================================

  function createControlCard(control) {
    const card = document.createElement("article");

    card.className = "control-card";
    card.dataset.controlCard = control.id;

    const isRange = control.type === "range";

    const top = document.createElement("div");
    top.className = "control-card-top";

    const info = document.createElement("div");
    info.className = "control-card-info";

    const icon = document.createElement("div");
    icon.className = "control-icon";
    icon.textContent = control.icon;

    const heading = document.createElement("div");
    heading.className = "control-card-heading";

    const title = document.createElement("h3");
    title.textContent = control.name;

    const description = document.createElement("p");
    description.className = "control-description";
    description.textContent = control.description;

    heading.append(title, description);
    info.append(icon, heading);
    top.appendChild(info);

    const badge = document.createElement("span");
    badge.className = "control-state-badge";

    if (isRange) {
      badge.textContent = "SETTING";
    } else {
      badge.dataset.stateBadge = "";

      const enabled = APP_STATE.controls[control.id];

      badge.textContent = enabled ? "ON" : "OFF";
      badge.classList.toggle("active", enabled);
    }

    top.appendChild(badge);
    card.appendChild(top);

    if (isRange) {
      const value = APP_STATE.controlValues[control.id];

      const range = document.createElement("div");
      range.className = "range-control";

      const rangeHeader = document.createElement("div");
      rangeHeader.className = "range-control-header";

      const label = document.createElement("label");
      label.htmlFor = `range-${control.id}`;
      label.textContent = control.name;

      const output = document.createElement("output");
      output.className = "range-value";
      output.dataset.rangeValue = control.id;
      output.textContent = `${value}${control.unit}`;

      rangeHeader.append(label, output);

      const input = document.createElement("input");
      input.type = "range";
      input.id = `range-${control.id}`;
      input.className = "control-range";
      input.dataset.rangeControl = control.id;
      input.min = String(control.min);
      input.max = String(control.max);
      input.step = String(control.step);
      input.value = String(value);
      input.setAttribute("aria-label", control.name);

      const limits = document.createElement("div");
      limits.className = "range-limits";

      const minimum = document.createElement("span");
      minimum.textContent = `${control.min}${control.unit}`;

      const maximum = document.createElement("span");
      maximum.textContent = `${control.max}${control.unit}`;

      limits.append(minimum, maximum);
      range.append(rangeHeader, input, limits);
      card.appendChild(range);
    } else {
      const footer = document.createElement("div");
      footer.className = "control-card-footer";

      const status = document.createElement("span");
      status.className = "control-status";
      status.dataset.statusLabel = "";
      status.textContent =
        APP_STATE.controls[control.id] ? "Enabled" : "Disabled";

      const label = document.createElement("label");
      label.className = "switch";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.dataset.control = control.id;
      checkbox.checked = Boolean(APP_STATE.controls[control.id]);
      checkbox.setAttribute("aria-label", control.name);

      const track = document.createElement("span");
      track.className = "switch-track";

      label.append(checkbox, track);
      footer.append(status, label);
      card.appendChild(footer);
    }

    updateControlCardAppearance(control.id, card);

    return card;
  }

  function renderControls() {
    const container = $("#allControls");

    if (!container) return;

    const fragment = document.createDocumentFragment();

    CONTROL_LIST.forEach(control => {
      fragment.appendChild(createControlCard(control));
    });

    container.replaceChildren(fragment);

    updateControlCounter();
    initializeControlActions();
  }

  function updateControlCardAppearance(id, providedCard) {
    const card = providedCard ||
      $(`[data-control-card="${id}"]`);

    if (!card) return;

    const enabled = Boolean(APP_STATE.controls[id]);

    card.classList.toggle("is-enabled", enabled);

    const badge = $("[data-state-badge]", card);
    const status = $("[data-status-label]", card);
    const checkbox = $("[data-control]", card);

    if (badge) {
      badge.textContent = enabled ? "ON" : "OFF";
      badge.classList.toggle("active", enabled);
    }

    if (status) {
      status.textContent = enabled ? "Enabled" : "Disabled";
    }

    if (checkbox) {
      checkbox.checked = enabled;
    }
  }

  function syncControlInputs() {
    TOGGLE_CONTROLS.forEach(control => {
      updateControlCardAppearance(control.id);
    });

    RANGE_CONTROLS.forEach(control => {
      const input = $(
        `[data-range-control="${control.id}"]`
      );

      const output = $(
        `[data-range-value="${control.id}"]`
      );

      const value = APP_STATE.controlValues[control.id];

      if (input) input.value = String(value);

      if (output) {
        output.textContent = `${value}${control.unit}`;
      }
    });
  }

  function updateControlCounter() {
    const enabled = TOGGLE_CONTROLS.filter(
      control => APP_STATE.controls[control.id]
    ).length;

    const total = CONTROL_LIST.length;
    const toggleTotal = TOGGLE_CONTROLS.length;

    const totalControls = $("#totalControls");
    const controlCount = $("#controlCount");
    const summary = $("#controlsSummary");
    const activityCount = $("#activityCount");

    if (totalControls) {
      totalControls.textContent = String(total);
    }

    if (controlCount) {
      controlCount.textContent = String(enabled);
    }

    if (summary) {
      summary.textContent = `${enabled} / ${toggleTotal} enabled`;
    }

    if (activityCount) {
      activityCount.textContent = String(APP_STATE.logs.length);
    }

    $$("[data-enabled-controls]").forEach(element => {
      element.textContent = String(enabled);
    });
  }

  // ============================================
  // CONTROL ACTIONS: APPLY / IMPORT / EXPORT
  // ============================================

  function applyControlSettings() {
    const saved = saveControlStates();

    syncControlInputs();
    updateControlCounter();

    addLog("Control settings applied.", saved ? "success" : "warning");

    showToast(
      saved
        ? "Settings saved successfully."
        : "Settings applied, but browser storage is unavailable.",
      saved ? "success" : "warning"
    );
  }

  function disableAllControls() {
    TOGGLE_CONTROLS.forEach(control => {
      APP_STATE.controls[control.id] = false;
    });

    saveControlStates();
    syncControlInputs();
    updateControlCounter();

    addLog("All toggle controls disabled.", "warning");
    showToast("All toggle controls disabled.", "success");
  }

  function resetControlSettings() {
    CONTROL_LIST.forEach(control => {
      if (control.type === "toggle") {
        APP_STATE.controls[control.id] = control.defaultValue;
      } else {
        APP_STATE.controlValues[control.id] =
          control.defaultValue;
      }
    });

    saveControlStates();
    syncControlInputs();
    updateControlCounter();

    addLog("Control settings reset to defaults.", "warning");
    showToast("Default settings restored.", "success");
  }

  function exportControlSettings() {
    const payload = {
      panel: "JUNAID ABBASI — CONTROL PANEL",
      version: APP_STATE.settings.panelVersion,
      exportedAt: new Date().toISOString(),
      controls: APP_STATE.controls,
      values: APP_STATE.controlValues
    };

    const blob = new Blob(
      [JSON.stringify(payload, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "junaid-abbasi-settings.json";

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    addLog("Settings exported to JSON.", "success");
    showToast("Settings file exported.", "success");
  }

  async function handleControlImport(event) {
    const input = event.target;
    const file = input.files && input.files[0];

    if (!file) return;

    try {
      if (file.size > 1024 * 1024) {
        throw new Error("The file must be smaller than 1 MB.");
      }

      const content = await file.text();
      const data = JSON.parse(content);

      if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("Invalid settings file.");
      }

      const importedControls =
        data.controls && typeof data.controls === "object"
          ? data.controls
          : data;

      const importedValues =
        data.values && typeof data.values === "object"
          ? data.values
          : data.__values && typeof data.__values === "object"
            ? data.__values
            : data;

      let count = 0;

      TOGGLE_CONTROLS.forEach(control => {
        const value = importedControls[control.id];

        if (typeof value === "boolean") {
          APP_STATE.controls[control.id] = value;
          count++;
        }
      });

      RANGE_CONTROLS.forEach(control => {
        const value = importedValues[control.id];

        if (
          value !== undefined &&
          value !== null &&
          Number.isFinite(Number(value))
        ) {
          APP_STATE.controlValues[control.id] =
            clampRangeValue(control, value);

          count++;
        }
      });

      if (!count) {
        throw new Error("No supported settings were found.");
      }

      saveControlStates();
      syncControlInputs();
      updateControlCounter();

      addLog(`${count} settings imported successfully.`, "success");
      showToast("Settings imported successfully.", "success");
    } catch (error) {
      addLog("Settings import failed.", "error");
      showToast(error.message || "Import failed.", "error");
    } finally {
      input.value = "";
    }
  }

  function initializeControlActions() {
    const container = $("#allControls");

    if (!container || $("#controlActionToolbar")) return;

    const toolbar = document.createElement("section");
    toolbar.id = "controlActionToolbar";
    toolbar.className = "control-actions";

    toolbar.innerHTML = `
      <div class="control-section-note">
        <strong>Control Settings</strong>
        <p>Change your preferences and save them locally.</p>
      </div>

      <div class="control-action-buttons">
        <button type="button"
          class="primary-button"
          id="applyControlSettings">
          Apply Settings
        </button>

        <button type="button"
          class="secondary-button"
          id="importControlSettings">
          Import Settings
        </button>

        <button type="button"
          class="secondary-button"
          id="exportControlSettings">
          Export Settings
        </button>

        <input type="file"
          id="importControlFile"
          class="import-control-input"
          accept=".json,application/json"
          hidden>
      </div>
    `;

    container.insertAdjacentElement("beforebegin", toolbar);

    $("#applyControlSettings", toolbar).addEventListener(
      "click",
      applyControlSettings
    );

    $("#importControlSettings", toolbar).addEventListener(
      "click",
      () => $("#importControlFile", toolbar).click()
    );

    $("#exportControlSettings", toolbar).addEventListener(
      "click",
      exportControlSettings
    );

    $("#importControlFile", toolbar).addEventListener(
      "change",
      handleControlImport
    );
  }

  // ============================================
  // PAGE NAVIGATION
  // ============================================

  const PAGE_INFO = {
    dashboard: {
      title: "Dashboard",
      description: "Your application overview"
    },
    controls: {
      title: "Control Center",
      description: "Manage your control preferences"
    },
    developer: {
      title: "Developer",
      description: "Developer preferences and branding"
    },
    admin: {
      title: "Admin",
      description: "Administration and maintenance"
    },
    logs: {
      title: "Activity Logs",
      description: "Review recent panel activity"
    },
    settings: {
      title: "Settings",
      description: "Personalize your application"
    }
  };

  function navigateToPage(pageName) {
    if (!PAGE_INFO[pageName]) {
      pageName = "dashboard";
    }

    $$(".page").forEach(page => {
      const active = page.id === pageName;

      page.classList.toggle("active", active);
      page.hidden = !active;
    });

    $$("[data-page]").forEach(button => {
      const active = button.dataset.page === pageName;

      button.classList.toggle("active", active);

      if (active) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }
    });

    const info = PAGE_INFO[pageName];
    const title = $("#pageTitle");
    const description = $("#pageDescription");

    if (title) title.textContent = info.title;
    if (description) description.textContent = info.description;

    closeSidebar();

    try {
      history.replaceState(null, "", `#${pageName}`);
    } catch {
      // The page can still work if browser history is unavailable.
    }

    if (pageName === "logs") renderLogs();
    if (pageName === "controls") updateControlCounter();
  }

  function initializeNavigation() {
    $$("[data-page]").forEach(button => {
      button.addEventListener("click", event => {
        event.preventDefault();
        navigateToPage(button.dataset.page);
      });
    });

    $$("[data-go-page]").forEach(button => {
      button.addEventListener("click", event => {
        event.preventDefault();
        navigateToPage(button.dataset.goPage);
      });
    });

    const initialPage = location.hash.replace(/^#/, "");

    navigateToPage(
      PAGE_INFO[initialPage] ? initialPage : "dashboard"
    );
  }

  // ============================================
  // MOBILE SIDEBAR
  // ============================================

  function openSidebar() {
    const sidebar = $("#sidebar");
    const overlay = $("#sidebarOverlay");

    if (sidebar) {
      sidebar.classList.add("open", "is-open");
    }

    if (overlay) {
      overlay.classList.add("active");
      overlay.setAttribute("aria-hidden", "false");
    }

    document.body.classList.add("sidebar-open");
  }

  function closeSidebar() {
    const sidebar = $("#sidebar");
    const overlay = $("#sidebarOverlay");

    if (sidebar) {
      sidebar.classList.remove("open", "is-open");
    }

    if (overlay) {
      overlay.classList.remove("active");
      overlay.setAttribute("aria-hidden", "true");
    }

    document.body.classList.remove("sidebar-open");
  }

  function initializeSidebar() {
    const menuButton = $("#menuButton");
    const closeButton = $("#closeSidebar");
    const overlay = $("#sidebarOverlay");

    if (menuButton) {
      menuButton.addEventListener("click", openSidebar);
    }

    if (closeButton) {
      closeButton.addEventListener("click", closeSidebar);
    }

    if (overlay) {
      overlay.addEventListener("click", closeSidebar);
    }

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeSidebar();
    });
  }

  // ============================================
  // DEVELOPER SETTINGS
  // ============================================

  function loadDeveloperSettings() {
    const saved = readJSON(STORAGE.developer, {});

    APP_STATE.developer = {
      ...DEFAULT_DEVELOPER,
      ...saved
    };
  }

  function initializeDeveloperSettings() {
    const developerMode = $("#developerMode");
    const debugLogging = $("#debugLogging");
    const environment = $("#apiEnvironment");
    const saveButton = $("#saveDeveloperSettings");

    if (developerMode) {
      developerMode.checked =
        Boolean(APP_STATE.developer.developerMode);
    }

    if (debugLogging) {
      debugLogging.checked =
        Boolean(APP_STATE.developer.debugLogging);
    }

    if (environment) {
      const savedEnvironment =
        APP_STATE.developer.apiEnvironment;

      environment.value =
        Array.from(environment.options).some(
          option => option.value === savedEnvironment
        )
          ? savedEnvironment
          : "development";
    }

    if (!saveButton) return;

    saveButton.addEventListener("click", event => {
      event.preventDefault();

      APP_STATE.developer = {
        developerMode: Boolean(
          developerMode && developerMode.checked
        ),
        debugLogging: Boolean(
          debugLogging && debugLogging.checked
        ),
        apiEnvironment: environment
          ? environment.value
          : "development"
      };

      const saved = safeWrite(
        STORAGE.developer,
        JSON.stringify(APP_STATE.developer)
      );

      addLog("Developer preferences saved.", saved ? "success" : "warning");

      showToast(
        saved
          ? "Developer settings saved."
          : "Unable to save settings in this browser.",
        saved ? "success" : "warning"
      );
    });
  }

  // ============================================
  // CUSTOM LOGO
  // ============================================

  const LOGO_ELEMENTS = [
    "#splashLogo",
    "#sidebarLogo",
    "#profileAvatar",
    "#developerLogoPreview"
  ];

  const DEFAULT_LOGO_TEXT = {
    splashLogo: "JA",
    sidebarLogo: "JA",
    profileAvatar: "JA",
    developerLogoPreview: "JA"
  };

  function setLogoImage(source) {
    LOGO_ELEMENTS.forEach(selector => {
      const element = $(selector);

      if (!element) return;

      element.style.backgroundImage = "none";
      element.style.backgroundSize = "cover";
      element.style.backgroundPosition = "center";
      element.style.backgroundRepeat = "no-repeat";

      if (element.tagName === "IMG") {
        element.src = source;
        return;
      }

      element.style.backgroundImage =
        `url("${source.replace(/"/g, "%22")}")`;

      element.textContent = "";
      element.setAttribute("data-custom-logo", "true");
    });
  }

  function resetLogoDisplay() {
    LOGO_ELEMENTS.forEach(selector => {
      const element = $(selector);

      if (!element) return;

      element.style.backgroundImage = "";
      element.style.backgroundSize = "";
      element.style.backgroundPosition = "";
      element.style.backgroundRepeat = "";

      if (element.tagName === "IMG") {
        element.removeAttribute("src");
      } else {
        element.textContent =
          DEFAULT_LOGO_TEXT[element.id] || "JA";
      }

      element.removeAttribute("data-custom-logo");
    });
  }

  function loadCustomLogo() {
    const saved = safeRead(STORAGE.logo);

    if (saved && saved.startsWith("data:image/")) {
      setLogoImage(saved);

      const status = $("#logoStatus");

      if (status) status.textContent = "Custom logo is active.";
    }
  }

  function initializeLogoUpload() {
    const upload = $("#developerLogoUpload");
    const reset = $("#resetLogo");
    const status = $("#logoStatus");

    if (upload) {
      upload.addEventListener("change", event => {
        const file = event.target.files &&
          event.target.files[0];

        if (!file) return;

        if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) {
          showToast("Choose a PNG, JPEG, WEBP, or GIF image.", "error");
          upload.value = "";
          return;
        }

        if (file.size > 3 * 1024 * 1024) {
          showToast("Image size must be under 3 MB.", "error");
          upload.value = "";
          return;
        }

        const reader = new FileReader();

        reader.onload = () => {
          const source = reader.result;

          if (
            typeof source !== "string" ||
            !source.startsWith("data:image/")
          ) {
            showToast("Unable to read this image.", "error");
            return;
          }

          const saved = safeWrite(STORAGE.logo, source);

          if (!saved) {
            showToast("Unable to save the logo in this browser.", "error");
            return;
          }

          setLogoImage(source);

          if (status) {
            status.textContent = "Custom logo is active.";
          }

          addLog("Application logo updated.", "success");
          showToast("Logo updated successfully.", "success");
        };

        reader.onerror = () => {
          showToast("Unable to read the selected image.", "error");
        };

        reader.readAsDataURL(file);
      });
    }

    if (reset) {
      reset.addEventListener("click", event => {
        event.preventDefault();

        safeRemove(STORAGE.logo);
        resetLogoDisplay();

        if (status) {
          status.textContent = "Default logo is active.";
        }

        if (upload) upload.value = "";

        addLog("Application logo restored to default.", "info");
        showToast("Default logo restored.", "success");
      });
    }
  }

  // ============================================
  // GENERAL SETTINGS / THEME
  // ============================================

  function loadGeneralSettings() {
    const saved = readJSON(STORAGE.settings, {});

    APP_STATE.settings = {
      ...DEFAULT_SETTINGS,
      ...saved
    };

    const savedTheme = safeRead(STORAGE.theme);

    if (savedTheme === "dark" || savedTheme === "light") {
      APP_STATE.settings.theme = savedTheme;
    }
  }

  function applyTheme(theme) {
    const selected =
      theme === "light" ? "light" : "dark";

    APP_STATE.settings.theme = selected;

    document.body.dataset.theme = selected;
    document.body.classList.toggle(
      "light-theme",
      selected === "light"
    );

    document.documentElement.dataset.theme = selected;

    const selector = $("#themeSelect");

    if (selector) selector.value = selected;

    safeWrite(STORAGE.theme, selected);
  }

  function applyGeneralSettings() {
    const name = APP_STATE.settings.panelName ||
      DEFAULT_SETTINGS.panelName;

    const version = APP_STATE.settings.panelVersion ||
      DEFAULT_SETTINGS.panelVersion;

    APP_STATE.settings.panelName = name;
    APP_STATE.settings.panelVersion = version;

    const nameInput = $("#panelName");
    const versionInput = $("#panelVersion");

    if (nameInput) nameInput.value = name;
    if (versionInput) versionInput.value = version;

    const overviewName = $("#overviewPanelName");
    const overviewVersion = $("#overviewVersion");

    if (overviewName) overviewName.textContent = name;
    if (overviewVersion) overviewVersion.textContent = version;

    const title = $("#pageTitle");

    if (title && $("#dashboard")?.classList.contains("active")) {
      title.textContent = "Dashboard";
    }

    const footer = $(".app-footer");

    if (footer) {
      const footerName = footer.querySelector("span span");

      if (footerName) footerName.textContent = name;
    }

    applyTheme(APP_STATE.settings.theme);
  }

  function initializeGeneralSettings() {
    const saveButton = $("#saveSettings");
    const themeSelector = $("#themeSelect");
    const status = $("#settingsStatus");

    if (themeSelector) {
      themeSelector.addEventListener("change", () => {
        applyTheme(themeSelector.value);

        if (status) {
          status.textContent =
            `${themeSelector.value === "light" ? "Light" : "Dark"} theme selected.`;
        }
      });
    }

    if (!saveButton) return;

    saveButton.addEventListener("click", event => {
      event.preventDefault();

      const nameInput = $("#panelName");
      const versionInput = $("#panelVersion");

      APP_STATE.settings.panelName =
        nameInput && nameInput.value.trim()
          ? nameInput.value.trim().slice(0, 50)
          : DEFAULT_SETTINGS.panelName;

      APP_STATE.settings.panelVersion =
        versionInput && versionInput.value.trim()
          ? versionInput.value.trim().slice(0, 20)
          : DEFAULT_SETTINGS.panelVersion;

      APP_STATE.settings.theme =
        themeSelector && themeSelector.value === "light"
          ? "light"
          : "dark";

      const saved = safeWrite(
        STORAGE.settings,
        JSON.stringify(APP_STATE.settings)
      );

      applyGeneralSettings();

      if (status) {
        status.textContent = saved
          ? "Settings saved successfully."
          : "Unable to save settings in this browser.";
      }

      addLog("General application settings saved.", saved ? "success" : "warning");

      showToast(
        saved
          ? "Settings saved successfully."
          : "Settings could not be saved.",
        saved ? "success" : "warning"
      );
    });
  }

  function resetGeneralSettings() {
    APP_STATE.settings = { ...DEFAULT_SETTINGS };

    safeWrite(
      STORAGE.settings,
      JSON.stringify(APP_STATE.settings)
    );

    applyGeneralSettings();

    const status = $("#settingsStatus");

    if (status) {
      status.textContent = "Default settings restored.";
    }

    addLog("General settings restored to defaults.", "warning");
    showToast("Default settings restored.", "success");
  }

  // ============================================
  // ADMIN ACTIONS
  // ============================================

  function initializeAdminActions() {
    $$("[data-admin-action]").forEach(button => {
      button.addEventListener("click", event => {
        event.preventDefault();

        const action = button.dataset.adminAction;

        if (action === "clear-logs" || action === "clearLogs") {
          clearActivityLogs();
          return;
        }

        if (action === "reset-controls" || action === "resetControls") {
          resetControlSettings();
          return;
        }

        if (action === "reset-settings" || action === "resetSettings") {
          resetGeneralSettings();
          return;
        }

        if (action === "refresh" || action === "refresh-panel") {
          renderControls();
          renderLogs();
          updateControlCounter();

          addLog("Application interface refreshed.", "success");
          showToast("Panel refreshed.", "success");
          return;
        }

        // Current HTML contains User Management and Access Control.
        if (action === "User Management") {
          addLog("User Management module opened.", "info");

          showToast(
            "User Management module selected.",
            "info"
          );

          return;
        }

        if (action === "Access Control") {
          addLog("Access Control module opened.", "info");

          showToast(
            "Access Control module selected.",
            "info"
          );

          return;
        }

        addLog(`${action} selected.`, "info");
        showToast(`${action} selected.`, "info");
      });
    });
  }

  // ============================================
  // CLEAR LOGS / DISABLE ALL
  // ============================================

  function initializeClearLogs() {
    const button = $("#clearLogs");

    if (!button) return;

    button.addEventListener("click", event => {
      event.preventDefault();
      clearActivityLogs();
    });
  }

  function initializeDisableAll() {
    const button = $("#disableAll");

    if (button) {
      button.addEventListener("click", event => {
        event.preventDefault();
        disableAllControls();
      });
    }
  }

  // ============================================
  // CONTROL EVENTS
  // ============================================

  function initializeControlEvents() {
    document.addEventListener("change", event => {
      const target = event.target;

      if (!(target instanceof Element)) return;

      const checkbox = target.closest("[data-control]");

      if (checkbox) {
        const id = checkbox.dataset.control;

        if (!(id in APP_STATE.controls)) return;

        APP_STATE.controls[id] = checkbox.checked;

        saveControlStates();
        updateControlCardAppearance(id);
        updateControlCounter();

        const control = CONTROL_LIST.find(
          item => item.id === id
        );

        addLog(
          `${control ? control.name : id} ${
            checkbox.checked ? "enabled" : "disabled"
          }.`,
          checkbox.checked ? "success" : "info"
        );

        return;
      }

      const rangeInput = target.closest("[data-range-control]");

      if (rangeInput) {
        const id = rangeInput.dataset.rangeControl;

        const control = RANGE_CONTROLS.find(
          item => item.id === id
        );

        if (!control) return;

        const value = clampRangeValue(
          control,
          Number(rangeInput.value)
        );

        APP_STATE.controlValues[id] = value;
        rangeInput.value = String(value);

        const output = $(
          `[data-range-value="${id}"]`
        );

        if (output) {
          output.textContent = `${value}${control.unit}`;
        }

        saveControlStates();

        addLog(
          `${control.name} changed to ${value}${control.unit}.`,
          "info"
        );
      }
    });

    document.addEventListener("input", event => {
      const target = event.target;

      if (!(target instanceof Element)) return;

      const input = target.closest("[data-range-control]");

      if (!input) return;

      const id = input.dataset.rangeControl;

      const control = RANGE_CONTROLS.find(
        item => item.id === id
      );

      if (!control) return;

      const value = clampRangeValue(
        control,
        Number(input.value)
      );

      const output = $(
        `[data-range-value="${id}"]`
      );

      if (output) {
        output.textContent = `${value}${control.unit}`;
      }
    });
  }

  // ============================================
  // SPLASH SCREEN
  // ============================================

  function initializeSplashScreen() {
    const splash = $("#splashScreen");
    const app = $("#app");
    const enterButton = $("#enterApp");

    function enterApplication() {
      if (splash) {
        splash.classList.add("hidden");
        splash.setAttribute("aria-hidden", "true");
      }

      if (app) {
        app.classList.add("visible");
      }
    }

    if (enterButton) {
      enterButton.addEventListener(
        "click",
        enterApplication
      );
    }

    // The application remains usable even without the splash.
    if (splash) {
      setTimeout(enterApplication, 2200);
    }
  }

  // ============================================
  // KEYBOARD SUPPORT
  // ============================================

  function initializeKeyboardSupport() {
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeSidebar();
      }
    });
  }

  // ============================================
  // FOOTER
  // ============================================

  function initializeFooter() {
    const year = $("#footerYear");

    if (year) {
      year.textContent = String(new Date().getFullYear());
    }
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  function initializeApplication() {
    loadLogs();
    loadControlStates();
    loadDeveloperSettings();
    loadGeneralSettings();

    applyGeneralSettings();
    loadCustomLogo();

    renderControls();
    renderLogs();

    initializeNavigation();
    initializeSidebar();
    initializeDeveloperSettings();
    initializeLogoUpload();
    initializeGeneralSettings();
    initializeAdminActions();
    initializeClearLogs();
    initializeDisableAll();
    initializeControlEvents();
    initializeSplashScreen();
    initializeKeyboardSupport();
    initializeFooter();

    updateControlCounter();

    addLog("Control panel initialized.", "success");

    console.info(
      "JUNAID ABBASI — CONTROL PANEL initialized."
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeApplication,
      { once: true }
    );
  } else {
    initializeApplication();
  }
})();