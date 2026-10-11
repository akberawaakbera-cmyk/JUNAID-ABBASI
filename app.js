(() => {
  "use strict";

  // ============================================
  // JUNAID ABBASI — CONTROL PANEL
  // Responsive control panel application
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

  // ============================================
  // CONTROL DEFINITIONS
  // ============================================

  const CONTROL_LIST = [
    {
      id: "prefire",
      name: "Pre-Fire",
      icon: "🎯",
      description: "Pre-Fire control setting",
      type: "toggle",
      defaultValue: false
    },
    {
      id: "headshot",
      name: "Headshot",
      icon: "🎯",
      description: "Headshot control setting",
      type: "toggle",
      defaultValue: false
    },
    {
      id: "esp-line",
      name: "ESP Line",
      icon: "📏",
      description: "ESP line display setting",
      type: "toggle",
      defaultValue: false
    },
    {
      id: "esp-head",
      name: "ESP Head",
      icon: "👁️",
      description: "ESP head display setting",
      type: "toggle",
      defaultValue: false
    },
    {
      id: "esp-distance",
      name: "ESP Distance",
      icon: "📐",
      description: "Distance setting",
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
      description: "Silent Headshot control setting",
      type: "toggle",
      defaultValue: false
    },
    {
      id: "aimbot",
      name: "Aimbot",
      icon: "🎮",
      description: "Aiming control setting",
      type: "toggle",
      defaultValue: false
    },
    {
      id: "aim-assist",
      name: "Aim Assist",
      icon: "🕹️",
      description: "Aim Assist control setting",
      type: "toggle",
      defaultValue: false
    },
    {
      id: "vector",
      name: "Vector",
      icon: "〽️",
      description: "Vector control setting",
      type: "toggle",
      defaultValue: false
    },
    {
      id: "sensitivity",
      name: "Sensitivity",
      icon: "🎚️",
      description: "Sensitivity control setting",
      type: "toggle",
      defaultValue: false
    },
    {
      id: "fov",
      name: "FOV",
      icon: "🔭",
      description: "Field of view setting",
      type: "toggle",
      defaultValue: false
    },
    {
      id: "headshot-rate",
      name: "Headshot Rate",
      icon: "📊",
      description: "Headshot rate setting",
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
  // APPLICATION STATE
  // ============================================

  const APP_STATE = {
    controls: {},
    controlValues: {},
    logs: [],
    developer: {
      developerMode: false,
      debugLogging: false,
      apiEnvironment: "production"
    },
    settings: {
      panelName: "JUNAID ABBASI",
      panelVersion: "1.0.0",
      theme: "dark"
    }
  };

  CONTROL_LIST.forEach(control => {
    if (control.type === "toggle") {
      APP_STATE.controls[control.id] = control.defaultValue;
    } else {
      APP_STATE.controlValues[control.id] = control.defaultValue;
    }
  });

  // ============================================
  // SAFE STORAGE
  // ============================================

  function safeRead(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function safeWrite(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn("Storage write failed:", error);
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
    let toast = $("#appToast");

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "appToast";
      toast.setAttribute("role", "status");

      Object.assign(toast.style, {
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: "99999",
        padding: "13px 20px",
        borderRadius: "12px",
        maxWidth: "calc(100% - 32px)",
        fontSize: "14px",
        fontWeight: "600",
        boxShadow: "0 8px 28px rgba(0,0,0,.25)",
        opacity: "0",
        transition: "opacity .2s ease",
        pointerEvents: "none",
        textAlign: "center"
      });

      document.body.appendChild(toast);
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
    toast.style.color = "#ffffff";
    toast.style.opacity = "1";

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.style.opacity = "0";
    }, 2800);
  }

  // ============================================
  // ACTIVITY LOGS
  // ============================================

  function loadLogs() {
    try {
      const saved = JSON.parse(
        safeRead(STORAGE.logs, "[]")
      );

      if (Array.isArray(saved)) {
        APP_STATE.logs = saved.slice(0, 100);
      }
    } catch (error) {
      APP_STATE.logs = [];
    }
  }

  function saveLogs() {
    safeWrite(
      STORAGE.logs,
      JSON.stringify(APP_STATE.logs.slice(0, 100))
    );
  }

  function addLog(message, type = "info") {
    const entry = {
      message: String(message),
      type,
      time: new Date().toISOString()
    };

    APP_STATE.logs.unshift(entry);
    APP_STATE.logs = APP_STATE.logs.slice(0, 100);

    saveLogs();
    renderLogs();
  }

  function formatLogTime(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Unknown time";
    }

    return date.toLocaleString();
  }

  function renderLogs() {
    const container = $("#activityLogs") || $("#logsList");

    if (!container) return;

    if (!APP_STATE.logs.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <p>No activity available.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = APP_STATE.logs.map(log => `
      <div class="log-entry">
        <span class="log-indicator log-${escapeHTML(log.type)}"></span>
        <div class="log-entry-content">
          <div class="log-message">
            ${escapeHTML(log.message)}
          </div>
          <small class="log-time">
            ${escapeHTML(formatLogTime(log.time))}
          </small>
        </div>
      </div>
    `).join("");
  }

  // ============================================
  // CONTROL STORAGE
  // ============================================

  function loadControlStates() {
    try {
      const raw = safeRead(STORAGE.controls, "{}");
      const saved = JSON.parse(raw);

      if (!saved || typeof saved !== "object") return;

      // Supports the older format, where each control
      // was saved directly in the same object.
      const savedToggles =
        saved.controls && typeof saved.controls === "object"
          ? saved.controls
          : saved;

      const savedValues =
        saved.values && typeof saved.values === "object"
          ? saved.values
          : saved.__values && typeof saved.__values === "object"
            ? saved.__values
            : {};

      TOGGLE_CONTROLS.forEach(control => {
        if (typeof savedToggles[control.id] === "boolean") {
          APP_STATE.controls[control.id] =
            savedToggles[control.id];
        }
      });

      RANGE_CONTROLS.forEach(control => {
        const value = savedValues[control.id] ??
          saved[control.id];

        if (Number.isFinite(Number(value))) {
          APP_STATE.controlValues[control.id] =
            clampRangeValue(control, Number(value));
        }
      });
    } catch (error) {
      console.warn("Could not load saved controls.");
    }
  }

  function saveControlStates() {
    const data = {
      controls: APP_STATE.controls,
      values: APP_STATE.controlValues
    };

    return safeWrite(
      STORAGE.controls,
      JSON.stringify(data)
    );
  }

  function clampRangeValue(control, value) {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return control.defaultValue;
    }

    const clamped = Math.min(
      control.max,
      Math.max(control.min, numericValue)
    );

    const step = control.step || 1;
    const stepped = control.min +
      Math.round((clamped - control.min) / step) * step;

    return Math.min(
      control.max,
      Math.max(control.min, stepped)
    );
  }

  // ============================================
  // CONTROL CARD GENERATION
  // ============================================

  function createControlCard(control) {
    const card = document.createElement("article");
    card.className = "control-card";
    card.dataset.controlCard = control.id;

    const isRange = control.type === "range";

    const topMarkup = `
      <div class="control-card-top">
        <div class="control-icon">
          ${escapeHTML(control.icon)}
        </div>

        <div class="control-card-heading">
          <h3>${escapeHTML(control.name)}</h3>
          <p>${escapeHTML(control.description)}</p>
        </div>

        ${
          isRange
            ? `<span class="control-state-badge">SETTING</span>`
            : `
              <span class="control-state-badge ${
                APP_STATE.controls[control.id] ? "active" : ""
              }" data-state-badge>
                ${APP_STATE.controls[control.id] ? "ON" : "OFF"}
              </span>
            `
        }
      </div>
    `;

    let bodyMarkup = "";

    if (isRange) {
      const value = APP_STATE.controlValues[control.id];

      bodyMarkup = `
        <div class="range-control">
          <div class="range-control-header">
            <label for="range-${escapeHTML(control.id)}">
              ${escapeHTML(control.name)}
            </label>

            <output
              class="range-value"
              data-range-value="${escapeHTML(control.id)}"
            >
              ${escapeHTML(value)}${escapeHTML(control.unit)}
            </output>
          </div>

          <input
            type="range"
            id="range-${escapeHTML(control.id)}"
            class="control-range"
            data-range-control="${escapeHTML(control.id)}"
            min="${control.min}"
            max="${control.max}"
            step="${control.step}"
            value="${value}"
            aria-label="${escapeHTML(control.name)}"
          >

          <div class="range-limits">
            <span>${control.min}${escapeHTML(control.unit)}</span>
            <span>${control.max}${escapeHTML(control.unit)}</span>
          </div>
        </div>
      `;
    } else {
      bodyMarkup = `
        <div class="control-card-footer">
          <span class="status-label" data-status-label>
            ${APP_STATE.controls[control.id] ? "Enabled" : "Disabled"}
          </span>

          <label class="switch">
            <input
              type="checkbox"
              data-control="${escapeHTML(control.id)}"
              aria-label="${escapeHTML(control.name)}"
              ${APP_STATE.controls[control.id] ? "checked" : ""}
            >

            <span class="switch-track"></span>
          </label>
        </div>
      `;
    }

    card.innerHTML = topMarkup + bodyMarkup;

    return card;
  }

  function renderControls() {
    const container = $("#allControls");

    if (!container) {
      console.warn("Missing #allControls in HTML.");
      return;
    }

    container.innerHTML = "";

    CONTROL_LIST.forEach(control => {
      container.appendChild(createControlCard(control));
    });

    updateControlCounter();
    initializeControlActions();
  }

  function updateControlCardAppearance(id) {
    const card = $(`[data-control-card="${id}"]`);

    if (!card) return;

    const enabled = Boolean(APP_STATE.controls[id]);
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

  function syncControlCheckboxes() {
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

      if (input) {
        input.value = APP_STATE.controlValues[control.id];
      }

      if (output) {
        output.textContent =
          `${APP_STATE.controlValues[control.id]}${control.unit}`;
      }
    });
  }

  function updateControlCounter() {
    const enabledCount = TOGGLE_CONTROLS.filter(
      control => APP_STATE.controls[control.id]
    ).length;

    const totalCount = TOGGLE_CONTROLS.length;

    const activityCount = $("#activityCount");
    const totalControls = $("#totalControls");
    const controlCount = $("#controlCount");

    if (activityCount) {
      activityCount.textContent = String(APP_STATE.logs.length);
    }

    if (totalControls) {
      totalControls.textContent = String(totalCount);
    }

    if (controlCount) {
      controlCount.textContent =
        `${enabledCount}/${totalCount}`;
    }

    const enabledElements = $$("[data-enabled-controls]");
    enabledElements.forEach(element => {
      element.textContent = String(enabledCount);
    });
  }

  // ============================================
  // APPLY AND DISABLE CONTROLS
  // ============================================

  function applyControlSettings() {
    saveControlStates();
    syncControlCheckboxes();
    updateControlCounter();

    addLog("Control settings applied.", "success");
    showToast("Settings applied successfully.", "success");
  }

  function disableAllControls() {
    TOGGLE_CONTROLS.forEach(control => {
      APP_STATE.controls[control.id] = false;
    });

    saveControlStates();
    syncControlCheckboxes();
    updateControlCounter();

    addLog("All toggle controls disabled.", "warning");
    showToast("All controls disabled.", "info");
  }

  function initializeDisableAll() {
    const buttons = [
      $("#disableAll"),
      $("#disableAllControls"),
      $("#resetControls")
    ].filter(Boolean);

    buttons.forEach(button => {
      button.addEventListener("click", event => {
        event.preventDefault();
        disableAllControls();
      });
    });
  }

  // ============================================
  // IMPORT / EXPORT / APPLY TOOLBAR
  // ============================================

  function initializeControlActions() {
    const container = $("#allControls");

    if (!container) return;

    if ($("#controlActionToolbar")) return;

    const toolbar = document.createElement("section");
    toolbar.id = "controlActionToolbar";
    toolbar.className = "control-actions";

    toolbar.innerHTML = `
      <div class="control-section-note">
        <strong>Control Settings</strong>
        <p>Adjust your settings and save your changes.</p>
      </div>

      <div class="control-action-buttons">
        <button
          type="button"
          class="btn btn-primary"
          id="applyControlSettings"
        >
          Apply Settings
        </button>

        <button
          type="button"
          class="btn btn-secondary"
          id="importControlSettings"
        >
          Import Settings
        </button>

        <button
          type="button"
          class="btn btn-secondary"
          id="exportControlSettings"
        >
          Export Settings
        </button>

        <input
          type="file"
          id="importControlFile"
          class="import-control-input"
          accept=".json,application/json"
          hidden
        >
      </div>
    `;

    container.insertAdjacentElement("beforebegin", toolbar);

    $("#applyControlSettings", toolbar).addEventListener(
      "click",
      applyControlSettings
    );

    $("#importControlSettings", toolbar).addEventListener(
      "click",
      () => {
        $("#importControlFile", toolbar).click();
      }
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

    addLog("Settings exported.", "success");
    showToast("Settings file exported.", "success");
  }

  async function handleControlImport(event) {
    const file = event.target.files &&
      event.target.files[0];

    if (!file) return;

    try {
      if (file.size > 1024 * 1024) {
        throw new Error("The selected file is too large.");
      }

      const text = await file.text();
      const data = JSON.parse(text);

      if (!data || typeof data !== "object" ||
          Array.isArray(data)) {
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

      let importedCount = 0;

      TOGGLE_CONTROLS.forEach(control => {
        const value = importedControls[control.id];

        if (typeof value === "boolean") {
          APP_STATE.controls[control.id] = value;
          importedCount++;
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
            clampRangeValue(control, Number(value));

          importedCount++;
        }
      });

      if (!importedCount) {
        throw new Error("No recognized settings found.");
      }

      saveControlStates();
      syncControlCheckboxes();
      updateControlCounter();

      addLog("Settings imported successfully.", "success");
      showToast("Settings imported successfully.", "success");
    } catch (error) {
      console.error(error);
      addLog("Settings import failed.", "error");
      showToast(
        error.message || "Unable to import settings.",
        "error"
      );
    } finally {
      event.target.value = "";
    }
  }

  // ============================================
  // PAGE NAVIGATION
  // ============================================

  const PAGE_INFO = {
    dashboard: {
      title: "Dashboard",
      description: "Your control panel overview"
    },
    controls: {
      title: "Controls",
      description: "Manage your control settings"
    },
    developer: {
      title: "Developer",
      description: "Developer preferences"
    },
    admin: {
      title: "Admin",
      description: "Administration and maintenance"
    },
    logs: {
      title: "Activity Logs",
      description: "Recent panel activity"
    },
    settings: {
      title: "Settings",
      description: "Personalize your panel"
    }
  };

  function navigateToPage(pageName) {
    if (!PAGE_INFO[pageName]) {
      pageName = "dashboard";
    }

    $$("[data-page]").forEach(page => {
      const isActive = page.dataset.page === pageName;

      page.classList.toggle("active", isActive);
      page.hidden = !isActive;
    });

    $$("[data-nav]").forEach(link => {
      const isActive = link.dataset.nav === pageName;

      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    const title = $("#pageTitle");
    const description = $("#pageDescription");
    const info = PAGE_INFO[pageName];

    if (title) title.textContent = info.title;

    if (description) {
      description.textContent = info.description;
    }

    closeSidebar();

    try {
      history.replaceState(null, "", `#${pageName}`);
    } catch (error) {
      // Navigation still works if history is unavailable.
    }

    if (pageName === "logs") {
      renderLogs();
    }

    if (pageName === "controls") {
      updateControlCounter();
    }
  }

  function initializeNavigation() {
    $$("[data-nav]").forEach(link => {
      link.addEventListener("click", event => {
        event.preventDefault();
        navigateToPage(link.dataset.nav);
      });
    });

    $$("[data-page-link]").forEach(link => {
      link.addEventListener("click", event => {
        event.preventDefault();
        navigateToPage(link.dataset.pageLink);
      });
    });

    const initialPage = location.hash.replace("#", "");

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

    if (sidebar) sidebar.classList.add("open");
    if (overlay) overlay.classList.add("visible");

    document.body.classList.add("sidebar-open");
  }

  function closeSidebar() {
    const sidebar = $("#sidebar");
    const overlay = $("#sidebarOverlay");

    if (sidebar) sidebar.classList.remove("open");
    if (overlay) overlay.classList.remove("visible");

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
  }

  // ============================================
  // DEVELOPER SETTINGS
  // ============================================

  function loadDeveloperSettings() {
    try {
      const saved = JSON.parse(
        safeRead(STORAGE.developer, "{}")
      );

      if (!saved || typeof saved !== "object") return;

      APP_STATE.developer = {
        ...APP_STATE.developer,
        ...saved
      };
    } catch (error) {
      console.warn("Developer settings could not be loaded.");
    }
  }

  function initializeDeveloperSettings() {
    const developerMode = $("#developerMode");
    const debugLogging = $("#debugLogging");
    const apiEnvironment = $("#apiEnvironment");
    const saveButton = $("#saveDeveloperSettings");

    if (developerMode) {
      developerMode.checked =
        Boolean(APP_STATE.developer.developerMode);
    }

    if (debugLogging) {
      debugLogging.checked =
        Boolean(APP_STATE.developer.debugLogging);
    }

    if (apiEnvironment) {
      apiEnvironment.value =
        APP_STATE.developer.apiEnvironment || "production";
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
        apiEnvironment: apiEnvironment
          ? apiEnvironment.value
          : "production"
      };

      safeWrite(
        STORAGE.developer,
        JSON.stringify(APP_STATE.developer)
      );

      addLog("Developer settings saved.", "success");
      showToast("Developer settings saved.", "success");
    });
  }

  // ============================================
  // LOGO UPLOAD
  // ============================================

  function setLogoImage(source) {
    [
      $("#splashLogo"),
      $("#sidebarLogo"),
      $("#profileAvatar"),
      $("#developerLogoPreview")
    ].filter(Boolean).forEach(element => {
      if (element.tagName === "IMG") {
        element.src = source;
      } else {
        element.style.backgroundImage =
          `url("${source.replace(/"/g, "%22")}")`;
      }
    });
  }

  function loadCustomLogo() {
    const saved = safeRead(STORAGE.logo);

    if (saved && saved.startsWith("data:image/")) {
      setLogoImage(saved);
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

        if (!file.type.startsWith("image/")) {
          showToast("Please select an image file.", "error");
          return;
        }

        if (file.size > 3 * 1024 * 1024) {
          showToast("Image must be smaller than 3 MB.", "error");
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

          safeWrite(STORAGE.logo, source);
          setLogoImage(source);

          if (status) {
            status.textContent = "Logo updated successfully.";
          }

          addLog("Panel logo updated.", "success");
          showToast("Logo updated successfully.", "success");
        };

        reader.onerror = () => {
          showToast("Unable to read this image.", "error");
        };

        reader.readAsDataURL(file);
      });
    }

    if (reset) {
      reset.addEventListener("click", event => {
        event.preventDefault();

        safeRemove(STORAGE.logo);

        if (status) {
          status.textContent = "Default logo restored.";
        }

        const imageElements = [
          $("#splashLogo"),
          $("#sidebarLogo"),
          $("#profileAvatar"),
          $("#developerLogoPreview")
        ].filter(Boolean);

        imageElements.forEach(element => {
          element.style.backgroundImage = "";

          if (element.tagName === "IMG") {
            element.removeAttribute("src");
          }
        });

        addLog("Panel logo reset.", "info");
        showToast("Default logo restored.", "success");
      });
    }
  }

  // ============================================
  // GENERAL SETTINGS
  // ============================================

  function loadGeneralSettings() {
    try {
      const saved = JSON.parse(
        safeRead(STORAGE.settings, "{}")
      );

      if (saved && typeof saved === "object") {
        APP_STATE.settings = {
          ...APP_STATE.settings,
          ...saved
        };
      }
    } catch (error) {
      console.warn("General settings could not be loaded.");
    }

    const storedTheme = safeRead(STORAGE.theme);

    if (storedTheme) {
      APP_STATE.settings.theme = storedTheme;
    }
  }

  function applyTheme(theme) {
    const validThemes = ["dark", "light"];

    const selectedTheme = validThemes.includes(theme)
      ? theme
      : "dark";

    APP_STATE.settings.theme = selectedTheme;

    document.documentElement.dataset.theme = selectedTheme;
    document.body.dataset.theme = selectedTheme;

    const selector = $("#themeSelect");

    if (selector) {
      selector.value = selectedTheme;
    }

    safeWrite(STORAGE.theme, selectedTheme);
  }

  function applyGeneralSettings() {
    const nameInput = $("#panelName");
    const versionInput = $("#panelVersion");

    if (nameInput) {
      nameInput.value = APP_STATE.settings.panelName;
    }

    if (versionInput) {
      versionInput.value = APP_STATE.settings.panelVersion;
    }

    const overviewName = $("#overviewPanelName");
    const overviewVersion = $("#overviewVersion");

    if (overviewName) {
      overviewName.textContent =
        APP_STATE.settings.panelName;
    }

    if (overviewVersion) {
      overviewVersion.textContent =
        APP_STATE.settings.panelVersion;
    }

    const title = $("#sidebarPanelName");

    if (title) {
      title.textContent = APP_STATE.settings.panelName;
    }

    const versionBadge = $("#panelVersionBadge");

    if (versionBadge) {
      versionBadge.textContent =
        APP_STATE.settings.panelVersion;
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
      });
    }

    if (!saveButton) return;

    saveButton.addEventListener("click", event => {
      event.preventDefault();

      const nameInput = $("#panelName");
      const versionInput = $("#panelVersion");

      APP_STATE.settings.panelName =
        nameInput && nameInput.value.trim()
          ? nameInput.value.trim().slice(0, 60)
          : "JUNAID ABBASI";

      APP_STATE.settings.panelVersion =
        versionInput && versionInput.value.trim()
          ? versionInput.value.trim().slice(0, 20)
          : "1.0.0";

      APP_STATE.settings.theme =
        themeSelector ? themeSelector.value : "dark";

      safeWrite(
        STORAGE.settings,
        JSON.stringify(APP_STATE.settings)
      );

      applyGeneralSettings();

      if (status) {
        status.textContent = "Settings saved successfully.";
      }

      addLog("Panel settings saved.", "success");
      showToast("Settings saved successfully.", "success");
    });
  }

  // ============================================
  // ADMIN ACTIONS
  // ============================================

  function initializeAdminActions() {
    $$("[data-admin-action]").forEach(button => {
      button.addEventListener("click", event => {
        event.preventDefault();

        const action = button.dataset.adminAction;

        switch (action) {
          case "clear-logs":
          case "clearLogs":
            clearActivityLogs();
            break;

          case "reset-controls":
          case "resetControls":
            resetControlSettings();
            break;

          case "reset-settings":
          case "resetSettings":
            resetGeneralSettings();
            break;

          case "refresh":
          case "refresh-panel":
            renderControls();
            renderLogs();
            updateControlCounter();
            showToast("Panel refreshed.", "success");
            addLog("Panel refreshed.", "info");
            break;

          default:
            showToast("Action is not available.", "warning");
        }
      });
    });
  }

  function clearActivityLogs() {
    APP_STATE.logs = [];
    saveLogs();
    renderLogs();
    updateControlCounter();

    showToast("Activity logs cleared.", "success");
  }

  function resetControlSettings() {
    CONTROL_LIST.forEach(control => {
      if (control.type === "toggle") {
        APP_STATE.controls[control.id] =
          control.defaultValue;
      } else {
        APP_STATE.controlValues[control.id] =
          control.defaultValue;
      }
    });

    saveControlStates();
    renderControls();

    addLog("Control settings reset.", "warning");
    showToast("Control settings reset.", "success");
  }

  function resetGeneralSettings() {
    APP_STATE.settings = {
      panelName: "JUNAID ABBASI",
      panelVersion: "1.0.0",
      theme: "dark"
    };

    safeWrite(
      STORAGE.settings,
      JSON.stringify(APP_STATE.settings)
    );

    applyGeneralSettings();

    addLog("Panel settings reset.", "warning");
    showToast("Panel settings reset.", "success");
  }

  // ============================================
  // CLEAR LOG BUTTON
  // ============================================

  function initializeClearLogs() {
    const button = $("#clearLogs");

    if (!button) return;

    button.addEventListener("click", event => {
      event.preventDefault();
      clearActivityLogs();
    });
  }

  // ============================================
  // GLOBAL CONTROL EVENTS
  // ============================================

  function initializeControlEvents() {
    document.addEventListener("change", event => {
      const checkbox = event.target.closest("[data-control]");

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
          `${control ? control.name : id}: ${
            checkbox.checked ? "Enabled" : "Disabled"
          }`,
          checkbox.checked ? "success" : "info"
        );

        return;
      }

      const rangeInput = event.target.closest(
        "[data-range-control]"
      );

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
        rangeInput.value = value;

        const output = $(
          `[data-range-value="${id}"]`
        );

        if (output) {
          output.textContent =
            `${value}${control.unit}`;
        }

        saveControlStates();

        addLog(
          `${control.name} changed to ${value}${control.unit}.`,
          "info"
        );
      }
    });

    document.addEventListener("input", event => {
      const rangeInput = event.target.closest(
        "[data-range-control]"
      );

      if (!rangeInput) return;

      const id = rangeInput.dataset.rangeControl;

      const control = RANGE_CONTROLS.find(
        item => item.id === id
      );

      if (!control) return;

      const value = clampRangeValue(
        control,
        Number(rangeInput.value)
      );

      const output = $(
        `[data-range-value="${id}"]`
      );

      if (output) {
        output.textContent =
          `${value}${control.unit}`;
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

    if (splash || app) {
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

        const modal = $("#modal");

        if (modal) {
          modal.classList.remove("visible", "open");
        }
      }
    });
  }

  // ============================================
  // FOOTER
  // ============================================

  function initializeFooter() {
    const footerYear = $("#footerYear");

    if (footerYear) {
      footerYear.textContent =
        String(new Date().getFullYear());
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