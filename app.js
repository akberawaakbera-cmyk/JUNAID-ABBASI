/* =========================================================
   JUNAID ABBASI — CONTROL PANEL
   Developer: LAWANGEN
   UI DEMO ONLY
   ========================================================= */

"use strict";


/* ===================== CONFIGURATION ===================== */

const CONTROL_LIST = [
  {
    id: "prefire",
    name: "Pre-Fire",
    icon: "PF",
    description: "Pre-fire interface demonstration."
  },
  {
    id: "headshot",
    name: "Headshot",
    icon: "HS",
    description: "Headshot interface demonstration."
  },
  {
    id: "esp-line",
    name: "ESP Line",
    icon: "ES",
    description: "ESP line interface demonstration."
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
    description: "Aim-assist interface demonstration."
  },
  {
    id: "sensitivity",
    name: "Sensitivity",
    icon: "SN",
    description: "Sensitivity interface setting."
  },
  {
    id: "fov",
    name: "FOV",
    icon: "FV",
    description: "Field-of-view interface setting."
  }
];


const STORAGE_KEYS = {
  logo: "junaidAbbasiCustomLogo",
  settings: "junaidAbbasiPanelSettings",
  theme: "junaidAbbasiTheme"
};


const PAGE_INFO = {
  dashboard: {
    title: "Dashboard",
    description: "JUNAID ABBASI application control center"
  },

  controls: {
    title: "Control Center",
    description: "Configure application demonstration settings"
  },

  developer: {
    title: "Developer Controller",
    description: "Developer configuration — LAWANGEN"
  },

  admin: {
    title: "Admin Controller",
    description: "Administrative management tools"
  },

  logs: {
    title: "Activity Logs",
    description: "Recent application events"
  },

  settings: {
    title: "Settings",
    description: "Customize your panel"
  }
};


const APP_STATE = {
  developerMode: false,
  debugLogging: false,
  controls: {},
  logs: [],
  customLogo: null
};


CONTROL_LIST.forEach(control => {
  APP_STATE.controls[control.id] = false;
});


/* ===================== DOM HELPERS ===================== */

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}


function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn("Browser storage is unavailable.");
    return null;
  }
}


function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn("Could not save browser storage.", error);
    return false;
  }
}


function safeStorageRemove(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn("Could not clear browser storage.", error);
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


/* ===================== ACTIVITY LOGS ===================== */

function addLog(message) {
  const timestamp = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  APP_STATE.logs.unshift({
    message: String(message),
    timestamp
  });

  if (APP_STATE.logs.length > 50) {
    APP_STATE.logs = APP_STATE.logs.slice(0, 50);
  }

  renderLogs();
}


function renderLogs() {
  const container = $("#logsContainer");

  if (!container) return;

  container.innerHTML = "";

  if (APP_STATE.logs.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-logs";
    empty.textContent = "No activity recorded yet.";
    container.appendChild(empty);
    return;
  }

  APP_STATE.logs.forEach(log => {
    const item = document.createElement("div");
    item.className = "log-item";

    const time = document.createElement("span");
    time.className = "log-time";
    time.textContent = log.timestamp;

    const category = document.createElement("span");
    category.className = "log-success";
    category.textContent = "SYSTEM";

    const message = document.createElement("span");
    message.textContent = log.message;

    item.append(time, category, message);
    container.appendChild(item);
  });
}


function initializeLogs() {
  const clearButton = $("#clearLogs");

  if (!clearButton) return;

  clearButton.addEventListener("click", () => {
    APP_STATE.logs = [];
    renderLogs();
    addLog("Activity logs cleared");
  });
}


/* ===================== PAGE NAVIGATION ===================== */

function showPage(pageName) {
  const targetPage = document.getElementById(pageName);

  if (!targetPage) return;

  $$(".page").forEach(page => {
    page.classList.remove("active");
  });

  $$(".nav-item").forEach(item => {
    item.classList.remove("active");
  });

  targetPage.classList.add("active");

  const navItem = document.querySelector(
    `.nav-item[data-page="${pageName}"]`
  );

  if (navItem) {
    navItem.classList.add("active");
  }

  const info = PAGE_INFO[pageName];

  if (info) {
    const title = $("#pageTitle");
    const description = $("#pageDescription");

    if (title) title.textContent = info.title;
    if (description) description.textContent = info.description;
  }

  if (pageName === "logs") {
    renderLogs();
  }

  addLog(`Opened ${info ? info.title : pageName}`);
}


function initializeNavigation() {
  $$(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
      showPage(item.dataset.page);
    });
  });

  $$("[data-open-page]").forEach(button => {
    button.addEventListener("click", () => {
      showPage(button.dataset.openPage);
    });
  });
}


/* ===================== CONTROL CARDS ===================== */

function createControlCard(control, uniqueSuffix) {
  const card = document.createElement("div");

  card.className = "control-card";
  card.dataset.controlCard = control.id;

  const icon = document.createElement("div");
  icon.className = "control-icon";
  icon.textContent = control.icon;

  const heading = document.createElement("h4");
  heading.textContent = control.name;

  const description = document.createElement("p");
  description.textContent = control.description;

  const row = document.createElement("label");
  row.className = "switch-row";

  const status = document.createElement("span");
  status.className = "status-label";
  status.textContent = "Disabled";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.dataset.control = control.id;
  checkbox.id = `control-${control.id}-${uniqueSuffix}`;

  const slider = document.createElement("i");

  row.append(status, checkbox, slider);
  card.append(icon, heading, description, row);

  checkbox.addEventListener("change", () => {
    const enabled = checkbox.checked;

    APP_STATE.controls[control.id] = enabled;

    updateControlCheckboxes(control.id, enabled);
    updateControlCounter();

    addLog(
      `${control.name} ${enabled ? "enabled" : "disabled"}`
    );
  });

  return card;
}


function updateControlCheckboxes(controlId, enabled) {
  $$(`[data-control="${controlId}"]`).forEach(checkbox => {
    checkbox.checked = enabled;

    const status = checkbox
      .closest(".switch-row")
      ?.querySelector(".status-label");

    if (status) {
      status.textContent = enabled ? "Enabled" : "Disabled";
    }
  });
}


function renderControls() {
  const quickControls = $("#quickControls");
  const allControls = $("#allControls");

  if (!quickControls || !allControls) return;

  quickControls.innerHTML = "";
  allControls.innerHTML = "";

  CONTROL_LIST.forEach(control => {
    quickControls.appendChild(
      createControlCard(control, "quick")
    );

    allControls.appendChild(
      createControlCard(control, "all")
    );
  });

  const total = $("#totalControls");

  if (total) {
    total.textContent = CONTROL_LIST.length;
  }

  updateControlCounter();
}


function updateControlCounter() {
  const counter = $("#controlCount");

  if (!counter) return;

  const enabled = Object.values(APP_STATE.controls)
    .filter(Boolean)
    .length;

  counter.textContent = enabled;
}


function disableAllControls() {
  CONTROL_LIST.forEach(control => {
    APP_STATE.controls[control.id] = false;
    updateControlCheckboxes(control.id, false);
  });

  updateControlCounter();
  addLog("All demonstration controls disabled");
}


function initializeDisableButton() {
  const button = $("#disableAll");

  if (button) {
    button.addEventListener("click", disableAllControls);
  }
}


/* ===================== LOGO SYSTEM ===================== */

function setLogoImage(element, dataURL) {
  if (!element) return;

  const image = element.querySelector(".custom-logo-image");
  const fallback = element.querySelector(".logo-fallback");

  if (!image || !fallback) return;

  if (dataURL) {
    image.src = dataURL;
    image.hidden = false;
    fallback.hidden = true;
  } else {
    image.removeAttribute("src");
    image.hidden = true;
    fallback.hidden = false;
  }
}


function applyLogo(dataURL) {
  APP_STATE.customLogo = dataURL || null;

  const logoElements = [
    $("#splashLogo"),
    $("#brandLogo"),
    $("#profileAvatar"),
    $("#logoPreview")
  ];

  logoElements.forEach(element => {
    setLogoImage(element, APP_STATE.customLogo);
  });

  const status = $("#logoStatus");

  if (status) {
    status.textContent = APP_STATE.customLogo
      ? "Custom logo loaded and saved in this browser."
      : "No custom logo selected. The default JA logo is being used.";
  }
}


function initializeLogo() {
  const upload = $("#logoUpload");
  const resetButton = $("#resetLogo");

  const savedLogo = safeStorageGet(STORAGE_KEYS.logo);

  if (savedLogo && savedLogo.startsWith("data:image/")) {
    applyLogo(savedLogo);
  } else {
    applyLogo(null);
  }

  if (upload) {
    upload.addEventListener("change", event => {
      const file = event.target.files?.[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        upload.value = "";
        return;
      }

      /*
       * Keep uploads small so browser localStorage does not
       * run out of space. Maximum accepted file size: 1.5 MB.
       */
      const maximumSize = 1.5 * 1024 * 1024;

      if (file.size > maximumSize) {
        alert("Please choose an image smaller than 1.5 MB.");
        upload.value = "";
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result;

        if (
          typeof result !== "string" ||
          !result.startsWith("data:image/")
        ) {
          alert("This image could not be loaded.");
          return;
        }

        const saved = safeStorageSet(STORAGE_KEYS.logo, result);

        if (!saved) {
          alert(
            "The logo could not be saved. Try a smaller image or clear browser storage."
          );
          return;
        }

        applyLogo(result);
        addLog("Developer updated the panel logo");
        upload.value = "";
      };

      reader.onerror = () => {
        alert("Could not read this image.");
        upload.value = "";
      };

      reader.readAsDataURL(file);
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      safeStorageRemove(STORAGE_KEYS.logo);
      applyLogo(null);

      if (upload) upload.value = "";

      addLog("Panel logo reset to default");
    });
  }
}


/* ===================== SPLASH SCREEN ===================== */

function initializeSplashScreen() {
  const splash = $("#splashScreen");

  if (!splash) return;

  const hideSplash = () => {
    splash.classList.add("hide");

    window.setTimeout(() => {
      splash.style.display = "none";
    }, 700);
  };

  window.setTimeout(hideSplash, 2300);

  splash.addEventListener("click", hideSplash);
}


/* ===================== DEVELOPER SETTINGS ===================== */

function initializeDeveloperSettings() {
  const developerToggle = $("#developerMode");
  const debugToggle = $("#debugLogging");
  const environmentSelect = $("#apiEnvironment");

  if (developerToggle) {
    developerToggle.addEventListener("change", () => {
      APP_STATE.developerMode = developerToggle.checked;

      const status = developerToggle
        .closest(".switch-row")
        ?.querySelector(".status-label");

      if (status) {
        status.textContent = developerToggle.checked
          ? "Enabled"
          : "Disabled";
      }

      addLog(
        `Developer Mode ${developerToggle.checked ? "enabled" : "disabled"}`
      );
    });
  }

  if (debugToggle) {
    debugToggle.addEventListener("change", () => {
      APP_STATE.debugLogging = debugToggle.checked;

      const status = debugToggle
        .closest(".switch-row")
        ?.querySelector(".status-label");

      if (status) {
        status.textContent = debugToggle.checked
          ? "Enabled"
          : "Disabled";
      }

      addLog(
        `Debug Logging ${debugToggle.checked ? "enabled" : "disabled"}`
      );
    });
  }

  if (environmentSelect) {
    environmentSelect.addEventListener("change", () => {
      addLog(`API display environment set to ${environmentSelect.value}`);
    });
  }
}


/* ===================== ADMIN BUTTONS ===================== */

function initializeAdminButtons() {
  $$(".admin-card button").forEach(button => {
    button.addEventListener("click", () => {
      const card = button.closest(".admin-card");

      const title = card
        ?.querySelector("h3")
        ?.textContent || "Admin module";

      addLog(`${title} opened`);

      const previousText = button.textContent;

      button.textContent = "Opened ✓";

      window.setTimeout(() => {
        button.textContent = previousText;
      }, 1200);
    });
  });
}


/* ===================== SETTINGS ===================== */

function applySettings(settings) {
  if (!settings || typeof settings !== "object") return;

  const panelName = $("#panelName");
  const panelVersion = $("#panelVersion");
  const themeSelect = $("#themeSelect");

  if (panelName && typeof settings.panelName === "string") {
    panelName.value = settings.panelName;
  }

  if (panelVersion && typeof settings.panelVersion === "string") {
    panelVersion.value = settings.panelVersion;
  }

  if (themeSelect && ["Dark", "Light"].includes(settings.theme)) {
    themeSelect.value = settings.theme;
  }

  applyTheme(settings.theme || "Dark");
}


function initializeSettings() {
  const saveButton = $("#saveSettings");

  let savedSettings = {};

  try {
    savedSettings = JSON.parse(
      safeStorageGet(STORAGE_KEYS.settings) || "{}"
    );
  } catch (error) {
    savedSettings = {};
  }

  applySettings(savedSettings);

  const savedTheme = safeStorageGet(STORAGE_KEYS.theme);

  if (savedTheme === "Dark" || savedTheme === "Light") {
    const themeSelect = $("#themeSelect");

    if (themeSelect) {
      themeSelect.value = savedTheme;
    }

    applyTheme(savedTheme);
  }

  if (!saveButton) return;

  saveButton.addEventListener("click", () => {
    const panelName = $("#panelName");
    const panelVersion = $("#panelVersion");
    const themeSelect = $("#themeSelect");

    const settings = {
      panelName: panelName?.value.trim() || "JUNAID ABBASI",
      panelVersion: panelVersion?.value.trim() || "1.0.0",
      theme: themeSelect?.value || "Dark"
    };

    const saved = safeStorageSet(
      STORAGE_KEYS.settings,
      JSON.stringify(settings)
    );

    safeStorageSet(STORAGE_KEYS.theme, settings.theme);

    applyTheme(settings.theme);

    addLog(
      `Settings saved for ${settings.panelName}`
    );

    const oldText = saveButton.textContent;

    saveButton.textContent = saved ? "Saved ✓" : "Applied ✓";

    window.setTimeout(() => {
      saveButton.textContent = oldText;
    }, 1500);
  });

  const themeSelect = $("#themeSelect");

  if (themeSelect) {
    themeSelect.addEventListener("change", () => {
      applyTheme(themeSelect.value);
      safeStorageSet(STORAGE_KEYS.theme, themeSelect.value);
      addLog(`${themeSelect.value} theme selected`);
    });
  }
}


function applyTheme(theme) {
  document.body.dataset.theme = String(theme).toLowerCase();
}


/* ===================== KEYBOARD ===================== */

function initializeKeyboard() {
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      showPage("dashboard");
    }
  });
}


/* ===================== STARTUP ===================== */

function initializeApplication() {
  initializeNavigation();

  renderControls();

  initializeLogo();

  initializeSplashScreen();

  initializeDeveloperSettings();

  initializeAdminButtons();

  initializeSettings();

  initializeLogs();

  initializeKeyboard();

  initializeDisableButton();

  addLog("JUNAID ABBASI Panel initialized");

  console.log(
    "JUNAID ABBASI Control Panel initialized. Developer: LAWANGEN."
  );
}


if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeApplication
  );
} else {
  initializeApplication();
}