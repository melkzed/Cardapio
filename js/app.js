import { loadCatalog } from "./catalog.js";
import { applyCheckoutFields, renderCart } from "./cart.js";
import { bindEvents } from "./events.js";
import { initAccessibilityMenu } from "./accessibility.js";

export function initApp() {
  initAccessibilityMenu();
  bindEvents();
  applyCheckoutFields();
  renderCart();
  loadCatalog();
}
