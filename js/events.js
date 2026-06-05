import { cartDrawer, modal, searchInput } from "./dom.js";
import {
  addBuilderToCart,
  toggleBuilderPanel,
  updateBuilderQuantity,
} from "./builder.js";
import {
  clearCart,
  closeCart,
  finalizeCheckout,
  openCart,
  removeItem,
  updateCheckoutFromFields,
  updateItemQuantity,
  validateCheckout,
} from "./cart.js";
import {
  addModalToCart,
  changeModalQuantity,
  closeProduct,
  openProduct,
  updateAddonQuantity,
} from "./modal.js";
import { closeMobileMenu, toggleMobileMenu } from "./ui.js";
import { renderProducts, setCategory } from "./products.js";
import { state } from "./state.js";
import { trapFocus } from "./utils.js";

export function bindEvents() {
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("change", handleDocumentChange);
  document.addEventListener("input", handleDocumentInput);
  document.addEventListener("keydown", handleDocumentKeydown);
}

function handleDocumentClick(event) {
  const productButton = event.target.closest("[data-open-product]");
  if (productButton) {
    openProduct(productButton.dataset.openProduct);
    return;
  }

  const categoryButton = event.target.closest("[data-category]");
  if (categoryButton) {
    setCategory(categoryButton.dataset.category);
    return;
  }

  if (event.target.closest("[data-clear-filters]")) {
    searchInput.value = "";
    state.search = "";
    setCategory("all");
    return;
  }

  if (event.target.closest("[data-builder-toggle]")) {
    toggleBuilderPanel();
    return;
  }

  const builderMinusButton = event.target.closest("[data-builder-minus]");
  if (builderMinusButton) {
    updateBuilderQuantity(builderMinusButton.dataset.builderMinus, -1);
    return;
  }

  const builderPlusButton = event.target.closest("[data-builder-plus]");
  if (builderPlusButton) {
    updateBuilderQuantity(builderPlusButton.dataset.builderPlus, 1);
    return;
  }

  if (event.target.closest("[data-builder-add]")) {
    addBuilderToCart();
    return;
  }

  if (event.target.closest(".close-modal") || event.target === modal) {
    closeProduct();
    return;
  }

  if (event.target.closest("[data-modal-minus]")) {
    changeModalQuantity(-1);
    return;
  }

  if (event.target.closest("[data-modal-plus]")) {
    changeModalQuantity(1);
    return;
  }

  const addonMinusButton = event.target.closest("[data-addon-minus]");
  if (addonMinusButton) {
    updateAddonQuantity(addonMinusButton.dataset.addonMinus, -1);
    return;
  }

  const addonPlusButton = event.target.closest("[data-addon-plus]");
  if (addonPlusButton) {
    updateAddonQuantity(addonPlusButton.dataset.addonPlus, 1);
    return;
  }

  if (event.target.closest(".add-cart-button")) {
    addModalToCart();
    return;
  }

  if (event.target.closest(".cart-button")) {
    openCart();
    return;
  }

  if (event.target.closest(".close-cart")) {
    closeCart();
    return;
  }

  if (event.target.closest("[data-clear-cart]")) {
    clearCart();
    return;
  }

  const minusButton = event.target.closest("[data-cart-minus]");
  if (minusButton) {
    updateItemQuantity(minusButton.dataset.cartMinus, -1);
    return;
  }

  const plusButton = event.target.closest("[data-cart-plus]");
  if (plusButton) {
    updateItemQuantity(plusButton.dataset.cartPlus, 1);
    return;
  }

  const removeButton = event.target.closest("[data-remove-item]");
  if (removeButton) {
    removeItem(removeButton.dataset.removeItem);
    return;
  }

  if (event.target.closest(".checkout-button")) {
    finalizeCheckout();
    return;
  }

  const whatsappLink = event.target.closest("[data-whatsapp-link]");
  if (whatsappLink && state.cart.length && !validateCheckout()) {
    event.preventDefault();
    openCart();
    return;
  }

  if (event.target.closest(".menu-button")) {
    toggleMobileMenu();
    return;
  }

  if (event.target.closest(".mobile-nav a")) {
    closeMobileMenu();
  }
}

function handleDocumentChange(event) {
  if (
    event.target.matches("[data-fulfillment]") ||
    event.target.matches("[data-payment-method]")
  ) {
    updateCheckoutFromFields();
  }
}

function handleDocumentInput(event) {
  if (event.target.matches("[data-search-input]")) {
    state.search = event.target.value;
    renderProducts();
    return;
  }

  if (
    event.target.matches("[data-customer-name]") ||
    event.target.matches("[data-customer-phone]") ||
    event.target.matches("[data-customer-address]") ||
    event.target.matches("[data-customer-reference]") ||
    event.target.matches("[data-change-for]")
  ) {
    updateCheckoutFromFields();
  }
}

function handleDocumentKeydown(event) {
  const activeTab = event.target.closest("[data-category]");
  if (activeTab && ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
    event.preventDefault();
    const tabs = [...document.querySelectorAll("[data-category]")];
    const currentIndex = tabs.indexOf(activeTab);
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabs.length - 1
          : event.key === "ArrowRight"
            ? (currentIndex + 1) % tabs.length
            : (currentIndex - 1 + tabs.length) % tabs.length;

    tabs[nextIndex].focus();
    setCategory(tabs[nextIndex].dataset.category);
    return;
  }

  if (modal.classList.contains("open")) {
    trapFocus(event, modal);
  } else if (cartDrawer.classList.contains("open")) {
    trapFocus(event, cartDrawer);
  }

  if (event.key === "Escape") {
    closeProduct();
    closeCart();
    closeMobileMenu();
  }
}
