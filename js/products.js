import { categoryLabels } from "./config.js";
import { productCount, productGrid } from "./dom.js";
import { productImageHtml } from "./media.js";
import { state } from "./state.js";
import { escapeHtml, formatPrice, normalizeText } from "./utils.js";

export function normalizeProduct(product) {
  const details = product.details || {};

  return {
    ...product,
    image: product.image || null,
    price: Number(product.price || 0),
    oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
    details: {
      badge: details.badge || categoryLabels[product.category] || "Produto",
      prepTime: details.prepTime || "20-30 min",
      serves: details.serves || "1 pessoa",
      ingredients: Array.isArray(details.ingredients) ? details.ingredients : [],
      tags: Array.isArray(details.tags) ? details.tags : [],
    },
  };
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
  const matchesCategory = state.category === "all" || product.category === state.category;
  const matchesSearch =
    !state.search || productSearchIndex(product).includes(normalizeText(state.search));

  return matchesCategory && matchesSearch;
}

export function renderProducts() {
  const visible = state.products.filter(isVisibleProduct);

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
      const tags = product.details.tags
        .slice(0, 2)
        .map((tag) => `<span>${escapeHtml(tag)}</span>`)
        .join("");

      return `
        <article class="product-card" aria-labelledby="product-title-${escapeHtml(product.id)}">
          <button class="product-image" type="button" data-open-product="${escapeHtml(product.id)}" aria-label="Abrir ${escapeHtml(product.name)}">
            ${productImageHtml(product)}
            <span class="product-badge">${escapeHtml(product.details.badge)}</span>
          </button>
          <div class="product-info">
            <div class="product-head">
              <h3 id="product-title-${escapeHtml(product.id)}">${escapeHtml(product.name)}</h3>
              <span>${escapeHtml(categoryLabels[product.category] || "")}</span>
            </div>
            <p>${escapeHtml(product.description)}</p>
            <div class="product-meta">
              <span>🕘 ${escapeHtml(product.details.prepTime)}</span>
              <span>👥 ${escapeHtml(product.details.serves)}</span>
            </div>
            <div class="product-tags">${tags}</div>
            <div class="card-bottom">
              <div class="price-line">
                ${oldPrice}
                <strong class="price">${formatPrice(product.price)}</strong>
              </div>
              <button class="add-button" type="button" data-open-product="${escapeHtml(product.id)}" aria-label="Adicionar ${escapeHtml(product.name)}">+</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

export function setCategory(category) {
  state.category = category;
  document.querySelectorAll("[data-category]").forEach((button) => {
    const isActive = button.dataset.category === category;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    button.tabIndex = isActive ? 0 : -1;
  });
  renderProducts();
}
