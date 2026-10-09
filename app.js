/* =====================================================
   JUNAID ABBASI — CONTROL PANEL
   app.js
   UI demonstration only
   ===================================================== */

"use strict";


/* =====================================================
   CONFIGURATION
   ===================================================== */

const CONTROL_LIST = [
  {
    id: "prefire",
    name: "Pre-Fire",
    icon: "PF",
    description: "Pre-fire interface configuration demo."
  },
  {
    id: "headshot",
    name: "Headshot",
    icon: "HS",
    description: "Headshot interface configuration demo."
  },
  {
    id: "esp-line",
    name: "ESP Line",
    icon: "ES",
    description: "Visual ESP-line interface demonstration."
  },
  {
    id: "silent-headshot",
    name: "Silent Headshot",
    icon: "SH",
    description: "Silent-headshot interface demonstration."
  },
  {
    id: "aimbot",
    name: "Aimbot",
    icon: "AB",
    description: "Aimbot interface demonstration only."
  },
  {
    id: "aim-assist",
    name: "Aim Assist",
    icon: "AA",
    description: "Aim-assist interface configuration demo."
  },
  {
    id: "sensitivity",
    name: "Sensitivity",
    icon: "SN",
    description: "Sensitivity interface preference demo."
  },
  {
    id: "fov",
    name: "FOV",
    icon: "FV",
    description: "Field-of-view interface configuration demo."
  }
];


const STORAGE_KEYS = {
  logo: "junaidAbbasiCustomLogo",
  settings: "junaidAbbasiPanelSettings",
  developer: "junaidAbbasiDeveloperSettings",
  controls: "junaidAbbasiControlStates",
  theme: "junaidAbbasiTheme"
};


const PAGE_INFO = {
  dashboard: {
    title: "Dashboard",
    description: "Your application overview"
  },

  controls: {
    title: "Control Center",
    description: "Manage demonstration interface controls"
  },

  developer: {
    title: "Developer Workspace",
    description: "Customize your panel configuration"
  },

  admin: {
    title: "Admin Workspace",
    description: "Administrative interface modules"
  },

  logs: {
    title: "Activity Logs",
    description: "Review recent interface events"
  },

  settings: {
    title: "Settings",
    description: "Customize application preferences"
  }
};


const APP_STATE = {
  currentPage: "dashboard",
  developerMode: false,
  debugLogging: true,
  environment: "local",
  controls: {},
  logs: [],
  panelName: "JUNAID ABBASI",
  panelVersion: "1.0.0",
  theme: "dark",
  customLogo: null
};


CONTROL_LIST.forEach(control => {
  APP_STATE.controls[control.id] = false;
});


/* =====================================================
   DOM HELPERS
   ===================================================== */

function $(selector, root = document) {
  return root.querySelector(selector);
}


function $$(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}


function safeRead(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);

    return value === null
      ? fallback
      : value;

  } catch (error) {
    return fallback;
  }
}


function safeWrite(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;

  } catch (error) {
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
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =====================================================
   TOAST NOTIFICATIONS
   ===================================================== */

function showToast(message, type = "success") {
  const container = $("#toastContainer");

  if (!container) {
    return;
  }

  const toast = document.createElement("div");

  toast.className =
    type === "error"
      ? "toast toast-error"
      : "toast";

  toast.textContent = message;

  container.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 3000);
}


/* =====================================================
   ACTIVITY LOGS
   ===================================================== */

function addLog(message, force = false) {
  if (!APP_STATE.debugLogging && !force) {
    return;
  }

  const now = new Date();

  const timestamp = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  APP_STATE.logs.unshift({
    message: String(message),
    timestamp,
    type: "SYSTEM"
  });

  if (APP_STATE.logs.length > 100) {
    APP_STATE.logs.length = 100;
  }

  renderLogs();
  updateDashboardStats();
}


function renderLogs() {
  const container = $("#logsContainer");
  const recent = $("#recentLogs");

  if (container) {
    container.replaceChildren();

    if (APP_STATE.logs.length === 0) {
      const empty = document.createElement("div");

      empty.className = "empty-state";
      empty.textContent = "No activity recorded yet.";

      container.appendChild(empty);

    } else {
      APP_STATE.logs.forEach(log => {
        const row = document.createElement("div");

        row.className = "log-item";

        const time = document.createElement("span");
        time.className = "log-time";
        time.textContent = log.timestamp;

        const type = document.createElement("span");
        type.className = "log-success";
        type.textContent = log.type;

        const message = document.createElement("span");
        message.className = "log-message";
        message.textContent = log.message;

        row.append(time, type, message);
        container.appendChild(row);
      });
    }
  }

  if (recent) {
    recent.replaceChildren();

    if (APP_STATE.logs.length === 0) {
      const empty = document.createElement("div");

      empty.className = "empty-state";
      empty.textContent = "No activity yet.";

      recent.appendChild(empty);

    } else {
      APP_STATE.logs.slice(0, 5).forEach(log => {
        const row = document.createElement("div");
        row.className = "recent-log-row";

        const dot = document.createElement("span");
        dot.className = "recent-log-dot";

        const message = document.createElement("span");
        message.className = "recent-log-text";
        message.textContent = log.message;

        const time = document.createElement("span");
        time.className = "recent-log-time";
        time.textContent = log.timestamp;

        row.append(dot, message, time);
        recent.appendChild(row);
      });
    }
  }
}


/* =====================================================
   PAGE NAVIGATION
   ===================================================== */

function showPage(pageName) {
  const target = document.getElementById(pageName);

  if (!target || !PAGE_INFO[pageName]) {
    return;
  }

  $$(".page").forEach(page => {
    page.classList.toggle("active", page.id === pageName);
  });

  $$(".nav-item").forEach(item => {
    const active = item.dataset.page === pageName;

    item.classList.toggle("active", active);

    if (active) {
      item.setAttribute("aria-current", "page");
    } else {
      item.removeAttribute("aria-current");
    }
  });

  APP_STATE.currentPage = pageName;

  const info = PAGE_INFO[pageName];

  const title = $("#pageTitle");
  const description = $("#pageDescription");

  if (title) {
    title.textContent = info.title;
  }

  if (description) {
    description.textContent = info.description;
  }

  closeMobileSidebar();

  if (pageName === "logs") {
    renderLogs();
  }

  addLog(`Opened ${info.title}`);
}


function initializeNavigation() {
  $$(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
      showPage(item.dataset.page);
    });
  });

  $$("[data-go-page]").forEach(button => {
    button.addEventListener("click", () => {
      showPage(button.dataset.goPage);
    });
  });
}


/* =====================================================
   MOBILE SIDEBAR
   ===================================================== */

function openMobileSidebar() {
  $("#sidebar")?.classList.add("open");
  $("#sidebarOverlay")?.classList.add("visible");

  document.body.style.overflow = "hidden";
}


function closeMobileSidebar() {
  $("#sidebar")?.classList.remove("open");
  $("#sidebarOverlay")?.classList.remove("visible");

  document.body.style.overflow = "";
}


function initializeMobileNavigation() {
  $("#menuButton")?.addEventListener("click", openMobileSidebar);

  $("#closeSidebar")?.addEventListener(
    "click",
    closeMobileSidebar
  );

  $("#sidebarOverlay")?.addEventListener(
    "click",
    closeMobileSidebar
  );

  window.addEventListener("resize", () => {
    if (window.innerWidth > 850) {
      closeMobileSidebar();
    }
  });
}


/* =====================================================
   CONTROL CARD GENERATION
   ===================================================== */

function createControlCard(control) {
  const card = document.createElement("article");

  card.className = "control-card";
  card.dataset.controlCard = control.id;

  const top = document.createElement("div");
  top.className = "control-card-top";

  const icon = document.createElement("div");
  icon.className = "control-icon";
  icon.textContent = control.icon;

  const badge = document.createElement("span");
  badge.className = "control-state-badge";
  badge.dataset.stateBadge = control.id;

  const enabled = Boolean(APP_STATE.controls[control.id]);

  badge.textContent = enabled ? "ENABLED" : "DISABLED";

  top.append(icon, badge);

  const title = document.createElement("h4");
  title.textContent = control.name;

  const description = document.createElement("p");
  description.textContent = control.description;

  const footer = document.createElement("div");
  footer.className = "control-card-footer";

  const status = document.createElement("span");
  status.className = "status-label";
  status.dataset.controlStatus = control.id;
  status.textContent = enabled ? "Enabled" : "Disabled";

  const switchLabel = document.createElement("label");
  switchLabel.className = "switch";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = enabled;
  checkbox.dataset.control = control.id;

  checkbox.setAttribute(
    "aria-label",
    `Toggle ${control.name} demo state`
  );

  const track = document.createElement("span");
  track.className = "switch-track";

  switchLabel.append(checkbox, track);
  footer.append(status, switchLabel);

  card.append(top, title, description, footer);

  updateControlCardAppearance(card, enabled);

  checkbox.addEventListener("change", () => {
    const nextValue = checkbox.checked;

    APP_STATE.controls[control.id] = nextValue;

    syncControlCheckboxes(control.id, nextValue);

    addLog(
      `${control.name} ${
        nextValue ? "enabled" : "disabled"
      }`
    );

    updateControlCounter();
  });

  return card;
}


function renderControls() {
  const container = $("#allControls");

  if (!container) {
    return;
  }

  container.replaceChildren();

  CONTROL_LIST.forEach(control => {
    container.appendChild(createControlCard(control));
  });

  const total = $("#totalControls");

  if (total) {
    total.textContent = CONTROL_LIST.length;
  }

  updateControlCounter();
}


function updateControlCardAppearance(card, enabled) {
  if (!card) {
    return;
  }

  card.classList.toggle("is-enabled", enabled);

  const badge = $("[data-state-badge]", card);
  const status = $("[data-control-status]", card);

  if (badge) {
    badge.textContent = enabled ? "ENABLED" : "DISABLED";
  }

  if (status) {
    status.textContent = enabled ? "Enabled" : "Disabled";
  }
}


function syncControlCheckboxes(controlId, enabled) {
  $$(`[data-control="${controlId}"]`).forEach(checkbox => {
    checkbox.checked = enabled;

    updateControlCardAppearance(
      checkbox.closest(".control-card"),
      enabled
    );
  });
}


function updateControlCounter() {
  const enabledCount = Object.values(APP_STATE.controls)
    .filter(Boolean)
    .length;

  const counter = $("#controlCount");
  const summary = $("#controlsSummary");

  if (counter) {
    counter.textContent = enabledCount;
  }

  if (summary) {
    summary.textContent =
      `${enabledCount} / ${CONTROL_LIST.length} enabled`;
  }

  updateDashboardStats();
}


function disableAllControls() {
  CONTROL_LIST.forEach(control => {
    APP_STATE.controls[control.id] = false;
    syncControlCheckboxes(control.id, false);
  });

  saveControlStates();
  updateControlCounter();

  addLog("All demonstration controls disabled");

  showToast("All demo controls disabled.");
}


function initializeDisableAll() {
  $("#disableAll")?.addEventListener(
    "click",
    disableAllControls
  );
}


/* =====================================================
   SAVE AND RESTORE CONTROL STATES
   ===================================================== */

function saveControlStates() {
  safeWrite(
    STORAGE_KEYS.controls,
    JSON.stringify(APP_STATE.controls)
  );
}


function loadControlStates() {
  try {
    const raw = safeRead(STORAGE_KEYS.controls);

    if (!raw) {
      return;
    }

    const saved = JSON.parse(raw);

    CONTROL_LIST.forEach(control => {
      APP_STATE.controls[control.id] =
        Boolean(saved[control.id]);
    });

  } catch (error) {
    console.warn("Could not restore control states.");
  }
}


/* =====================================================
   DEVELOPER SETTINGS
   ===================================================== */

function loadDeveloperSettings() {
  try {
    const raw = safeRead(STORAGE_KEYS.developer);

    if (!raw) {
      return;
    }

    const saved = JSON.parse(raw);

    APP_STATE.developerMode =
      Boolean(saved.developerMode);

    APP_STATE.debugLogging =
      saved.debugLogging !== false;

    APP_STATE.environment =
      ["local", "development", "production"].includes(
        saved.environment
      )
        ? saved.environment
        : "local";

  } catch (error) {
    console.warn("Could not restore developer preferences.");
  }
}


function initializeDeveloperSettings() {
  const developerToggle = $("#developerMode");
  const debugToggle = $("#debugLogging");
  const environment = $("#apiEnvironment");

  if (developerToggle) {
    developerToggle.checked = APP_STATE.developerMode;

    developerToggle.addEventListener("change", () => {
      APP_STATE.developerMode = developerToggle.checked;

      addLog(
        `Developer mode ${
          APP_STATE.developerMode ? "enabled" : "disabled"
        }`
      );
    });
  }

  if (debugToggle) {
    debugToggle.checked = APP_STATE.debugLogging;

    debugToggle.addEventListener("change", () => {
      APP_STATE.debugLogging = debugToggle.checked;

      addLog(
        `Debug logging ${
          APP_STATE.debugLogging ? "enabled" : "disabled"
        }`,
        true
      );
    });
  }

  if (environment) {
    environment.value = APP_STATE.environment;
  }

  $("#saveDeveloperSettings")?.addEventListener("click", () => {
    APP_STATE.developerMode =
      Boolean($("#developerMode")?.checked);

    APP_STATE.debugLogging =
      Boolean($("#debugLogging")?.checked);

    APP_STATE.environment =
      $("#apiEnvironment")?.value || "local";

    const saved = safeWrite(
      STORAGE_KEYS.developer,
      JSON.stringify({
        developerMode: APP_STATE.developerMode,
        debugLogging: APP_STATE.debugLogging,
        environment: APP_STATE.environment
      })
    );

    if (!saved) {
      showToast(
        "Could not save preferences in this browser.",
        "error"
      );

      return;
    }

    addLog("Developer preferences saved", true);
    showToast("Developer preferences saved.");
  });
}


/* =====================================================
   LOGO SYSTEM
   ===================================================== */

function renderLogoElement(element, imageData) {
  if (!element) {
    return;
  }

  element.replaceChildren();

  if (imageData) {
    const image = document.createElement("img");

    image.src = imageData;
    image.alt = "JUNAID ABBASI logo";

    element.appendChild(image);

  } else {
    element.textContent = "JA";
  }
}


function updateAllLogos() {
  const imageData = APP_STATE.customLogo;

  renderLogoElement($("#splashLogo"), imageData);
  renderLogoElement($("#sidebarLogo"), imageData);
  renderLogoElement($("#profileAvatar"), imageData);
  renderLogoElement($("#developerLogoPreview"), imageData);
}


function loadSavedLogo() {
  const imageData = safeRead(STORAGE_KEYS.logo);

  if (
    typeof imageData === "string" &&
    imageData.startsWith("data:image/")
  ) {
    APP_STATE.customLogo = imageData;
  }

  updateAllLogos();
}


function initializeLogoUpload() {
  const input = $("#developerLogoUpload");
  const resetButton = $("#resetLogo");
  const status = $("#logoStatus");

  if (!input) {
    return;
  }

  input.addEventListener("change", () => {
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/gif"
    ];

    if (!allowedTypes.includes(file.type)) {
      showToast("Choose a PNG, JPG, WEBP or GIF image.", "error");
      input.value = "";
      return;
    }

    /*
      Keep the file small so browser local storage
      is less likely to run out of space.
    */

    const maxBytes = 1024 * 1024;

    if (file.size > maxBytes) {
      showToast(
        "Please choose a logo smaller than 1 MB.",
        "error"
      );

      input.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageData = reader.result;

      if (
        typeof imageData !== "string" ||
        !imageData.startsWith("data:image/")
      ) {
        showToast("Could not read the selected image.", "error");
        return;
      }

      const saved = safeWrite(
        STORAGE_KEYS.logo,
        imageData
      );

      if (!saved) {
        showToast(
          "Browser storage is full. Choose a smaller image.",
          "error"
        );

        return;
      }

      APP_STATE.customLogo = imageData;

      updateAllLogos();

      if (status) {
        status.textContent =
          "Logo saved in this browser.";
      }

      addLog("Application logo updated");

      showToast("Logo updated successfully.");
    };

    reader.onerror = () => {
      showToast("Could not read the selected file.", "error");
    };

    reader.readAsDataURL(file);
  });


  resetButton?.addEventListener("click", () => {
    safeRemove(STORAGE_KEYS.logo);

    APP_STATE.customLogo = null;

    updateAllLogos();

    input.value = "";

    if (status) {
      status.textContent = "Default logo is active.";
    }

    addLog("Default application logo restored");

    showToast("Default logo restored.");
  });
}


/* =====================================================
   GENERAL SETTINGS
   ===================================================== */

function loadGeneralSettings() {
  try {
    const raw = safeRead(STORAGE_KEYS.settings);

    if (!raw) {
      return;
    }

    const saved = JSON.parse(raw);

    if (
      typeof saved.panelName === "string" &&
      saved.panelName.trim()
    ) {
      APP_STATE.panelName = saved.panelName.trim();
    }

    if (
      typeof saved.panelVersion === "string" &&
      saved.panelVersion.trim()
    ) {
      APP_STATE.panelVersion = saved.panelVersion.trim();
    }

    if (saved.theme === "light" || saved.theme === "dark") {
      APP_STATE.theme = saved.theme;
    }

  } catch (error) {
    console.warn("Could not restore general settings.");
  }
}


function applyGeneralSettings() {
  const panelName = $("#panelName");
  const panelVersion = $("#panelVersion");
  const themeSelect = $("#themeSelect");

  if (panelName) {
    panelName.value = APP_STATE.panelName;
  }

  if (panelVersion) {
    panelVersion.value = APP_STATE.panelVersion;
  }

  if (themeSelect) {
    themeSelect.value = APP_STATE.theme;
  }

  document.body.dataset.theme = APP_STATE.theme;

  const overviewName = $("#overviewPanelName");
  const overviewVersion = $("#overviewVersion");

  if (overviewName) {
    overviewName.textContent = APP_STATE.panelName;
  }

  if (overviewVersion) {
    overviewVersion.textContent = APP_STATE.panelVersion;
  }
}


function initializeGeneralSettings() {
  $("#saveSettings")?.addEventListener("click", () => {
    const panelName = $("#panelName");
    const panelVersion = $("#panelVersion");
    const themeSelect = $("#themeSelect");

    const name = panelName?.value.trim() || "";
    const version = panelVersion?.value.trim() || "";

    if (!name) {
      showToast("Please enter a panel name.", "error");
      panelName?.focus();
      return;
    }

    if (!version) {
      showToast("Please enter a panel version.", "error");
      panelVersion?.focus();
      return;
    }

    APP_STATE.panelName = name;
    APP_STATE.panelVersion = version;
    APP_STATE.theme = themeSelect?.value || "dark";

    const saved = safeWrite(
      STORAGE_KEYS.settings,
      JSON.stringify({
        panelName: APP_STATE.panelName,
        panelVersion: APP_STATE.panelVersion,
        theme: APP_STATE.theme
      })
    );

    if (!saved) {
      showToast(
        "Could not save settings in this browser.",
        "error"
      );

      return;
    }

    safeWrite(STORAGE_KEYS.theme, APP_STATE.theme);

    applyGeneralSettings();

    addLog("General settings saved");

    const status = $("#settingsStatus");

    if (status) {
      status.textContent = "Settings saved successfully.";
    }

    showToast("Settings saved successfully.");
  });

  $("#themeSelect")?.addEventListener("change", () => {
    const nextTheme = $("#themeSelect").value;

    if (nextTheme !== "dark" && nextTheme !== "light") {
      return;
    }

    APP_STATE.theme = nextTheme;
    document.body.dataset.theme = nextTheme;

    safeWrite(STORAGE_KEYS.theme, nextTheme);

    addLog(`${nextTheme} theme selected`);
  });
}


/* =====================================================
   ADMIN DEMONSTRATION MODULES
   ===================================================== */

function initializeAdminModules() {
  $$("[data-admin-action]").forEach(button => {
    button.addEventListener("click", () => {
      const moduleName = button.dataset.adminAction;

      addLog(`${moduleName} demonstration module opened`);

      showToast(`${moduleName} is a demonstration module.`);
    });
  });
}


/* =====================================================
   CLEAR LOGS
   ===================================================== */

function initializeClearLogs() {
  $("#clearLogs")?.addEventListener("click", () => {
    APP_STATE.logs = [];

    renderLogs();
    updateDashboardStats();

    showToast("Activity logs cleared.");
  });
}


/* =====================================================
   DASHBOARD STATS
   ===================================================== */

function updateDashboardStats() {
  const activityCount = $("#activityCount");

  if (activityCount) {
    activityCount.textContent = APP_STATE.logs.length;
  }

  const totalControls = $("#totalControls");

  if (totalControls) {
    totalControls.textContent = CONTROL_LIST.length;
  }

  const counter = $("#controlCount");

  if (counter) {
    counter.textContent = Object.values(APP_STATE.controls)
      .filter(Boolean).length;
  }
}


/* =====================================================
   SPLASH SCREEN
   ===================================================== */

function enterApplication() {
  const splash = $("#splashScreen");
  const app = $("#app");

  if (!splash || !app) {
    return;
  }

  splash.classList.add("hidden");
  app.classList.remove("app-hidden");

  window.setTimeout(() => {
    splash.setAttribute("aria-hidden", "true");
  }, 450);
}


function initializeSplash() {
  $("#enterApp")?.addEventListener("click", enterApplication);

  /*
    The splash screen is also dismissed automatically.
    The button allows users to enter immediately.
  */

  window.setTimeout(() => {
    enterApplication();
  }, 2200);
}


/* =====================================================
   KEYBOARD SHORTCUTS
   ===================================================== */

function initializeKeyboard() {
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeMobileSidebar();

      if (window.innerWidth > 850) {
        return;
      }

      if ($("#sidebar")?.classList.contains("open")) {
        return;
      }

      showPage("dashboard");
    }
  });
}


/* =====================================================
   APPLICATION INITIALIZATION
   ===================================================== */

function initializeApplication() {
  /*
    Load preferences before drawing interface components.
  */

  loadGeneralSettings();
  loadDeveloperSettings();
  loadControlStates();
  loadSavedLogo();

  applyGeneralSettings();

  renderControls();
  renderLogs();

  initializeNavigation();
  initializeMobileNavigation();

  initializeDisableAll();

  initializeDeveloperSettings();
  initializeLogoUpload();

  initializeGeneralSettings();
  initializeAdminModules();

  initializeClearLogs();
  initializeKeyboard();
  initializeSplash();

  const footerYear = $("#footerYear");

  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  addLog("JUNAID ABBASI Panel initialized", true);

  console.log(
    "JUNAID ABBASI Control Panel initialized successfully."
  );
}


/* =====================================================
   SAVE CONTROL STATES WHEN CHANGED
   ===================================================== */

document.addEventListener("change", event => {
  if (event.target.matches("[data-control]")) {
    saveControlStates();
  }
});


/* =====================================================
   DOM READY
   ===================================================== */

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeApplication,
    { once: true }
  );

} else {
  initializeApplication();
}