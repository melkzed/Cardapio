import { toast } from "./dom.js";
import { state } from "./state.js";

let toastTimer;

export function setCartExpanded(isOpen) {
  document.querySelectorAll(".cart-button").forEach((button) => {
    button.setAttribute("aria-expanded", String(isOpen));
  });
}

export function setBackgroundInert(isInert) {
  document
    .querySelectorAll(".topbar, .mobile-nav, main, .site-footer, .floating-whatsapp, .accessibility-widget")
    .forEach((element) => {
      if (isInert) {
        element.setAttribute("inert", "");
      } else {
        element.removeAttribute("inert");
      }
    });
}

export function restoreFocus() {
  const target = state.lastFocusedElement;
  state.lastFocusedElement = null;
  if (target && typeof target.focus === "function" && document.contains(target)) {
    target.focus();
  }
}

export function showToast(message) {
  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2200);
}

export function toggleMobileMenu() {
  const mobileNav = document.querySelector(".mobile-nav");
  const menuButton = document.querySelector(".menu-button");
  const isOpen = !mobileNav.classList.contains("open");
  mobileNav.classList.toggle("open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
}

export function closeMobileMenu() {
  document.querySelector(".mobile-nav")?.classList.remove("open");
  document.querySelector(".menu-button")?.setAttribute("aria-expanded", "false");
}
