const RESTAURANT_WHATSAPP = "5581994616516";
const DELIVERY_FEE = 6;
const CART_STORAGE_KEY = "mordida-perfeita-cart-v3";
const CHECKOUT_STORAGE_KEY = "mordida-perfeita-checkout-v1";

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const categoryLabels = {
  all: "Todos",
  burger: "Hambúrguer",
  combo: "Combo",
  portion: "Porção",
  drink: "Bebida",
  promo: "Promoção",
};

let products = [];
let addons = [];

const state = {
  category: "all",
  search: "",
  cart: loadStoredCart(),
  modalProduct: null,
  modalQuantity: 1,
  checkout: loadStoredCheckout(),
};

const productGrid = document.querySelector("[data-product-grid]");
const productCount = document.querySelector("[data-product-count]");
const addonsGrid = document.querySelector("[data-addons-grid]");
const searchInput = document.querySelector("[data-search-input]");
const clearFiltersButton = document.querySelector("[data-clear-filters]");
const modal = document.querySelector(".modal-backdrop");
const modalImage = document.querySelector("[data-modal-image]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalDescription = document.querySelector("[data-modal-description]");
const modalOldPrice = document.querySelector("[data-modal-old-price]");
const modalPrice = document.querySelector("[data-modal-price]");
const modalTotal = document.querySelector("[data-modal-total]");
const modalQuantity = document.querySelector("[data-modal-quantity]");
const modalAddons = document.querySelector("[data-modal-addons]");
const modalRating = document.querySelector(".rating-pill");
const modalTags = document.querySelector("[data-modal-tags]");
const modalDetails = document.querySelector("[data-modal-details]");
const itemNote = document.querySelector("#item-note");
const cartDrawer = document.querySelector(".cart-drawer");
const cartBody = document.querySelector("[data-cart-body]");
const cartSubtotal = document.querySelector("[data-cart-subtotal]");
const cartTotal = document.querySelector("[data-cart-total]");
const cartDeliveryFee = document.querySelector("[data-delivery-fee]");
const cartMessage = document.querySelector("[data-cart-message]");
const clearCartButton = document.querySelector("[data-clear-cart]");
const checkoutButton = document.querySelector(".checkout-button");
const whatsappLinks = document.querySelectorAll("[data-whatsapp-link]");
const toast = document.querySelector("[data-toast]");

const fulfillmentRadios = document.querySelectorAll("[data-fulfillment]");
const customerName = document.querySelector("[data-customer-name]");
const customerPhone = document.querySelector("[data-customer-phone]");
const customerAddress = document.querySelector("[data-customer-address]");
const customerReference = document.querySelector("[data-customer-reference]");
const paymentMethod = document.querySelector("[data-payment-method]");
const changeFor = document.querySelector("[data-change-for]");
const changeField = document.querySelector("[data-change-field]");
const deliveryFields = document.querySelectorAll(".delivery-field");

function formatPrice(value) {
  return money.format(Number(value || 0)).replace(/\u00a0/g, " ");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function safeJsonParse(value, fallback) {
  if (value == null || value === "") {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function loadStoredCart() {
  const stored = localStorage.getItem(CART_STORAGE_KEY);
  const cart = safeJsonParse(stored, []);
  return Array.isArray(cart) ? cart : [];
}

function loadStoredCheckout() {
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

function persistCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cart));
}

function persistCheckout() {
  localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(state.checkout));
}

async function getJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Falha ao carregar ${path}: ${response.status}`);
  }
  return response.json();
}

function normalizeProduct(product) {
  let details = product.details || {};
  if (typeof details === "string") {
    details = safeJsonParse(details, {});
  }

  return {
    ...product,
    price: Number(product.price || 0),
    oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
    rating: Number(product.rating || 4.7),
    details: {
      badge: details.badge || categoryLabels[product.category] || "Produto",
      prepTime: details.prepTime || "20-30 min",
      serves: details.serves || "1 pessoa",
      ingredients: Array.isArray(details.ingredients) ? details.ingredients : [],
      tags: Array.isArray(details.tags) ? details.tags : [],
    },
  };
}

function normalizeAddon(addon) {
  return {
    ...addon,
    price: Number(addon.price || 0),
  };
}

async function loadCatalog() {
  productGrid.innerHTML = '<p class="menu-status">Carregando cardápio...</p>';
  addonsGrid.innerHTML = '<p class="menu-status">Carregando adicionais...</p>';

  try {
    const [loadedProducts, loadedAddons] = await Promise.all([
      getJson("data/products.json"),
      getJson("data/addons.json"),
    ]);

    products = loadedProducts.map(normalizeProduct);
    addons = loadedAddons.map(normalizeAddon);
    reconcileStoredCart();
    renderProducts();
    renderAddons();
    renderCart();
  } catch (error) {
    console.error(error);
    productGrid.innerHTML = `
      <p class="menu-status error">
        Não foi possível carregar o cardápio. Rode <strong>python server.py</strong>
        ou publique a pasta <strong>data/</strong> junto com o site.
      </p>
    `;
    addonsGrid.innerHTML = "";
  }
}

function reconcileStoredCart() {
  state.cart = state.cart
    .map((item) => {
      const liveProduct = products.find((product) => product.id === item.product?.id);
      if (!liveProduct) {
        return item;
      }

      return {
        ...item,
        product: liveProduct,
        addons: (item.addons || []).map((selected) => {
          return addons.find((addon) => addon.id === selected.id) || selected;
        }),
      };
    })
    .filter((item) => item.product && item.quantity > 0);
  persistCart();
}

function productSearchIndex(product) {
  const details = product.details || {};
  return normalizeText(
    [
      product.name,
      product.description,
      categoryLabels[product.category],
      details.badge,
      ...(details.ingredients || []),
      ...(details.tags || []),
    ].join(" ")
  );
}

function isVisibleProduct(product) {
  const matchesCategory =
    state.category === "all" || product.category === state.category;
  const matchesSearch =
    !state.search || productSearchIndex(product).includes(normalizeText(state.search));

  return matchesCategory && matchesSearch;
}

function renderProducts() {
  const visible = products.filter(isVisibleProduct);

  if (productCount) {
    productCount.textContent = `${visible.length} ${visible.length === 1 ? "item" : "itens"}`;
  }

  if (!visible.length) {
    productGrid.innerHTML = '<p class="menu-status">Nenhum produto encontrado.</p>';
    return;
  }

  productGrid.innerHTML = visible
    .map((product) => {
      const oldPrice = product.oldPrice
        ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>`
        : "";
      const tags = product.details.tags.slice(0, 2)
        .map((tag) => `<span>${escapeHtml(tag)}</span>`)
        .join("");

      return `
        <article class="product-card">
          <button class="product-image" type="button" data-open-product="${escapeHtml(product.id)}" aria-label="Abrir ${escapeHtml(product.name)}">
            <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">
            <span class="product-badge">${escapeHtml(product.details.badge)}</span>
          </button>
          <div class="product-info">
            <div class="product-head">
              <h3>${escapeHtml(product.name)}</h3>
              <span>${escapeHtml(categoryLabels[product.category])}</span>
            </div>
            <p>${escapeHtml(product.description)}</p>
            <div class="product-meta">
              <span>🕘 ${escapeHtml(product.details.prepTime)}</span>
              <span>👥 ${escapeHtml(product.details.serves)}</span>
            </div>
            <div class="product-tags">${tags}</div>
            <div class="price-line">
              ${oldPrice}
              <strong class="price">${formatPrice(product.price)}</strong>
            </div>
            <div class="card-bottom">
              <span class="stars" aria-label="Avaliação ${escapeHtml(product.rating)}">★★★★★</span>
              <button class="add-button" type="button" data-open-product="${escapeHtml(product.id)}" aria-label="Adicionar ${escapeHtml(product.name)}">+</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderAddons() {
  addonsGrid.innerHTML = addons
    .map(
      (addon) => `
        <article class="addon-card">
          <span aria-hidden="true">${escapeHtml(addon.icon)}</span>
          <h3>${escapeHtml(addon.name)}</h3>
          <strong>+${formatPrice(addon.price)}</strong>
        </article>
      `
    )
    .join("");
}

function renderModalAddons() {
  modalAddons.innerHTML = addons
    .map(
      (addon) => `
        <label class="addon-option">
          <input type="checkbox" value="${escapeHtml(addon.id)}" data-addon-check>
          <span>
            <strong>${escapeHtml(addon.icon)} ${escapeHtml(addon.name)}</strong>
            <span>+${formatPrice(addon.price)}</span>
          </span>
        </label>
      `
    )
    .join("");
}

function selectedAddons() {
  return [...document.querySelectorAll("[data-addon-check]:checked")]
    .map((input) => addons.find((addon) => addon.id === input.value))
    .filter(Boolean);
}

function syncAddonOptionState() {
  document.querySelectorAll(".addon-option").forEach((label) => {
    const input = label.querySelector("[data-addon-check]");
    label.classList.toggle("selected", Boolean(input?.checked));
  });
}

function modalUnitTotal() {
  if (!state.modalProduct) {
    return 0;
  }

  return (
    state.modalProduct.price +
    selectedAddons().reduce((total, addon) => total + addon.price, 0)
  );
}

function updateModalTotal() {
  modalQuantity.textContent = state.modalQuantity;
  modalTotal.textContent = formatPrice(modalUnitTotal() * state.modalQuantity);
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

function openProduct(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) {
    return;
  }

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
  renderModalAddons();
  updateModalTotal();
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("locked");
}

function closeProduct() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  state.modalProduct = null;
  document.body.classList.remove("locked");
}

function cartKey(product, pickedAddons, note) {
  return [
    product.id,
    pickedAddons.map((addon) => addon.id).sort().join(","),
    normalizeText(note),
  ].join("|");
}

function addModalToCart() {
  if (!state.modalProduct) {
    return;
  }

  const pickedAddons = selectedAddons();
  const note = itemNote.value.trim();
  const key = cartKey(state.modalProduct, pickedAddons, note);
  const existing = state.cart.find((item) => item.key === key);
  const addedName = state.modalProduct.name;
  const addedQuantity = state.modalQuantity;

  if (existing) {
    existing.quantity += state.modalQuantity;
  } else {
    state.cart.push({
      key,
      product: state.modalProduct,
      addons: pickedAddons,
      note,
      quantity: state.modalQuantity,
    });
  }

  persistCart();
  closeProduct();
  openCart();
  renderCart();
  showToast(`${addedQuantity}x ${addedName} no carrinho`);
}

function cartItemPrice(item) {
  const addonsTotal = item.addons.reduce((total, addon) => total + Number(addon.price), 0);
  return (Number(item.product.price) + addonsTotal) * item.quantity;
}

function cartSubtotalValue() {
  return state.cart.reduce((total, item) => total + cartItemPrice(item), 0);
}

function deliveryFeeValue() {
  if (!state.cart.length || state.checkout.fulfillment === "pickup") {
    return 0;
  }

  return DELIVERY_FEE;
}

function cartTotalValue() {
  return cartSubtotalValue() + deliveryFeeValue();
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

function renderCart() {
  updateCartBadges();

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
            <img src="${escapeHtml(item.product.image)}" alt="${escapeHtml(item.product.name)}">
            <div>
              <h3>${escapeHtml(item.product.name)}</h3>
              <strong>${formatPrice(cartItemPrice(item))}</strong>
              ${item.addons.length ? `<p>Adicionais: ${escapeHtml(item.addons.map((addon) => addon.name).join(", "))}</p>` : ""}
              ${item.note ? `<p>Obs: ${escapeHtml(item.note)}</p>` : ""}
            </div>
            <button class="remove-item" type="button" data-remove-item="${escapeHtml(item.key)}" aria-label="Remover ${escapeHtml(item.product.name)}">🗑</button>
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

  clearCartButton.disabled = !state.cart.length;
  checkoutButton.disabled = !state.cart.length;
  cartSubtotal.textContent = formatPrice(cartSubtotalValue());
  cartDeliveryFee.textContent =
    state.checkout.fulfillment === "pickup" ? "Retirada grátis" : formatPrice(deliveryFeeValue());
  cartTotal.textContent = formatPrice(cartTotalValue());
  updateWhatsappLinks();
}

function applyCheckoutFields() {
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

function updateCheckoutFromFields() {
  const selectedFulfillment = [...fulfillmentRadios].find((radio) => radio.checked);
  state.checkout = {
    fulfillment: selectedFulfillment?.value || "delivery",
    name: customerName.value.trim(),
    phone: customerPhone.value.trim(),
    address: customerAddress.value.trim(),
    reference: customerReference.value.trim(),
    payment: paymentMethod.value,
    changeFor: changeFor.value.trim(),
  };
  persistCheckout();
  updateCheckoutVisibility();
  renderCart();
}

function updateCheckoutVisibility() {
  const isDelivery = state.checkout.fulfillment === "delivery";
  deliveryFields.forEach((field) => {
    field.hidden = !isDelivery;
  });
  changeField.hidden = state.checkout.payment !== "Dinheiro";
}

function setCartMessage(message, type = "") {
  cartMessage.textContent = message;
  cartMessage.dataset.type = type;
}

function validateCheckout() {
  if (!state.cart.length) {
    setCartMessage("Adicione pelo menos um item ao carrinho.", "error");
    return false;
  }

  if (!state.checkout.name) {
    setCartMessage("Informe seu nome para finalizar o pedido.", "error");
    customerName.focus();
    return false;
  }

  if (!state.checkout.phone) {
    setCartMessage("Informe seu WhatsApp para contato.", "error");
    customerPhone.focus();
    return false;
  }

  if (state.checkout.fulfillment === "delivery" && !state.checkout.address) {
    setCartMessage("Informe o endereço de entrega.", "error");
    customerAddress.focus();
    return false;
  }

  setCartMessage("");
  return true;
}

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

function updateItemQuantity(key, amount) {
  const item = state.cart.find((cartItem) => cartItem.key === key);
  if (!item) {
    return;
  }

  item.quantity += amount;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter((cartItem) => cartItem.key !== key);
  }
  persistCart();
  renderCart();
}

function removeItem(key) {
  state.cart = state.cart.filter((item) => item.key !== key);
  persistCart();
  renderCart();
}

function clearCart() {
  state.cart = [];
  persistCart();
  renderCart();
  setCartMessage("Carrinho limpo.", "success");
}

function whatsappMessage() {
  if (!state.cart.length) {
    return "Olá! Quero fazer um pedido na Mordida Perfeita.";
  }

  const checkout = state.checkout;
  const lines = [
    "Olá! Quero finalizar meu pedido na Mordida Perfeita:",
    "",
    `Cliente: ${checkout.name || "Não informado"}`,
    `WhatsApp: ${checkout.phone || "Não informado"}`,
    `Tipo: ${checkout.fulfillment === "delivery" ? "Entrega" : "Retirada"}`,
  ];

  if (checkout.fulfillment === "delivery") {
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
    const addonsText = item.addons.length
      ? ` | Adicionais: ${item.addons.map((addon) => addon.name).join(", ")}`
      : "";
    const noteText = item.note ? ` | Obs: ${item.note}` : "";
    lines.push(
      `${item.quantity}x ${item.product.name}${addonsText}${noteText} - ${formatPrice(cartItemPrice(item))}`
    );
  });

  lines.push(
    "",
    `Subtotal: ${formatPrice(cartSubtotalValue())}`,
    `Taxa de entrega: ${
      state.checkout.fulfillment === "pickup" ? "Retirada grátis" : formatPrice(deliveryFeeValue())
    }`,
    `Total: ${formatPrice(cartTotalValue())}`
  );

  return lines.join("\n");
}

function updateWhatsappLinks() {
  const url = `https://wa.me/${RESTAURANT_WHATSAPP}?text=${encodeURIComponent(whatsappMessage())}`;
  whatsappLinks.forEach((link) => {
    link.href = url;
  });
}

function finalizeCheckout() {
  updateCheckoutFromFields();
  if (!validateCheckout()) {
    openCart();
    return;
  }

  window.open(
    `https://wa.me/${RESTAURANT_WHATSAPP}?text=${encodeURIComponent(whatsappMessage())}`,
    "_blank",
    "noreferrer"
  );
}

function showToast(message) {
  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("visible"), 2200);
}

function setCategory(category) {
  state.category = category;
  document.querySelectorAll("[data-category]").forEach((button) => {
    button.classList.toggle("active", button.dataset.category === category);
  });
  renderProducts();
}

document.addEventListener("click", (event) => {
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

  if (event.target.closest(".close-modal") || event.target === modal) {
    closeProduct();
    return;
  }

  if (event.target.closest("[data-modal-minus]")) {
    state.modalQuantity = Math.max(1, state.modalQuantity - 1);
    updateModalTotal();
    return;
  }

  if (event.target.closest("[data-modal-plus]")) {
    state.modalQuantity += 1;
    updateModalTotal();
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
    document.querySelector(".mobile-nav").classList.toggle("open");
    return;
  }

  if (event.target.closest(".mobile-nav a")) {
    document.querySelector(".mobile-nav").classList.remove("open");
  }
});

document.addEventListener("change", (event) => {
  if (event.target.matches("[data-addon-check]")) {
    syncAddonOptionState();
    updateModalTotal();
    return;
  }

  if (
    event.target.matches("[data-fulfillment]") ||
    event.target.matches("[data-payment-method]")
  ) {
    updateCheckoutFromFields();
  }
});

document.addEventListener("input", (event) => {
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
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeProduct();
    closeCart();
  }
});

applyCheckoutFields();
renderCart();
loadCatalog();
