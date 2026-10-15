/* =========================================================
   LAWANGEN — CONTROL PANEL
   Responsive browser interface
   Local settings, sliders, import/export and activity logs
   ========================================================= */

(() => {
  "use strict";

  if (window.__LAWANGENn_CONTROL_PANEL__) return;
  window.__LAWANGEN_CONTROL_PANEL__ = true;

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  const STORAGE = {
    controls: "lawangenControlStates",
    developer: "lawangenDeveloperSettings",
    logo: "lawangenCustomLogo",
    settings: "lawangenPanelSettings",
    theme: "lawangenTheme",
    logs: "lawangenActivityLogs"
  };

  const PAGE_INFO = {
    dashboard: {
      title: "Dashboard",
      description: "Your application overview"
    },
    controls: {
      title: "Control Center",
      description: "Manage your interface settings"
    },
    developer: {
      title: "Developer Workspace",
      description: "Customize branding and developer preferences"
    },
    admin: {
      title: "Admin Workspace",
      description: "Administrative interface modules"
    },
    logs: {
      title: "Activity Logs",
      description: "Review recent interface activity"
    },
    settings: {
      title: "Settings",
      description: "Customize your application preferences"
    }
  };

  /*
   * These options only store local interface values.
   * They do not connect to or modify any external application.
   */

  const CONTROL_LIST = [
    {
      id: "prefire",
      title: "Pre-Fire",
      description: "Local interface toggle for the pre-fire setting.",
      icon: "PF",
      type: "toggle",
      default: false
    },
    {
      id: "headshot",
      title: "Headshot",
      description: "Enable or disable this displayed setting.",
      icon: "HS",
      type: "toggle",
      default: false
    },
    {
      id: "esp-line",
      title: "ESP Line",
      description: "Toggle the ESP Line interface setting.",
      icon: "EL",
      type: "toggle",
      default: false
    },
    {
      id: "esp-head",
      title: "ESP Head",
      description: "Toggle the ESP Head interface setting.",
      icon: "EH",
      type: "toggle",
      default: false
    },
    {
      id: "silent",
      title: "Silent",
      description: "Local display preference for the Silent option.",
      icon: "SL",
      type: "toggle",
      default: false
    },
    {
      id: "aimbot",
      title: "Aimbot",
      description: "Interface-only toggle; it does not control game aiming.",
      icon: "AB",
      type: "toggle",
      default: false
    },
    {
      id: "aim-assist",
      title: "Aim Assist",
      description: "Local preference for this interface option.",
      icon: "AA",
      type: "toggle",
      default: false
    },
    {
      id: "vector",
      title: "Vector",
      description: "Toggle the Vector interface setting.",
      icon: "VC",
      type: "toggle",
      default: false
    },
    {
      id: "sensitivity",
      title: "Sensitivity",
      description: "Toggle this displayed configuration option.",
      icon: "SN",
      type: "toggle",
      default: false
    },
    {
      id: "fov",
      title: "FOV",
      description: "Toggle this local interface preference.",
      icon: "FV",
      type: "toggle",
      default: false
    },
    {
      id: "teleport",
      title: "Teleport",
      description: "Local interface toggle; no in-game teleport occurs.",
      icon: "TP",
      type: "toggle",
      default: false
    },
    {
      id: "headshot-rate",
      title: "Headshot Rate",
      description: "Adjust the displayed value from 0 to 360.",
      icon: "HR",
      type: "range",
      min: 0,
      max: 360,
      step: 1,
      default: 180,
      unit: ""
    },
    {
      id: "esp-distance",
      title: "ESP Line Distance",
      description: "Adjust the displayed distance from 0 to 500 metres.",
      icon: "DS",
      type: "range",
      min: 0,
      max: 500,
      step: 10,
      default: 150,
      unit: "m"
    },
    {
      id: "silent-strength",
      title: "Silent Strength",
      description: "Adjust the local slider value from 0 to 360.",
      icon: "SS",
      type: "range",
      min: 0,
      max: 360,
      step: 1,
      default: 180,
      unit: ""
    },
    {
      id: "teleport-distance",
      title: "Teleport Distance",
      description: "Adjust the displayed distance from 0 to 500 metres.",
      icon: "TD",
      type: "range",
      min: 0,
      max: 500,
      step: 10,
      default: 100,
      unit: "m"
    }
  ];

  const DEFAULT_CONTROLS = {};

  CONTROL_LIST.forEach((item) => {
    DEFAULT_CONTROLS[item.id] = item.default;
  });

  const DEFAULT_DEVELOPER = {
    developerMode: false,
    apiEnvironment: "local",
    debugLogging: true
  };

  const DEFAULT_SETTINGS = {
    panelName: "LAWANGEN",
    panelVersion: "1.0.0",
    theme: "dark"
  };

  let controlState = { ...DEFAULT_CONTROLS };
  let developerState = { ...DEFAULT_DEVELOPER };
  let generalSettings = { ...DEFAULT_SETTINGS };
  let activityLogs = [];
  let splashTimer = null;
  let controlEventsInitialized = false;
  let logoObjectUrl = null;

  /* =====================================================
     STORAGE HELPERS
     ===================================================== */

  function safeRead(key, fallback) {
    try {
      const raw = localStorage.getItem(key);

      if (raw === null) return fallback;

      return JSON.parse(raw);
    } catch (error) {
      console.warn("Unable to read local settings:", key);
      return fallback;
    }
  }

  function safeWrite(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn("Unable to save local settings:", key);
      showToast(
        "Could not save data. Browser storage may be full.",
        "error"
      );
      return false;
    }
  }

  function safeRemove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      return false;
    }
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => {
      const replacements = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };

      return replacements[character];
    });
  }

  function clampNumber(value, min, max, fallback) {
    const number = Number(value);

    if (!Number.isFinite(number)) return fallback;

    return Math.min(max, Math.max(min, number));
  }

  function formatValue(value, unit = "") {
    return `${value}${unit ? ` ${unit}` : ""}`;
  }

  /* =====================================================
     TOAST NOTIFICATIONS
     ===================================================== */

  function showToast(message, type = "success") {
    let container = $("#toastContainer");

    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container";
      container.setAttribute("aria-live", "polite");
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "toast";

    if (type === "error") {
      toast.classList.add("toast-error");
    }

    toast.textContent = String(message);

    container.appendChild(toast);

    window.setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";

      window.setTimeout(() => toast.remove(), 220);
    }, 3000);
  }

  /* =====================================================
     ACTIVITY LOGS
     ===================================================== */

  function loadLogs() {
    const saved = safeRead(STORAGE.logs, []);

    activityLogs = Array.isArray(saved)
      ? saved
          .filter((item) => item && typeof item === "object")
          .slice(0, 200)
      : [];
  }

  function persistLogs() {
    activityLogs = activityLogs.slice(0, 200);
    safeWrite(STORAGE.logs, activityLogs);
  }

  function addLog(message, type = "SUCCESS") {
    const entry = {
      time: new Date().toISOString(),
      type: String(type).slice(0, 20),
      message: String(message).slice(0, 300)
    };

    activityLogs.unshift(entry);
    activityLogs = activityLogs.slice(0, 200);

    persistLogs();
    renderLogs();
    updateDashboardCounters();

    if (developerState.debugLogging) {
      console.info("[LAWANGEN CONTROL PANEL]", entry.message);
    }
  }

  function formatLogTime(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "--:--";

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function formatLogDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Unknown date";

    return date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function renderLogs() {
    const logsContainer = $("#logsContainer");
    const recentContainer = $("#recentLogs");

    const count = $("#activityCount");

    if (count) {
      count.textContent = String(activityLogs.length);
    }

    if (logsContainer) {
      if (activityLogs.length === 0) {
        logsContainer.innerHTML =
          '<div class="empty-state">No activity recorded yet.</div>';
      } else {
        logsContainer.innerHTML = activityLogs
          .map((log) => {
            const time = escapeHTML(formatLogTime(log.time));
            const type = escapeHTML(log.type || "INFO");
            const message = escapeHTML(log.message || "");

            return `
              <div class="log-item">
                <span class="log-time" title="${escapeHTML(
                  formatLogDate(log.time)
                )}">${time}</span>
                <span class="log-success">${type}</span>
                <span class="log-message">${message}</span>
              </div>
            `;
          })
          .join("");
      }
    }

    if (recentContainer) {
      if (activityLogs.length === 0) {
        recentContainer.innerHTML =
          '<div class="empty-state">No activity yet.</div>';
      } else {
        recentContainer.innerHTML = activityLogs
          .slice(0, 5)
          .map((log) => {
            return `
              <div class="recent-log-row">
                <span class="recent-log-dot"></span>
                <span class="recent-log-text">${escapeHTML(
                  log.message || ""
                )}</span>
                <span class="recent-log-time">${escapeHTML(
                  formatLogTime(log.time)
                )}</span>
              </div>
            `;
          })
          .join("");
      }
    }
  }

  function clearActivityLogs() {
    activityLogs = [];
    persistLogs();
    renderLogs();
    updateDashboardCounters();

    showToast("Activity logs cleared.");
  }

  /* =====================================================
     CONTROL SETTINGS
     ===================================================== */

  function loadControlSettings() {
    const saved = safeRead(STORAGE.controls, {});

    controlState = { ...DEFAULT_CONTROLS };

    if (!saved || typeof saved !== "object" || Array.isArray(saved)) {
      return;
    }

    CONTROL_LIST.forEach((item) => {
      if (!(item.id in saved)) return;

      if (item.type === "toggle") {
        controlState[item.id] = saved[item.id] === true;
      } else {
        controlState[item.id] = clampNumber(
          saved[item.id],
          item.min,
          item.max,
          item.default
        );
      }
    });
  }

  function saveControlSettings() {
    return safeWrite(STORAGE.controls, controlState);
  }

  function createToggleCard(item) {
    const enabled = controlState[item.id] === true;

    return `
      <article
        class="control-card ${enabled ? "is-enabled" : ""}"
        data-control-card="${escapeHTML(item.id)}"
      >
        <div class="control-card-top">
          <div class="control-icon">${escapeHTML(item.icon)}</div>
          <span class="control-state-badge" data-state-badge>
            ${enabled ? "ENABLED" : "DISABLED"}
          </span>
        </div>

        <h4>${escapeHTML(item.title)}</h4>

        <p>${escapeHTML(item.description)}</p>

        <div class="control-card-footer">
          <span class="status-label" data-status-label>
            ${enabled ? "Enabled" : "Disabled"}
          </span>

          <label class="switch" aria-label="${escapeHTML(item.title)}">
            <input
              type="checkbox"
              data-control="${escapeHTML(item.id)}"
              ${enabled ? "checked" : ""}
              aria-label="Toggle ${escapeHTML(item.title)}"
            >
            <span class="switch-track"></span>
          </label>
        </div>
      </article>
    `;
  }

  function createRangeCard(item) {
    const value = clampNumber(
      controlState[item.id],
      item.min,
      item.max,
      item.default
    );

    return `
      <article class="control-card" data-control-card="${escapeHTML(item.id)}">
        <div class="control-card-top">
          <div class="control-icon">${escapeHTML(item.icon)}</div>
          <span class="control-state-badge" data-state-badge>CONFIGURED</span>
        </div>

        <h4>${escapeHTML(item.title)}</h4>

        <p>${escapeHTML(item.description)}</p>

        <div class="range-control">
          <div class="range-control-header">
            <label for="range-${escapeHTML(item.id)}">
              ${escapeHTML(item.title)}
            </label>

            <output
              class="range-value"
              data-range-value="${escapeHTML(item.id)}"
              for="range-${escapeHTML(item.id)}"
            >${escapeHTML(formatValue(value, item.unit))}</output>
          </div>

          <input
            id="range-${escapeHTML(item.id)}"
            type="range"
            min="${item.min}"
            max="${item.max}"
            step="${item.step}"
            value="${value}"
            data-range-control="${escapeHTML(item.id)}"
            aria-label="${escapeHTML(item.title)}"
            style="width:100%;accent-color:var(--accent);cursor:pointer;"
          >

          <div class="range-limits">
            <span>${escapeHTML(formatValue(item.min, item.unit))}</span>
            <span>${escapeHTML(formatValue(item.max, item.unit))}</span>
          </div>
        </div>

        <div class="control-card-footer">
          <span class="status-label">Local value</span>
          <button
            type="button"
            class="text-button"
            data-reset-range="${escapeHTML(item.id)}"
          >Reset</button>
        </div>
      </article>
    `;
  }

  function renderControls() {
    const container = $("#allControls");
    if (!container) return;

    container.innerHTML = CONTROL_LIST.map((item) => {
      return item.type === "range"
        ? createRangeCard(item)
        : createToggleCard(item);
    }).join("");

    updateControlCounter();
    initializeControlActions();
  }

  function updateControlCounter() {
    const enabledCount = CONTROL_LIST.filter((item) => {
      return item.type === "toggle" && controlState[item.id] === true;
    }).length;

    const toggleCount = CONTROL_LIST.filter(
      (item) => item.type === "toggle"
    ).length;

    const total = CONTROL_LIST.length;

    const totalElement = $("#totalControls");
    const enabledElement = $("#controlCount");
    const summary = $("#controlsSummary");

    if (totalElement) {
      totalElement.textContent = String(total);
    }

    if (enabledElement) {
      enabledElement.textContent = String(enabledCount);
    }

    if (summary) {
      summary.textContent = `${enabledCount} / ${toggleCount} enabled · ${total} options`;
    }
  }

  function updateDashboardCounters() {
    const count = $("#activityCount");

    if (count) {
      count.textContent = String(activityLogs.length);
    }

    updateControlCounter();
  }

  function updateSingleControl(id) {
    const item = CONTROL_LIST.find((entry) => entry.id === id);
    if (!item) return;

    const card = $(`[data-control-card="${id}"]`);
    if (!card) return;

    if (item.type === "toggle") {
      const enabled = controlState[id] === true;

      card.classList.toggle("is-enabled", enabled);

      const badge = $("[data-state-badge]", card);
      const status = $("[data-status-label]", card);

      if (badge) badge.textContent = enabled ? "ENABLED" : "DISABLED";
      if (status) status.textContent = enabled ? "Enabled" : "Disabled";
    } else {
      const input = $(`[data-range-control="${id}"]`);
      const output = $(`[data-range-value="${id}"]`);

      if (input) input.value = String(controlState[id]);

      if (output) {
        output.textContent = formatValue(controlState[id], item.unit);
      }
    }

    updateControlCounter();
  }

  function disableAllControls() {
    let changed = false;

    CONTROL_LIST.forEach((item) => {
      if (item.type === "toggle" && controlState[item.id]) {
        controlState[item.id] = false;
        changed = true;
      }
    });

    saveControlSettings();
    renderControls();

    addLog("All interface toggles disabled.");

    showToast(
      changed
        ? "All toggle options have been disabled."
        : "All toggle options are already disabled."
    );
  }

  function resetControlSettings() {
    controlState = { ...DEFAULT_CONTROLS };

    saveControlSettings();
    renderControls();

    addLog("Control settings restored to defaults.");
    showToast("Control settings have been reset.");
  }

  function applyControlSettings() {
    CONTROL_LIST.forEach((item) => {
      if (item.type === "range") {
        controlState[item.id] = clampNumber(
          controlState[item.id],
          item.min,
          item.max,
          item.default
        );
      } else {
        controlState[item.id] = controlState[item.id] === true;
      }
    });

    saveControlSettings();
    renderControls();

    addLog("Control interface settings applied.");
    showToast("Settings applied and saved locally.");
  }

  /* =====================================================
     CONTROL ACTION TOOLBAR
     ===================================================== */

  function initializeControlActions() {
    const grid = $("#allControls");
    if (!grid) return;

    let toolbar = $("#controlActionToolbar");

    if (!toolbar) {
      toolbar = document.createElement("div");
      toolbar.id = "controlActionToolbar";
      toolbar.style.cssText = `
        display:flex;
        flex-wrap:wrap;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        margin:0 0 16px;
        padding:14px;
        border:1px solid var(--border);
        border-radius:13px;
        background:var(--surface);
      `;

      toolbar.innerHTML = `
        <div style="min-width:150px;flex:1;">
          <strong style="display:block;font-size:12px;">Control Actions</strong>
          <small style="display:block;color:var(--muted);margin-top:4px;font-size:10px;">
            Import, apply or export local interface settings.
          </small>
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          <button type="button" class="secondary-button" data-control-action="import">
            Import
          </button>
          <button type="button" class="secondary-button" data-control-action="export">
            Export
          </button>
          <button type="button" class="primary-button" data-control-action="apply">
            Apply Settings
          </button>
          <button type="button" class="secondary-button" data-control-action="reset">
            Reset
          </button>
        </div>

        <input
          type="file"
          id="importSettingsFile"
          accept=".json,application/json"
          hidden
        >
      `;

      grid.insertAdjacentElement("beforebegin", toolbar);
    }
  }

  function exportSettings() {
    const exportData = {
      application: "LAWANGEN CONTROL PANEL",
      formatVersion: 1,
      exportedAt: new Date().toISOString(),
      controls: controlState,
      developer: developerState,
      settings: generalSettings,
      theme: generalSettings.theme
    };

    const blob = new Blob(
      [JSON.stringify(exportData, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "lawangen-settings.json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);

    addLog("Local settings exported to a JSON file.");
    showToast("Settings export file created.");
  }

  function importSettingsFile(file) {
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("The settings file is too large.", "error");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result || ""));

        if (!data || typeof data !== "object" || Array.isArray(data)) {
          throw new Error("Invalid settings file.");
        }

        const importedControls =
          data.controls ||
          data.values ||
          null;

        if (
          importedControls &&
          typeof importedControls === "object" &&
          !Array.isArray(importedControls)
        ) {
          CONTROL_LIST.forEach((item) => {
            if (!(item.id in importedControls)) return;

            if (item.type === "toggle") {
              controlState[item.id] =
                importedControls[item.id] === true;
            } else {
              controlState[item.id] = clampNumber(
                importedControls[item.id],
                item.min,
                item.max,
                item.default
              );
            }
          });
        } else {
          const directKeys = CONTROL_LIST.some(
            (item) => item.id in data
          );

          if (directKeys) {
            CONTROL_LIST.forEach((item) => {
              if (!(item.id in data)) return;

              controlState[item.id] =
                item.type === "toggle"
                  ? data[item.id] === true
                  : clampNumber(
                      data[item.id],
                      item.min,
                      item.max,
                      item.default
                    );
            });
          } else {
            throw new Error("No compatible control settings found.");
          }
        }

        saveControlSettings();

        if (data.developer && typeof data.developer === "object") {
          developerState = {
            ...developerState,
            developerMode: data.developer.developerMode === true,
            debugLogging: data.developer.debugLogging !== false,
            apiEnvironment: ["local", "development", "production"].includes(
              data.developer.apiEnvironment
            )
              ? data.developer.apiEnvironment
              : "local"
          };

          safeWrite(STORAGE.developer, developerState);
          applyDeveloperSettingsToForm();
        }

        const importedSettings = data.settings || {};

        if (importedSettings && typeof importedSettings === "object") {
          const name = String(
            importedSettings.panelName || generalSettings.panelName
          ).trim().slice(0, 50);

          const version = String(
            importedSettings.panelVersion || generalSettings.panelVersion
          ).trim().slice(0, 20);

          const themeValue =
            data.theme || importedSettings.theme || generalSettings.theme;

          generalSettings = {
            panelName: name || DEFAULT_SETTINGS.panelName,
            panelVersion: version || DEFAULT_SETTINGS.panelVersion,
            theme: ["dark", "light"].includes(themeValue)
              ? themeValue
              : "dark"
          };

          safeWrite(STORAGE.settings, generalSettings);
          safeWrite(STORAGE.theme, generalSettings.theme);
          applyGeneralSettings();
        }

        renderControls();
        addLog("Settings imported from a JSON file.");
        showToast("Settings imported successfully.");
      } catch (error) {
        console.error(error);
        showToast(
          "Import failed. Please select a valid settings JSON file.",
          "error"
        );
      }
    };

    reader.onerror = () => {
      showToast("Could not read the selected file.", "error");
    };

    reader.readAsText(file);
  }

  /* =====================================================
     DEVELOPER SETTINGS
     ===================================================== */

  function loadDeveloperSettings() {
    const saved = safeRead(STORAGE.developer, {});

    developerState = {
      ...DEFAULT_DEVELOPER,
      ...(saved && typeof saved === "object" && !Array.isArray(saved)
        ? saved
        : {})
    };

    developerState.developerMode = developerState.developerMode === true;
    developerState.debugLogging = developerState.debugLogging !== false;

    if (
      !["local", "development", "production"].includes(
        developerState.apiEnvironment
      )
    ) {
      developerState.apiEnvironment = "local";
    }
  }

  function applyDeveloperSettingsToForm() {
    const mode = $("#developerMode");
    const environment = $("#apiEnvironment");
    const debug = $("#debugLogging");

    if (mode) mode.checked = developerState.developerMode;

    if (environment) {
      environment.value = developerState.apiEnvironment;
    }

    if (debug) debug.checked = developerState.debugLogging;

    document.body.dataset.developerMode =
      developerState.developerMode ? "on" : "off";
  }

  function saveDeveloperSettings() {
    const mode = $("#developerMode");
    const environment = $("#apiEnvironment");
    const debug = $("#debugLogging");

    developerState = {
      developerMode: Boolean(mode && mode.checked),
      apiEnvironment:
        environment &&
        ["local", "development", "production"].includes(environment.value)
          ? environment.value
          : "local",
      debugLogging: Boolean(debug && debug.checked)
    };

    if (safeWrite(STORAGE.developer, developerState)) {
      applyDeveloperSettingsToForm();
      addLog("Developer preferences saved.");
      showToast("Developer settings saved.");
    }
  }

  /* =====================================================
     LOGO UPLOAD
     ===================================================== */

  function applyLogoData(dataUrl) {
    const logoIds = [
      "splashLogo",
      "sidebarLogo",
      "profileAvatar",
      "developerLogoPreview"
    ];

    logoIds.forEach((id) => {
      const element = document.getElementById(id);
      if (!element) return;

      let image = $("img", element);

      if (!image) {
        image = document.createElement("img");
        image.alt = "Custom application logo";
        image.draggable = false;
        element.appendChild(image);
      }

      image.src = dataUrl;

      Array.from(element.childNodes).forEach((node) => {
        if (node === image) return;

        if (
          node.nodeType === Node.TEXT_NODE &&
          node.textContent.trim()
        ) {
          node.textContent = "";
        } else if (
          node.nodeType === Node.ELEMENT_NODE &&
          node.tagName !== "IMG"
        ) {
          node.style.visibility = "hidden";
        }
      });
    });
  }

  function restoreDefaultLogo() {
    [
      "splashLogo",
      "sidebarLogo",
      "profileAvatar",
      "developerLogoPreview"
    ].forEach((id) => {
      const element = document.getElementById(id);
      if (!element) return;

      const image = $("img", element);
      if (image) image.remove();

      Array.from(element.children).forEach((child) => {
        child.style.visibility = "";
      });

      const text = element.textContent.trim();

      if (id === "splashLogo") {
        if (!text) element.textContent = "JA";
      } else if (id === "sidebarLogo" || id === "profileAvatar") {
        element.textContent = "JA";
      } else if (id === "developerLogoPreview") {
        element.textContent = "JA";
      }
    });

    safeRemove(STORAGE.logo);

    const status = $("#logoStatus");
    if (status) status.textContent = "Default logo is active.";

    showToast("Default logo restored.");
    addLog("Default application logo restored.");
  }

  function loadSavedLogo() {
    const saved = safeRead(STORAGE.logo, "");

    if (typeof saved === "string" && saved.startsWith("data:image/")) {
      applyLogoData(saved);

      const status = $("#logoStatus");
      if (status) status.textContent = "Saved custom logo is active.";
    }
  }

  function initializeLogoUpload() {
    const input = $("#developerLogoUpload");
    if (!input) return;

    input.addEventListener("change", () => {
      const file = input.files && input.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        showToast("Please choose an image file.", "error");
        input.value = "";
        return;
      }

      if (file.size > 3 * 1024 * 1024) {
        showToast("Please choose an image smaller than 3 MB.", "error");
        input.value = "";
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const dataUrl = String(reader.result || "");

        if (!dataUrl.startsWith("data:image/")) {
          showToast("The selected image could not be loaded.", "error");
          return;
        }

        if (safeWrite(STORAGE.logo, dataUrl)) {
          applyLogoData(dataUrl);

          const status = $("#logoStatus");
          if (status) status.textContent = "Custom logo saved locally.";

          addLog("Application logo updated.");
          showToast("Custom logo saved.");
        }
      };

      reader.onerror = () => {
        showToast("Unable to read the selected image.", "error");
      };

      reader.readAsDataURL(file);
    });

    const reset = $("#resetLogo");

    if (reset) {
      reset.addEventListener("click", restoreDefaultLogo);
    }
  }

  /* =====================================================
     GENERAL SETTINGS AND THEME
     ===================================================== */

  function loadGeneralSettings() {
    const saved = safeRead(STORAGE.settings, {});

    const storedTheme = safeRead(
      STORAGE.theme,
      document.body.dataset.theme || "dark"
    );

    const validTheme = ["dark", "light"].includes(storedTheme)
      ? storedTheme
      : "dark";

    generalSettings = {
      ...DEFAULT_SETTINGS,
      ...(saved && typeof saved === "object" && !Array.isArray(saved)
        ? saved
        : {}),
      theme: validTheme
    };

    if (!["dark", "light"].includes(generalSettings.theme)) {
      generalSettings.theme = "dark";
    }

    if (saved && ["dark", "light"].includes(saved.theme)) {
      generalSettings.theme = saved.theme;
    }
  }

  function applyGeneralSettings() {
    const nameInput = $("#panelName");
    const versionInput = $("#panelVersion");
    const themeSelect = $("#themeSelect");

    if (nameInput) nameInput.value = generalSettings.panelName;
    if (versionInput) versionInput.value = generalSettings.panelVersion;
    if (themeSelect) themeSelect.value = generalSettings.theme;

    document.body.dataset.theme = generalSettings.theme;

    const name = generalSettings.panelName || " LAWANGEN";
    const version = generalSettings.panelVersion || "1.0.0";

    const overviewName = $("#overviewPanelName");
    const overviewVersion = $("#overviewVersion");

    if (overviewName) overviewName.textContent = name;
    if (overviewVersion) overviewVersion.textContent = version;

    const brandName = $(".brand-text strong");
    if (brandName) brandName.textContent = name;

    const footer = $(".sidebar-footer");

    if (footer) {
      const parts = footer.querySelectorAll("span");

      if (parts[0]) parts[0].textContent = name;
      if (parts[1]) parts[1].textContent = `v${version}`;
    }

    const pageTitle = $("#pageTitle");

    if (pageTitle && $("#dashboard")?.classList.contains("active")) {
      pageTitle.textContent = "Dashboard";
    }
  }

  function saveGeneralSettings() {
    const nameInput = $("#panelName");
    const versionInput = $("#panelVersion");
    const themeSelect = $("#themeSelect");

    const name = String(nameInput?.value || "").trim().slice(0, 50);
    const version = String(versionInput?.value || "").trim().slice(0, 20);
    const theme = themeSelect?.value === "light" ? "light" : "dark";

    if (!name) {
      showToast("Please enter a panel name.", "error");
      if (nameInput) nameInput.focus();
      return;
    }

    if (!version) {
      showToast("Please enter a panel version.", "error");
      if (versionInput) versionInput.focus();
      return;
    }

    generalSettings = {
      panelName: name,
      panelVersion: version,
      theme
    };

    if (
      safeWrite(STORAGE.settings, generalSettings) &&
      safeWrite(STORAGE.theme, theme)
    ) {
      applyGeneralSettings();

      const status = $("#settingsStatus");

      if (status) {
        status.textContent = "Settings saved successfully.";
      }

      addLog("General application settings saved.");
      showToast("Application settings saved.");
    }
  }

  /* =====================================================
     PAGE NAVIGATION
     ===================================================== */

  function closeSidebar() {
    const sidebar = $("#sidebar");
    const overlay = $("#sidebarOverlay");

    if (sidebar) sidebar.classList.remove("open");
    if (overlay) overlay.classList.remove("visible", "active");

    document.body.classList.remove("sidebar-open");
  }

  function openSidebar() {
    const sidebar = $("#sidebar");
    const overlay = $("#sidebarOverlay");

    if (sidebar) sidebar.classList.add("open");
    if (overlay) overlay.classList.add("visible", "active");

    document.body.classList.add("sidebar-open");
  }

  function navigateToPage(pageId, shouldLog = true) {
    if (!PAGE_INFO[pageId]) return;

    const target = document.getElementById(pageId);
    if (!target || !target.classList.contains("page")) return;

    $$(".page").forEach((page) => {
      page.classList.toggle("active", page.id === pageId);
      page.setAttribute(
        "aria-hidden",
        page.id === pageId ? "false" : "true"
      );
    });

    $$(".nav-item[data-page]").forEach((button) => {
      const active = button.dataset.page === pageId;

      button.classList.toggle("active", active);

      if (active) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }
    });

    const title = $("#pageTitle");
    const description = $("#pageDescription");

    if (title) title.textContent = PAGE_INFO[pageId].title;
    if (description) {
      description.textContent = PAGE_INFO[pageId].description;
    }

    closeSidebar();

    if (shouldLog) {
      addLog(`Opened ${PAGE_INFO[pageId].title} page.`);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function initializeNavigation() {
    $$(".nav-item[data-page]").forEach((button) => {
      button.addEventListener("click", () => {
        navigateToPage(button.dataset.page);
      });
    });

    $$("[data-go-page]").forEach((button) => {
      button.addEventListener("click", () => {
        navigateToPage(button.dataset.goPage);
      });
    });

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

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeSidebar();
    });
  }

  /* =====================================================
     CONTROL EVENTS
     ===================================================== */

  function initializeControlEvents() {
    if (controlEventsInitialized) return;
    controlEventsInitialized = true;

    document.addEventListener("change", (event) => {
      const target = event.target;

      if (!(target instanceof HTMLElement)) return;

      if (target.matches("[data-control]")) {
        const id = target.dataset.control;
        const item = CONTROL_LIST.find((entry) => entry.id === id);

        if (!item || item.type !== "toggle") return;

        controlState[id] = target.checked;

        saveControlSettings();
        updateSingleControl(id);

        addLog(
          `${item.title} ${target.checked ? "enabled" : "disabled"}.`
        );

        showToast(
          `${item.title} ${target.checked ? "enabled" : "disabled"}.`
        );

        return;
      }

      if (target.matches("[data-range-control]")) {
        const id = target.dataset.rangeControl;
        const item = CONTROL_LIST.find((entry) => entry.id === id);

        if (!item || item.type !== "range") return;

        controlState[id] = clampNumber(
          target.value,
          item.min,
          item.max,
          item.default
        );

        saveControlSettings();
        updateSingleControl(id);

        addLog(`${item.title} set to ${formatValue(
          controlState[id],
          item.unit
        )}.`);

        return;
      }

      if (target.id === "importSettingsFile") {
        const file = target.files && target.files[0];

        if (file) importSettingsFile(file);

        target.value = "";
      }
    });

    document.addEventListener("input", (event) => {
      const target = event.target;

      if (!(target instanceof HTMLElement)) return;
      if (!target.matches("[data-range-control]")) return;

      const id = target.dataset.rangeControl;
      const item = CONTROL_LIST.find((entry) => entry.id === id);

      if (!item || item.type !== "range") return;

      const value = clampNumber(
        target.value,
        item.min,
        item.max,
        item.default
      );

      controlState[id] = value;

      const output = $(`[data-range-value="${id}"]`);

      if (output) {
        output.textContent = formatValue(value, item.unit);
      }
    });

    document.addEventListener("click", (event) => {
      const target = event.target;

      if (!(target instanceof Element)) return;

      const actionButton = target.closest("[data-control-action]");

      if (actionButton) {
        const action = actionButton.dataset.controlAction;

        if (action === "apply") {
          applyControlSettings();
        } else if (action === "export") {
          exportSettings();
        } else if (action === "import") {
          $("#importSettingsFile")?.click();
        } else if (action === "reset") {
          resetControlSettings();
        }

        return;
      }

      const resetButton = target.closest("[data-reset-range]");

      if (resetButton) {
        const id = resetButton.dataset.resetRange;
        const item = CONTROL_LIST.find((entry) => entry.id === id);

        if (!item || item.type !== "range") return;

        controlState[id] = item.default;

        saveControlSettings();
        updateSingleControl(id);

        addLog(`${item.title} reset to its default value.`);
        showToast(`${item.title} reset.`);
      }
    });
  }

  /* =====================================================
     ADMIN ACTIONS
     ===================================================== */

  function initializeAdminActions() {
    $$("[data-admin-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = String(button.dataset.adminAction || "Admin action");

        addLog(`Opened ${action} interface module.`, "INFO");

        showToast(
          `${action} is an interface placeholder. No backend service is connected.`
        );
      });
    });
  }

  /* =====================================================
     CLEAR LOGS
     ===================================================== */

  function initializeLogActions() {
    const clearButton = $("#clearLogs");

    if (clearButton) {
      clearButton.addEventListener("click", () => {
        if (activityLogs.length === 0) {
          showToast("There are no logs to clear.");
          return;
        }

        clearActivityLogs();
      });
    }
  }

  /* =====================================================
     DEVELOPER AND GENERAL SETTINGS EVENTS
     ===================================================== */

  function initializeSettingsEvents() {
    const saveDeveloper = $("#saveDeveloperSettings");

    if (saveDeveloper) {
      saveDeveloper.addEventListener("click", saveDeveloperSettings);
    }

    const saveSettingsButton = $("#saveSettings");

    if (saveSettingsButton) {
      saveSettingsButton.addEventListener("click", saveGeneralSettings);
    }

    const themeSelect = $("#themeSelect");

    if (themeSelect) {
      themeSelect.addEventListener("change", () => {
        const theme = themeSelect.value === "light" ? "light" : "dark";

        document.body.dataset.theme = theme;
      });
    }
  }

  /* =====================================================
     SPLASH SCREEN
     ===================================================== */

  function enterApplication() {
    const splash = $("#splashScreen");
    const app = $("#app");

    if (splash) {
      splash.classList.add("hidden");
      splash.setAttribute("aria-hidden", "true");
    }

    if (app) {
      app.classList.remove("app-hidden");
      app.setAttribute("aria-hidden", "false");
    }

    if (splashTimer) {
      window.clearTimeout(splashTimer);
      splashTimer = null;
    }
  }

  function initializeSplashScreen() {
    const splash = $("#splashScreen");
    const app = $("#app");
    const enterButton = $("#enterApp");

    if (app) {
      app.classList.add("app-hidden");
      app.setAttribute("aria-hidden", "true");
    }

    if (enterButton) {
      enterButton.addEventListener("click", enterApplication);
    }

    splashTimer = window.setTimeout(enterApplication, 2200);

    if (!splash) {
      enterApplication();
    }
  }

  /* =====================================================
     INITIALIZATION
     ===================================================== */

  function initialize() {
    loadControlSettings();
    loadDeveloperSettings();
    loadGeneralSettings();
    loadLogs();

    applyGeneralSettings();
    applyDeveloperSettingsToForm();

    renderControls();
    renderLogs();

    initializeNavigation();
    initializeControlEvents();
    initializeAdminActions();
    initializeLogActions();
    initializeSettingsEvents();
    initializeLogoUpload();

    loadSavedLogo();

    const year = $("#footerYear");

    if (year) {
      year.textContent = String(new Date().getFullYear());
    }

    navigateToPage("dashboard", false);

    initializeSplashScreen();

    if (activityLogs.length === 0) {
      addLog("Application initialized.");
    }

    updateDashboardCounters();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, {
      once: true
    });
  } else {
    initialize();
  }
})();