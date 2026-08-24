import {
  DELIVERY_FEE_LABEL,
  DELIVERY_FEE_NOTE,
  RESTAURANT_NAME,
  RESTAURANT_WHATSAPP,
} from "./config.js";
import {
  cartBody,
  cartDeliveryFee,
  cartDrawer,
  cartMessage,
  cartSubtotal,
  cartTotal,
  changeField,
  changeFor,
  checkoutButton,
  clearCartButton,
  customerAddress,
  customerName,
  customerPhone,
  customerReference,
  deliveryFields,
  fulfillmentRadios,
  paymentMethod,
  whatsappLinks,
} from "./dom.js";
import { addonMarkersHtml, addonsSummary } from "./addons.js";
import { persistCart, persistCheckout } from "./storage.js";
import { productImageHtml } from "./media.js";
import { state } from "./state.js";
import { restoreFocus, setBackgroundInert, setCartExpanded } from "./ui.js";
import { escapeHtml, focusFirstElement, formatPrice, normalizeText } from "./utils.js";

export function isDelivery() {
  return state.checkout.fulfillment === "delivery";
}

export function cartKey(product, pickedAddons, note) {
  return [
    product.id,
    pickedAddons
      .map((addon) => `${addon.id}:${addon.quantity}`)
      .sort()
      .join(","),
    normalizeText(note),
  ].join("|");
}

export function addItemToCart(product, pickedAddons = [], note = "", quantity = 1) {
  const key = cartKey(product, pickedAddons, note);
  const existing = state.cart.find((item) => item.key === key);

  if (existing) {
    existing.quantity += quantity;
  } else {
    state.cart.push({
      key,
      product,
      addons: pickedAddons,
      note,
      quantity,
    });
  }

  persistCart(state.cart);
  renderCart();
  return key;
}

export function cartItemPrice(item) {
  const addonsTotal = (item.addons || []).reduce(
    (total, addon) => total + Number(addon.price) * Math.max(1, Number(addon.quantity || 1)),
    0
  );
  return (Number(item.product.price) + addonsTotal) * item.quantity;
}

function cartSubtotalValue() {
  return state.cart.reduce((total, item) => total + cartItemPrice(item), 0);
}

// A entrega e combinada no atendimento e muda conforme a localizacao, entao
// nenhum valor de taxa entra no total exibido ou enviado.
function cartTotalValue() {
  return cartSubtotalValue();
}

function cartQuantity() {
  return state.cart.reduce((total, item) => total + item.quantity, 0);
}

function updateCartBadges() {
  const quantity = cartQuantity();
  document.querySelectorAll("[data-cart-count]").forEach((badge) => {
    badge.textContent = quantity;
    badge.classList.toggle("visible", quantity > 0);
  });
}

// O corpo do carrinho e redesenhado inteiro a cada mudanca, o que descartaria o
// botao que o cliente acabou de acionar. Guardamos qual controle estava em foco
// para devolve-lo depois, senao quem usa teclado ou leitor de tela e jogado
// para o topo da pagina a cada "+".
function activeCartControl() {
  const active = document.activeElement;
  if (!active || !cartBody.contains(active)) {
    return null;
  }

  const attribute = ["data-cart-plus", "data-cart-minus", "data-remove-item"].find((name) =>
    active.hasAttribute(name)
  );
  return attribute ? { attribute, value: active.getAttribute(attribute) } : null;
}

function restoreCartControl(control) {
  if (!control) {
    return;
  }

  const selector = `[${control.attribute}="${CSS.escape(control.value)}"]`;
  const target = cartBody.querySelector(selector);
  if (target) {
    target.focus();
  } else {
    clearCartButton.focus();
  }
}

export function renderCart() {
  updateCartBadges();
  const focusedControl = activeCartControl();

  if (!state.cart.length) {
    cartBody.innerHTML = `
      <div class="cart-empty">
        <div>
          <span aria-hidden="true">🛒</span>
          <strong>Carrinho vazio</strong>
          <p>Adicione produtos para começar seu pedido</p>
        </div>
      </div>
    `;
  } else {
    cartBody.innerHTML = state.cart
      .map(
        (item) => `
          <article class="cart-item">
            <div class="cart-item-media">
              ${productImageHtml(item.product)}
              <span>${item.quantity}x</span>
            </div>
            <div class="cart-item-content">
              <div class="cart-item-head">
                <h3>${escapeHtml(item.product.name)}</h3>
                <strong>${formatPrice(cartItemPrice(item))}</strong>
              </div>
              ${(item.addons || []).length ? `<div class="cart-markers">${addonMarkersHtml(item.addons)}</div>` : ""}
              ${item.note ? `<p class="cart-note"><span>Obs:</span>${escapeHtml(item.note)}</p>` : ""}
            </div>
            <button class="remove-item" type="button" data-remove-item="${escapeHtml(item.key)}" aria-label="Remover ${escapeHtml(item.product.name)}">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 3h6l.8 2H20v2H4V5h4.2L9 3Zm-2.2 6h10.4l-.7 11H7.5L6.8 9Zm3.2 2v7h1.5v-7H10Zm2.5 0v7H14v-7h-1.5Z"/>
              </svg>
            </button>
            <div class="quantity-stepper">
              <button type="button" data-cart-minus="${escapeHtml(item.key)}" aria-label="Diminuir ${escapeHtml(item.product.name)}">−</button>
              <strong>${item.quantity}</strong>
              <button type="button" data-cart-plus="${escapeHtml(item.key)}" aria-label="Aumentar ${escapeHtml(item.product.name)}">+</button>
            </div>
          </article>
        `
      )
      .join("");
  }

  restoreCartControl(focusedControl);

  clearCartButton.disabled = !state.cart.length;
  checkoutButton.disabled = !state.cart.length;
  cartSubtotal.textContent = formatPrice(cartSubtotalValue());
  cartDeliveryFee.textContent = isDelivery() ? DELIVERY_FEE_LABEL : "Retirar no local";
  cartTotal.textContent = formatPrice(cartTotalValue());
  updateWhatsappLinks();
}

export function applyCheckoutFields() {
  fulfillmentRadios.forEach((radio) => {
    radio.checked = radio.value === state.checkout.fulfillment;
  });
  customerName.value = state.checkout.name;
  customerPhone.value = state.checkout.phone;
  customerAddress.value = state.checkout.address;
  customerReference.value = state.checkout.reference;
  paymentMethod.value = state.checkout.payment;
  changeFor.value = state.checkout.changeFor;
  updateCheckoutVisibility();
}

export function updateCheckoutFromFields() {
  const selectedFulfillment = [...fulfillmentRadios].find((radio) => radio.checked);
  state.checkout = {
    fulfillment: selectedFulfillment?.value === "delivery" ? "delivery" : "local",
    name: customerName.value.trim(),
    phone: customerPhone.value.trim(),
    address: customerAddress.value.trim(),
    reference: customerReference.value.trim(),
    payment: paymentMethod.value,
    changeFor: changeFor.value.trim(),
  };
  persistCheckout(state.checkout);
  updateCheckoutVisibility();
  renderCart();
}

// No local o cliente so precisa do nome (para chamar o pedido) e do WhatsApp
// (para avisar quando ficar pronto). Endereco so aparece na entrega.
function updateCheckoutVisibility() {
  const delivery = isDelivery();
  deliveryFields.forEach((field) => {
    field.hidden = !delivery;
    field.querySelectorAll("input").forEach((input) => {
      input.setAttribute("aria-required", String(delivery && input.dataset.optionalField !== ""));
    });
  });

  document.querySelectorAll("[data-delivery-note]").forEach((element) => {
    element.hidden = !delivery;
  });

  const needsChange = state.checkout.payment === "Dinheiro";
  changeField.hidden = !needsChange;
}

function setCartMessage(message, type = "") {
  cartMessage.textContent = message;
  cartMessage.dataset.type = type;
}

export function validateCheckout() {
  if (!state.cart.length) {
    setCartMessage("Adicione pelo menos um item ao carrinho.", "error");
    return false;
  }

  if (!state.checkout.name) {
    setCartMessage("Informe seu nome para identificar o pedido.", "error");
    customerName.focus();
    return false;
  }

  if (!state.checkout.phone) {
    setCartMessage("Informe seu WhatsApp para avisarmos quando o pedido ficar pronto.", "error");
    customerPhone.focus();
    return false;
  }

  if (isDelivery() && !state.checkout.address) {
    setCartMessage("Informe o endereço de entrega.", "error");
    customerAddress.focus();
    return false;
  }

  setCartMessage("");
  return true;
}

export function openCart() {
  if (cartDrawer.classList.contains("open")) {
    return;
  }

  state.lastFocusedElement = document.activeElement;
  cartDrawer.classList.add("open");
  cartDrawer.removeAttribute("inert");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("locked");
  setBackgroundInert(true);
  setCartExpanded(true);
  focusFirstElement(cartDrawer);
}

export function closeCart() {
  if (!cartDrawer.classList.contains("open")) {
    return;
  }

  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  cartDrawer.setAttribute("inert", "");
  document.body.classList.remove("locked");
  setBackgroundInert(false);
  setCartExpanded(false);
  restoreFocus();
}

export function updateItemQuantity(key, amount) {
  const item = state.cart.find((cartItem) => cartItem.key === key);
  if (!item) {
    return;
  }

  item.quantity += amount;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter((cartItem) => cartItem.key !== key);
  }
  persistCart(state.cart);
  renderCart();
}

export function removeItem(key) {
  state.cart = state.cart.filter((item) => item.key !== key);
  persistCart(state.cart);
  renderCart();
}

export function clearCart() {
  state.cart = [];
  persistCart(state.cart);
  renderCart();
  setCartMessage("Carrinho limpo.", "success");
}

function whatsappMessage() {
  if (!state.cart.length) {
    return `Olá! Quero fazer um pedido na ${RESTAURANT_NAME}.`;
  }

  const checkout = state.checkout;
  const delivery = isDelivery();
  const lines = [
    `Olá! Quero finalizar meu pedido na ${RESTAURANT_NAME}:`,
    "",
    `Cliente: ${checkout.name || "Não informado"}`,
    `WhatsApp: ${checkout.phone || "Não informado"}`,
    `Tipo: ${delivery ? "Entrega" : "Consumo no local"}`,
  ];

  if (delivery) {
    lines.push(`Endereço: ${checkout.address || "Não informado"}`);
    if (checkout.reference) {
      lines.push(`Referência: ${checkout.reference}`);
    }
  }

  lines.push(`Pagamento: ${checkout.payment}`);
  if (checkout.payment === "Dinheiro" && checkout.changeFor) {
    lines.push(`Troco para: ${checkout.changeFor}`);
  }

  lines.push("", "Itens:");
  state.cart.forEach((item) => {
    const addonsText = (item.addons || []).length ? ` | ${addonsSummary(item.addons)}` : "";
    const noteText = item.note ? ` | Obs: ${item.note}` : "";
    lines.push(
      `${item.quantity}x ${item.product.name}${addonsText}${noteText} - ${formatPrice(cartItemPrice(item))}`
    );
  });

  lines.push("", `Total dos itens: ${formatPrice(cartTotalValue())}`);

  if (delivery) {
    lines.push(`Taxa de entrega: ${DELIVERY_FEE_LABEL} (${DELIVERY_FEE_NOTE})`);
  } else {
    lines.push("Vou retirar/consumir no local. Me avisem por aqui quando ficar pronto.");
  }

  return lines.join("\n");
}

function whatsappUrl() {
  return `https://wa.me/${RESTAURANT_WHATSAPP}?text=${encodeURIComponent(whatsappMessage())}`;
}

function updateWhatsappLinks() {
  const url = whatsappUrl();
  whatsappLinks.forEach((link) => {
    link.href = url;
  });
}

export function finalizeCheckout() {
  updateCheckoutFromFields();
  if (!validateCheckout()) {
    openCart();
    return;
  }

  // Se o bloqueador de popup barrar a nova aba, navegamos na mesma janela para
  // o cliente nao ficar achando que o botao nao fez nada.
  const opened = window.open(whatsappUrl(), "_blank", "noopener,noreferrer");
  if (!opened) {
    window.location.href = whatsappUrl();
  }
}
