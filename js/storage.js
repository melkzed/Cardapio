import { CART_STORAGE_KEY, CHECKOUT_STORAGE_KEY } from "./config.js";
import { safeJsonParse } from "./utils.js";

export function loadStoredCart() {
  const stored = localStorage.getItem(CART_STORAGE_KEY);
  const cart = safeJsonParse(stored, []);
  return Array.isArray(cart) ? cart : [];
}

export function loadStoredCheckout() {
  const stored = localStorage.getItem(CHECKOUT_STORAGE_KEY);
  const parsed = safeJsonParse(stored, {});
  return {
    fulfillment: parsed.fulfillment === "pickup" ? "pickup" : "delivery",
    name: parsed.name || "",
    phone: parsed.phone || "",
    address: parsed.address || "",
    reference: parsed.reference || "",
    payment: parsed.payment || "Pix",
    changeFor: parsed.changeFor || "",
  };
}

export function persistCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

export function persistCheckout(checkout) {
  localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(checkout));
}
