import { loadCatalog } from "./catalog.js";
import { applyCheckoutFields, renderCart } from "./cart.js";
import { bindEvents } from "./events.js";
import { initAccessibilityMenu } from "./accessibility.js";
import { initTheme } from "./theme.js";

export function initApp() {
  initTheme();
  initAccessibilityMenu();
  bindEvents();
  applyCheckoutFields();
  renderCart();
  loadCatalog();
}
