import { setTheme, currentTheme } from "./theme.js";

const STORAGE_KEY = "villa-burger-accessibility-v1";

const defaultPreferences = {
  fontScale: 1,
  contrast: false,
  spacing: false,
  readable: false,
  focus: false,
  links: false,
  motion: false,
};

const fontSteps = [0.9, 1, 1.1, 1.2, 1.3];

let preferences = { ...defaultPreferences };

export function initAccessibilityMenu() {
  preferences = loadPreferences();
  applyPreferences();
  bindAccessibilityEvents();
  syncControls();
}

function bindAccessibilityEvents() {
  document.addEventListener("click", (event) => {
    const toggleButton = event.target.closest("[data-accessibility-toggle]");
    if (toggleButton) {
      togglePanel();
      return;
    }

    if (event.target.closest("[data-accessibility-close]")) {
      closePanel();
      return;
    }

    const togglePreference = event.target.closest("[data-a11y-toggle]");
    if (togglePreference) {
      const key = togglePreference.dataset.a11yToggle;

      // O tema claro e do site inteiro, nao uma preferencia so deste menu.
      if (key === "light") {
        const isLight = currentTheme() === "light";
        setTheme(isLight ? "dark" : "light");
        announce(isLight ? "Tema escuro ativado" : "Tema claro ativado");
        return;
      }

      preferences[key] = !preferences[key];
      saveAndApply(`${togglePreference.textContent.trim()} ${preferences[key] ? "ativado" : "desativado"}`);
      return;
    }

    const actionButton = event.target.closest("[data-a11y-action]");
    if (actionButton) {
      updateFontScale(actionButton.dataset.a11yAction === "font-increase" ? 1 : -1);
      return;
    }

    if (event.target.closest("[data-a11y-reset]")) {
      preferences = { ...defaultPreferences };
      setTheme(null);
      saveAndApply("Preferências de acessibilidade restauradas");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && getPanel()?.hidden === false) {
      closePanel();
    }
  });
}

function loadPreferences() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const loadedPreferences = {
      ...defaultPreferences,
      ...(stored && typeof stored === "object" ? stored : {}),
    };
    return normalizePreferences(loadedPreferences);
  } catch {
    return { ...defaultPreferences };
  }
}

function normalizePreferences(loadedPreferences) {
  const fontScale = Number(loadedPreferences.fontScale);
  return {
    ...defaultPreferences,
    ...loadedPreferences,
    fontScale: fontSteps.includes(fontScale) ? fontScale : defaultPreferences.fontScale,
    contrast: Boolean(loadedPreferences.contrast),
    spacing: Boolean(loadedPreferences.spacing),
    readable: Boolean(loadedPreferences.readable),
    focus: Boolean(loadedPreferences.focus),
    links: Boolean(loadedPreferences.links),
    motion: Boolean(loadedPreferences.motion),
  };
}

function persistPreferences() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

function saveAndApply(message) {
  persistPreferences();
  applyPreferences();
  syncControls();
  announce(message);
}

function applyPreferences() {
  const root = document.documentElement;
  const body = document.body;

  root.style.setProperty("--a11y-font-scale", String(preferences.fontScale));
  root.dataset.a11yMotion = String(preferences.motion);
  body.dataset.a11yContrast = String(preferences.contrast);
  body.dataset.a11ySpacing = String(preferences.spacing);
  body.dataset.a11yReadable = String(preferences.readable);
  body.dataset.a11yFocus = String(preferences.focus);
  body.dataset.a11yLinks = String(preferences.links);
  body.dataset.a11yMotion = String(preferences.motion);
}

function syncControls() {
  document.querySelectorAll("[data-a11y-toggle]").forEach((button) => {
    const key = button.dataset.a11yToggle;
    if (key === "light") {
      return;
    }
    button.setAttribute("aria-pressed", String(Boolean(preferences[key])));
    button.classList.toggle("active", Boolean(preferences[key]));
  });

  document.querySelectorAll("[data-a11y-font-value]").forEach((element) => {
    element.textContent = `${Math.round(preferences.fontScale * 100)}%`;
  });

  const currentIndex = Math.max(0, fontSteps.indexOf(preferences.fontScale));
  document.querySelectorAll("[data-a11y-action='font-decrease']").forEach((button) => {
    button.disabled = currentIndex <= 0;
  });
  document.querySelectorAll("[data-a11y-action='font-increase']").forEach((button) => {
    button.disabled = currentIndex >= fontSteps.length - 1;
  });
}

function updateFontScale(direction) {
  const currentIndex = Math.max(0, fontSteps.indexOf(preferences.fontScale));
  const nextIndex = Math.min(fontSteps.length - 1, Math.max(0, currentIndex + direction));
  preferences.fontScale = fontSteps[nextIndex];
  saveAndApply(`Tamanho do texto ajustado para ${Math.round(preferences.fontScale * 100)}%`);
}

function togglePanel() {
  const panel = getPanel();
  const button = getToggleButton();
  if (!panel || !button) {
    return;
  }

  const willOpen = panel.hidden;
  panel.hidden = !willOpen;
  button.setAttribute("aria-expanded", String(willOpen));
  if (willOpen) {
    panel.querySelector("button")?.focus();
  } else {
    button.focus();
  }
}

function closePanel() {
  const panel = getPanel();
  const button = getToggleButton();
  if (!panel || panel.hidden) {
    return;
  }

  panel.hidden = true;
  button?.setAttribute("aria-expanded", "false");
  button?.focus();
}

function getPanel() {
  return document.querySelector("[data-accessibility-panel]");
}

function getToggleButton() {
  return document.querySelector("[data-accessibility-toggle]");
}

function announce(message) {
  const status = document.querySelector("[data-a11y-status]");
  if (status) {
    status.textContent = message;
  }
}
