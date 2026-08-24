import { categoryIcons } from "./config.js";
import { escapeHtml } from "./utils.js";

// Nem todo item do cardapio tem foto (hot dogs, coxinhas e doces, por exemplo).
// Nesses casos mostramos o emoji da categoria em vez de reaproveitar a foto de
// outro produto, que passaria a ideia errada do que vai chegar.
export function productIcon(product) {
  return categoryIcons[product?.category] || "🍔";
}

export function productImageHtml(product, { lazy = true } = {}) {
  if (!product?.image) {
    return `<span class="product-fallback" aria-hidden="true">${escapeHtml(productIcon(product))}</span>`;
  }

  const loading = lazy ? ' loading="lazy"' : "";
  return `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" width="600" height="600"${loading} decoding="async">`;
}
