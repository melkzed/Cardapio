import {
  addonGroupLabels,
  addonGroupOrder,
  builderItems,
  builderProduct,
} from "./config.js";
import { addonsGrid } from "./dom.js";
import { addItemToCart, openCart } from "./cart.js";
import { escapeHtml, formatPrice } from "./utils.js";
import { showToast } from "./ui.js";

export function renderAddons() {
  addonsGrid.innerHTML = `
    <div class="builder-shell">
      <button class="primary-action builder-open-button" type="button" data-builder-toggle aria-expanded="false" aria-controls="builder-panel">
        <span aria-hidden="true">🍔</span>
        Montar do meu jeito
      </button>

      <div class="builder-panel" id="builder-panel" data-builder-panel hidden aria-labelledby="builder-panel-title">
        <div class="builder-head">
          <h3 id="builder-panel-title">Seu lanche</h3>
          <strong data-builder-total aria-live="polite">R$ 0,00</strong>
        </div>
        <div class="builder-options" data-builder-options></div>
        <label class="field-label" for="builder-note">Observação</label>
        <textarea id="builder-note" data-builder-note rows="3" placeholder="Ex: Sem alface, molho à parte..."></textarea>
        <button class="add-cart-button builder-add-button" type="button" data-builder-add>
          <span aria-hidden="true">🛒</span>
          Adicionar lanche
          <strong data-builder-total-button aria-live="polite">R$ 0,00</strong>
        </button>
      </div>
    </div>
  `;

  renderBuilderOptions();
  updateBuilderTotal();
}

export function renderBuilderOptions() {
  const builderOptions = document.querySelector("[data-builder-options]");
  if (!builderOptions) {
    return;
  }

  builderOptions.innerHTML = addonGroupOrder
    .map((group) => {
      const items = builderItems.filter((item) => item.group === group);
      if (!items.length) {
        return "";
      }

      return `
        <section class="addon-group" aria-label="${escapeHtml(addonGroupLabels[group] || "Opcionais")} do lanche personalizado">
          <h4>${escapeHtml(addonGroupLabels[group] || "Opcionais")}</h4>
          <div class="addon-options-grid">
            ${items
              .map(
                (item) => `
                  <article class="addon-option" data-builder-item-id="${escapeHtml(item.id)}">
                    <div class="addon-copy">
                      <strong>${escapeHtml(item.icon)} ${escapeHtml(item.name)}</strong>
                      <span>+${formatPrice(item.price)}</span>
                    </div>
                    <div class="addon-stepper" aria-label="Quantidade de ${escapeHtml(item.name)}">
                      <button type="button" data-builder-minus="${escapeHtml(item.id)}" aria-label="Diminuir ${escapeHtml(item.name)}">−</button>
                      <strong data-builder-quantity="${escapeHtml(item.id)}">0</strong>
                      <button type="button" data-builder-plus="${escapeHtml(item.id)}" aria-label="Aumentar ${escapeHtml(item.name)}">+</button>
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
        </section>
      `;
    })
    .join("");

  syncBuilderState();
}

export function selectedBuilderItems() {
  return [...document.querySelectorAll("[data-builder-quantity]")]
    .map((element) => {
      const quantity = Math.max(0, Number(element.textContent || 0));
      const item = builderItems.find((builderItem) => builderItem.id === element.dataset.builderQuantity);

      return item && quantity > 0
        ? {
            ...item,
            quantity,
          }
        : null;
    })
    .filter(Boolean);
}

function builderTotalValue() {
  return selectedBuilderItems().reduce(
    (total, item) => total + Number(item.price) * Number(item.quantity || 1),
    0
  );
}

function syncBuilderState() {
  document.querySelectorAll("[data-builder-item-id]").forEach((card) => {
    const quantityElement = card.querySelector("[data-builder-quantity]");
    const quantity = Math.max(0, Number(quantityElement?.textContent || 0));
    const minusButton = card.querySelector("[data-builder-minus]");

    card.classList.toggle("selected", quantity > 0);
    if (minusButton) {
      minusButton.disabled = quantity <= 0;
    }
  });
}

function updateBuilderTotal() {
  const total = formatPrice(builderTotalValue());
  document.querySelectorAll("[data-builder-total], [data-builder-total-button]").forEach((element) => {
    element.textContent = total;
  });
  syncBuilderState();
}

export function updateBuilderQuantity(itemId, amount) {
  const quantityElement = [...document.querySelectorAll("[data-builder-quantity]")].find(
    (element) => element.dataset.builderQuantity === itemId
  );
  if (!quantityElement) {
    return;
  }

  const currentQuantity = Math.max(0, Number(quantityElement.textContent || 0));
  quantityElement.textContent = Math.max(0, currentQuantity + amount);
  updateBuilderTotal();
}

function resetBuilder() {
  document.querySelectorAll("[data-builder-quantity]").forEach((element) => {
    element.textContent = "0";
  });
  const note = document.querySelector("[data-builder-note]");
  if (note) {
    note.value = "";
  }
  updateBuilderTotal();
}

export function addBuilderToCart() {
  const pickedItems = selectedBuilderItems();
  if (!pickedItems.length) {
    showToast("Escolha pelo menos um item para montar seu lanche");
    return;
  }

  const note = document.querySelector("[data-builder-note]")?.value.trim() || "";
  const product = { ...builderProduct };
  addItemToCart(product, pickedItems, note, 1);
  openCart();
  resetBuilder();
  showToast("Lanche personalizado no carrinho");
}

export function toggleBuilderPanel() {
  const panel = document.querySelector("[data-builder-panel]");
  const button = document.querySelector("[data-builder-toggle]");
  if (!panel) {
    return;
  }

  panel.hidden = !panel.hidden;
  button?.setAttribute("aria-expanded", String(!panel.hidden));
  if (!panel.hidden) {
    const prefersReducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.body.dataset.a11yMotion === "true";
    panel.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
  }
}
