import { THEME_STORAGE_KEY } from "./config.js";
import { persistPreference, readPreference } from "./storage.js";

const themes = ["dark", "light"];
const systemQuery = window.matchMedia("(prefers-color-scheme: light)");

let choice = null; // null = seguir o sistema

function systemTheme() {
  return systemQuery.matches ? "light" : "dark";
}

export function currentTheme() {
  return choice || systemTheme();
}

function applyTheme() {
  const theme = currentTheme();
  document.documentElement.dataset.theme = theme;

  const isLight = theme === "light";
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.setAttribute("aria-pressed", String(isLight));
    button.setAttribute(
      "aria-label",
      isLight ? "Mudar para o tema escuro" : "Mudar para o tema claro"
    );
    const icon = button.querySelector("[data-theme-icon]");
    const label = button.querySelector("[data-theme-label]");
    if (icon) {
      icon.textContent = isLight ? "☀" : "☾";
    }
    if (label) {
      label.textContent = isLight ? "Tema claro" : "Tema escuro";
    }
  });

  // O menu de acessibilidade tem o mesmo controle, entao os dois refletem o
  // mesmo estado em vez de brigar entre si.
  document.querySelectorAll("[data-a11y-toggle='light']").forEach((button) => {
    button.setAttribute("aria-pressed", String(isLight));
    button.classList.toggle("active", isLight);
  });

  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) {
    themeColor.setAttribute("content", isLight ? "#f7f3ea" : "#0d0d0d");
  }
}

export function setTheme(theme) {
  choice = themes.includes(theme) ? theme : null;
  if (choice) {
    persistPreference(THEME_STORAGE_KEY, choice);
  }
  applyTheme();
}

export function toggleTheme() {
  setTheme(currentTheme() === "light" ? "dark" : "light");
}

export function initTheme() {
  const stored = readPreference(THEME_STORAGE_KEY);
  choice = themes.includes(stored) ? stored : null;
  applyTheme();

  // Enquanto o cliente nao escolher, o site acompanha a preferencia do sistema.
  systemQuery.addEventListener("change", () => {
    if (!choice) {
      applyTheme();
    }
  });
}
