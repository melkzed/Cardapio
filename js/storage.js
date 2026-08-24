import { CART_STORAGE_KEY, CHECKOUT_STORAGE_KEY } from "./config.js";
import { safeJsonParse } from "./utils.js";

// Navegador em aba anonima, cookies bloqueados ou webview restrita fazem o
// acesso ao localStorage lancar excecao. Sem esta protecao o site inteiro
// deixaria de carregar, entao o carrinho cai para memoria e o pedido continua.
const memoryFallback = new Map();
let storageAvailable = true;

function readValue(key) {
  if (storageAvailable) {
    try {
      return localStorage.getItem(key);
    } catch {
      storageAvailable = false;
    }
  }
  return memoryFallback.get(key) ?? null;
}

function writeValue(key, value) {
  memoryFallback.set(key, value);
  if (!storageAvailable) {
    return;
  }

  try {
    localStorage.setItem(key, value);
  } catch {
    storageAvailable = false;
  }
}

export function loadStoredCart() {
  const cart = safeJsonParse(readValue(CART_STORAGE_KEY), []);
  return Array.isArray(cart) ? cart : [];
}

export function loadStoredCheckout() {
  const parsed = safeJsonParse(readValue(CHECKOUT_STORAGE_KEY), {});
  const stored = parsed && typeof parsed === "object" ? parsed : {};

  return {
    fulfillment: stored.fulfillment === "delivery" ? "delivery" : "local",
    name: stored.name || "",
    phone: stored.phone || "",
    address: stored.address || "",
    reference: stored.reference || "",
    payment: stored.payment || "Pix",
    changeFor: stored.changeFor || "",
  };
}

export function persistCart(cart) {
  writeValue(CART_STORAGE_KEY, JSON.stringify(cart));
}

export function persistCheckout(checkout) {
  writeValue(CHECKOUT_STORAGE_KEY, JSON.stringify(checkout));
}

export function readPreference(key) {
  return readValue(key);
}

export function persistPreference(key, value) {
  writeValue(key, value);
}
