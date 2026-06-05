import { loadStoredCart, loadStoredCheckout } from "./storage.js";

export const state = {
  products: [],
  addons: [],
  category: "all",
  search: "",
  cart: loadStoredCart(),
  modalProduct: null,
  modalQuantity: 1,
  checkout: loadStoredCheckout(),
  lastFocusedElement: null,
};
