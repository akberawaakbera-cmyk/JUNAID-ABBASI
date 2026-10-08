/* =========================================================
   JUNAID ABBASI — CONTROL PANEL
   app.js
   ========================================================= */

"use strict";


/* =========================================================
   CONTROL CONFIGURATION
   ========================================================= */

const CONTROL_LIST = [
  {
    id: "prefire",
    name: "Pre-Fire",
    icon: "PF",
    description: "Pre-fire configuration demo."
  },
  {
    id: "headshot",
    name: "Headshot",
    icon: "HS",
    description: "Headshot configuration demo."
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
    description: "Silent-headshot UI demonstration."
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
    description: "Aim-assist configuration demo."
  },
  {
    id: "sensitivity",
    name: "Sensitivity",
    icon: "SN",
    description: "Sensitivity configuration."
  },
  {
    id: "fov",
    name: "FOV",
    icon: "FV",
    description: "Field-of-view configuration."
  }
];


/* =========================================================
   APPLICATION STATE
   ========================================================= */

const APP_STATE = {
  developerMode: false,
  controls: {},
  logs: []
};


CONTROL_LIST.forEach(control => {
  APP_STATE.controls[control.id] = false;
});


/* =========================================================
   PAGE INFORMATION
   ========================================================= */

const PAGE_INFO = {
  dashboard: {
    title: "Dashboard",
    description:
      "JUNAID ABBASI application control center"
  },

  controls: {
    title: "Control Center",
    description:
      "Configure application demonstration settings"
  },

  developer: {
    title: "Developer Controller",
    description:
      "Developer-only application configuration"
  },

  admin: {
    title: "Admin Controller",
    description:
      "Administrative management tools"
  },

  logs: {
    title: "Activity Logs",
    description:
      "Recent application events"
  },

  settings: {
    title: "Settings",
    description:
      "Customize your panel"
  }
};


/* =========================================================
   DOM HELPERS
   ========================================================= */

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}


/* =========================================================
   PAGE NAVIGATION
   ========================================================= */

function showPage(pageName) {

  const targetPage =
    document.getElementById(pageName);

  if (!targetPage) {
    return;
  }


  /* Hide all pages */

  $$(".page").forEach(page => {
    page.classList.remove("active");
  });


  /* Remove active navigation */

  $$(".nav-item").forEach(item => {
    item.classList.remove("active");
  });


  /* Activate selected page */

  targetPage.classList.add("active");


  const navigationItem =
    document.querySelector(
      `.nav-item[data-page="${pageName}"]`
    );

  if (navigationItem) {
    navigationItem.classList.add("active");
  }


  /* Update page title */

  const info =
    PAGE_INFO[pageName];

  if (info) {

    const title =
      $("#pageTitle");

    const description =
      $("#pageDescription");

    if (title) {
      title.textContent =
        info.title;
    }

    if (description) {
      description.textContent =
        info.description;
    }
  }


  addLog(
    `Opened ${info?.title || pageName}`
  );
}


/* =========================================================
   NAVIGATION EVENTS
   ========================================================= */

function initializeNavigation() {

  $$(".nav-item").forEach(item => {

    item.addEventListener(
      "click",
      () => {

        const page =
          item.dataset.page;

        showPage(page);

      }
    );

  });

}


/* =========================================================
   CONTROL CARD
   ========================================================= */

function createControlCard(control) {

  const card =
    document.createElement("div");

  card.className =
    "control-card";

  card.dataset.controlCard =
    control.id;


  card.innerHTML = `
    <div class="control-icon">
      ${control.icon}
    </div>

    <h4>${control.name}</h4>

    <p>${control.description}</p>

    <label class="switch-row">

      <span class="status-label">
        Disabled
      </span>

      <input
        type="checkbox"
        data-control="${control.id}"
      >

      <i></i>

    </label>
  `;


  const checkbox =
    card.querySelector(
      "input[data-control]"
    );

  const status =
    card.querySelector(
      ".status-label"
    );


  checkbox.addEventListener(
    "change",
    () => {

      const enabled =
        checkbox.checked;


      APP_STATE.controls[
        control.id
      ] = enabled;


      status.textContent =
        enabled
          ? "Enabled"
          : "Disabled";


      addLog(
        `${control.name} ${
          enabled
            ? "enabled"
            : "disabled"
        }`
      );


      updateControlCounter();

    }
  );


  return card;
}


/* =========================================================
   RENDER CONTROL CARDS
   ========================================================= */

function renderControls() {

  const quickControls =
    $("#quickControls");

  const allControls =
    $("#allControls");


  if (!quickControls ||
      !allControls) {

    return;
  }


  quickControls.innerHTML = "";
  allControls.innerHTML = "";


  CONTROL_LIST.forEach(control => {

    quickControls.appendChild(
      createControlCard(control)
    );


    allControls.appendChild(
      createControlCard(control)
    );

  });


  updateControlCounter();

}


/* =========================================================
   CONTROL COUNTER
   ========================================================= */

function updateControlCounter() {

  const counter =
    $("#controlCount");


  if (!counter) {
    return;
  }


  const enabled =
    Object.values(
      APP_STATE.controls
    ).filter(Boolean).length;


  counter.textContent =
    enabled;

}


/* =========================================================
   DISABLE ALL
   ========================================================= */

function disableAllControls() {

  CONTROL_LIST.forEach(control => {

    APP_STATE.controls[
      control.id
    ] = false;

  });


  $$("[data-control]").forEach(
    checkbox => {

      checkbox.checked = false;

      const status =
        checkbox
          .closest(".switch-row")
          ?.querySelector(
            ".status-label"
          );

      if (status) {
        status.textContent =
          "Disabled";
      }

    }
  );


  updateControlCounter();


  addLog(
    "All controls disabled"
  );

}


/* =========================================================
   DEVELOPER MODE
   ========================================================= */

function initializeDeveloperMode() {

  const toggle =
    $("#developerMode");


  if (!toggle) {
    return;
  }


  toggle.addEventListener(
    "change",
    () => {

      APP_STATE.developerMode =
        toggle.checked;


      addLog(
        `Developer Mode ${
          toggle.checked
            ? "enabled"
            : "disabled"
        }`
      );

    }
  );

}


/* =========================================================
   ACTIVITY LOG SYSTEM
   ========================================================= */

function addLog(message) {

  const timestamp =
    new Date().toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }
    );


  APP_STATE.logs.unshift({
    message,
    timestamp
  });


  /* Maximum 50 logs */

  if (
    APP_STATE.logs.length > 50
  ) {

    APP_STATE.logs =
      APP_STATE.logs.slice(0, 50);

  }


  renderLogs();

}


/* =========================================================
   RENDER LOGS
   ========================================================= */

function renderLogs() {

  const container =
    $("#logsContainer");


  if (!container) {
    return;
  }


  container.innerHTML = "";


  APP_STATE.logs.forEach(log => {

    const item =
      document.createElement("div");

    item.className =
      "log-item";


    item.innerHTML = `
      <span class="log-time">
        ${escapeHTML(log.timestamp)}
      </span>

      <span class="log-success">
        SYSTEM
      </span>

      <span>
        ${escapeHTML(log.message)}
      </span>
    `;


    container.appendChild(item);

  });

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   ADMIN BUTTONS
   ========================================================= */

function initializeAdminButtons() {

  $$(".admin-card button")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const card =
            button.closest(
              ".admin-card"
            );

          const title =
            card
              ?.querySelector("h3")
              ?.textContent ||
            "Admin module";


          addLog(
            `${title} opened`
          );


          const oldText =
            button.textContent;


          button.textContent =
            "Opened ✓";


          setTimeout(() => {

            button.textContent =
              oldText;

          }, 1200);

        }
      );

    });

}


/* =========================================================
   SETTINGS
   ========================================================= */

function initializeSettings() {

  const saveButton =
    $("#settings .primary-button");


  if (!saveButton) {
    return;
  }


  saveButton.addEventListener(
    "click",
    () => {

      const inputs =
        $$("#settings input");


      const panelName =
        inputs[0]?.value ||
        "JUNAID ABBASI";


      addLog(
        `Settings saved for ${panelName}`
      );


      const oldText =
        saveButton.textContent;


      saveButton.textContent =
        "Saved ✓";


      setTimeout(() => {

        saveButton.textContent =
          oldText;

      }, 1500);

    }
  );

}


/* =========================================================
   THEME
   ========================================================= */

function initializeTheme() {

  const themeSelect =
    $("#settings .select");


  if (!themeSelect) {
    return;
  }


  themeSelect.addEventListener(
    "change",
    () => {

      const theme =
        themeSelect.value;


      document.body.dataset.theme =
        theme.toLowerCase();


      addLog(
        `${theme} theme selected`
      );

    }
  );

}


/* =========================================================
   KEYBOARD SHORTCUT
   ========================================================= */

function initializeKeyboard() {

  document.addEventListener(
    "keydown",
    event => {

      /*
       * ESC returns to dashboard.
       */

      if (
        event.key === "Escape"
      ) {

        showPage(
          "dashboard"
        );

      }

    }
  );

}


/* =========================================================
   DISABLE ALL BUTTON
   ========================================================= */

function initializeDisableButton() {

  const button =
    $("#disableAll");


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    disableAllControls
  );

}


/* =========================================================
   APPLICATION START
   ========================================================= */

function initializeApplication() {

  initializeNavigation();

  renderControls();

  initializeDeveloperMode();

  initializeAdminButtons();

  initializeSettings();

  initializeTheme();

  initializeKeyboard();

  initializeDisableButton();


  addLog(
    "JUNAID ABBASI Panel initialized"
  );


  console.log(
    "JUNAID ABBASI Panel initialized successfully."
  );

}


/* =========================================================
   DOM READY
   ========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeApplication
  );

} else {

  initializeApplication();

}