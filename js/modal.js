import { addonGroupLabels, addonGroupOrder } from "./config.js";
import {
  itemNote,
  modal,
  modalAddons,
  modalDescription,
  modalDetails,
  modalImage,
  modalOldPrice,
  modalPrice,
  modalQuantity,
  modalRating,
  modalTags,
  modalTitle,
  modalTotal,
} from "./dom.js";
import { addItemToCart, openCart } from "./cart.js";
import { availableAddonsForProduct } from "./addons.js";
import { state } from "./state.js";
import { restoreFocus, setBackgroundInert, showToast } from "./ui.js";
import { escapeHtml, focusFirstElement, formatPrice } from "./utils.js";

export function renderModalAddons(product = state.modalProduct) {
  const availableAddons = availableAddonsForProduct(product);
  const groupedAddons = addonGroupOrder
    .map((group) => ({
      group,
      items: availableAddons.filter((addon) => addon.group === group),
    }))
    .filter((groupData) => groupData.items.length);

  if (!groupedAddons.length) {
    modalAddons.innerHTML = '<p class="menu-status">Nenhum opcional disponível para esta categoria.</p>';
    return;
  }

  modalAddons.innerHTML = groupedAddons
    .map(
      ({ group, items }) => `
        <section class="addon-group">
          <h4>${escapeHtml(addonGroupLabels[group] || "Opcionais")}</h4>
          <div class="addon-options-grid">
            ${items
              .map(
                (addon) => `
                  <article class="addon-option" data-addon-id="${escapeHtml(addon.id)}">
                    <div class="addon-copy">
                      <strong>${escapeHtml(addon.icon)} ${escapeHtml(addon.name)}</strong>
                      <span>+${formatPrice(addon.price)}</span>
                    </div>
                    <div class="addon-stepper" aria-label="Quantidade de ${escapeHtml(addon.name)}">
                      <button type="button" data-addon-minus="${escapeHtml(addon.id)}" aria-label="Diminuir ${escapeHtml(addon.name)}">−</button>
                      <strong data-addon-quantity="${escapeHtml(addon.id)}">0</strong>
                      <button type="button" data-addon-plus="${escapeHtml(addon.id)}" aria-label="Aumentar ${escapeHtml(addon.name)}">+</button>
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
        </section>
      `
    )
    .join("");

  syncAddonOptionState();
}

function findAddonQuantityElement(addonId) {
  return [...document.querySelectorAll("[data-addon-quantity]")].find(
    (element) => element.dataset.addonQuantity === addonId
  );
}

function selectedAddons() {
  return [...document.querySelectorAll("[data-addon-quantity]")]
    .map((element) => {
      const quantity = Math.max(0, Number(element.textContent || 0));
      const addon = state.addons.find((item) => item.id === element.dataset.addonQuantity);

      return addon && quantity > 0
        ? {
            ...addon,
            quantity,
          }
        : null;
    })
    .filter(Boolean);
}

function syncAddonOptionState() {
  document.querySelectorAll("[data-addon-id]").forEach((card) => {
    const quantityElement = card.querySelector("[data-addon-quantity]");
    const quantity = Math.max(0, Number(quantityElement?.textContent || 0));
    const minusButton = card.querySelector("[data-addon-minus]");

    card.classList.toggle("selected", quantity > 0);
    if (minusButton) {
      minusButton.disabled = quantity <= 0;
    }
  });
}

export function updateAddonQuantity(addonId, amount) {
  const quantityElement = findAddonQuantityElement(addonId);
  if (!quantityElement) {
    return;
  }

  const currentQuantity = Math.max(0, Number(quantityElement.textContent || 0));
  quantityElement.textContent = Math.max(0, currentQuantity + amount);
  syncAddonOptionState();
  updateModalTotal();
}

function modalUnitTotal() {
  if (!state.modalProduct) {
    return 0;
  }

  return (
    state.modalProduct.price +
    selectedAddons().reduce(
      (total, addon) => total + Number(addon.price) * Number(addon.quantity || 1),
      0
    )
  );
}

export function updateModalTotal() {
  modalQuantity.textContent = state.modalQuantity;
  modalTotal.textContent = formatPrice(modalUnitTotal() * state.modalQuantity);
}

export function changeModalQuantity(amount) {
  state.modalQuantity = Math.max(1, state.modalQuantity + amount);
  updateModalTotal();
}

function renderModalDetails(product) {
  const details = product.details;
  const tags = [details.badge, ...details.tags]
    .filter(Boolean)
    .map((tag) => `<span>${escapeHtml(tag)}</span>`)
    .join("");

  modalTags.innerHTML = tags;
  modalDetails.innerHTML = `
    <div>
      <dt>Ingredientes</dt>
      <dd>${escapeHtml(details.ingredients.join(", ") || "Ingredientes selecionados da casa")}</dd>
    </div>
    <div>
      <dt>Preparo</dt>
      <dd>${escapeHtml(details.prepTime)}</dd>
    </div>
    <div>
      <dt>Serve</dt>
      <dd>${escapeHtml(details.serves)}</dd>
    </div>
  `;
}

export function openProduct(productId) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) {
    return;
  }

  state.lastFocusedElement = document.activeElement;
  state.modalProduct = product;
  state.modalQuantity = 1;
  modalImage.src = product.image;
  modalImage.alt = product.name;
  modalTitle.textContent = product.name;
  modalDescription.textContent = product.description;
  modalOldPrice.textContent = product.oldPrice ? formatPrice(product.oldPrice) : "";
  modalPrice.textContent = formatPrice(product.price);
  modalRating.textContent = `⭐ ${product.rating.toFixed(1)}`;
  itemNote.value = "";
  renderModalDetails(product);
  renderModalAddons(product);
  updateModalTotal();
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("locked");
  setBackgroundInert(true);
  focusFirstElement(modal);
}

export function closeProduct() {
  if (!modal.classList.contains("open")) {
    return;
  }

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  state.modalProduct = null;
  document.body.classList.remove("locked");
  setBackgroundInert(false);
  restoreFocus();
}

export function addModalToCart() {
  if (!state.modalProduct) {
    return;
  }

  const pickedAddons = selectedAddons();
  const note = itemNote.value.trim();
  const addedName = state.modalProduct.name;
  const addedQuantity = state.modalQuantity;

  addItemToCart(state.modalProduct, pickedAddons, note, state.modalQuantity);
  closeProduct();
  openCart();
  showToast(`${addedQuantity}x ${addedName} no carrinho`);
}
