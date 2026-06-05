import { focusableSelector, money, SITE_URL } from "./config.js";

export function formatPrice(value) {
  return money.format(Number(value || 0)).replace(/\u00a0/g, " ");
}

export function absoluteUrl(path) {
  return new URL(path, SITE_URL).href;
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function safeJsonParse(value, fallback) {
  if (value == null || value === "") {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function focusFirstElement(container) {
  const focusable = [...container.querySelectorAll(focusableSelector)].filter(
    (element) => element.offsetParent !== null || element === document.activeElement
  );
  focusable[0]?.focus();
}

export function trapFocus(event, container) {
  if (event.key !== "Tab" || !container) {
    return;
  }

  const focusable = [...container.querySelectorAll(focusableSelector)].filter(
    (element) => element.offsetParent !== null
  );
  if (!focusable.length) {
    event.preventDefault();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
