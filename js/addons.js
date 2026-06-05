import { addonGroupIcons, addonGroupLabels, addonGroupOrder } from "./config.js";
import { state } from "./state.js";
import { escapeHtml } from "./utils.js";

export function normalizeAddon(addon) {
  return {
    ...addon,
    price: Number(addon.price || 0),
    group: addon.group || "extra",
    categories:
      Array.isArray(addon.categories) && addon.categories.length
        ? addon.categories
        : ["burger", "combo", "promo"],
  };
}

export function normalizeCartAddons(selectedAddonsList) {
  return (selectedAddonsList || [])
    .map((selected) => {
      const liveAddon = state.addons.find((addon) => addon.id === selected.id);
      const baseAddon = liveAddon || {
        ...selected,
        price: Number(selected.price || 0),
        group: selected.group || "extra",
      };
      const quantity = Math.max(1, Number(selected.quantity || 1));

      return {
        ...baseAddon,
        quantity,
      };
    })
    .filter((addon) => addon.id && addon.quantity > 0);
}

export function addonMatchesProduct(addon, product) {
  if (!product) {
    return false;
  }

  return addon.categories.includes(product.category) || addon.categories.includes("all");
}

export function availableAddonsForProduct(product) {
  return state.addons.filter((addon) => addonMatchesProduct(addon, product));
}

export function addonQuantityLabel(addon) {
  const quantity = Math.max(1, Number(addon.quantity || 1));
  return `${quantity}x ${addon.name}`;
}

export function addonsSummary(addonsList) {
  return addonGroupOrder
    .map((group) => {
      const groupItems = addonsList.filter((addon) => (addon.group || "extra") === group);
      if (!groupItems.length) {
        return "";
      }

      return `${addonGroupLabels[group] || "Opcionais"}: ${groupItems
        .map(addonQuantityLabel)
        .join(", ")}`;
    })
    .filter(Boolean)
    .join(" | ");
}

export function addonMarkersHtml(addonsList) {
  return addonGroupOrder
    .map((group) => {
      const groupItems = addonsList.filter((addon) => (addon.group || "extra") === group);
      if (!groupItems.length) {
        return "";
      }

      return `
        <div class="cart-addon-group">
          <span class="cart-addon-title">
            <span aria-hidden="true">${escapeHtml(addonGroupIcons[group] || "•")}</span>
            ${escapeHtml(addonGroupLabels[group] || "Opcionais")}
          </span>
          <div class="cart-marker-list">
            ${groupItems
              .map(
                (addon) => `
                  <span class="cart-marker">
                    <span class="cart-marker-icon" aria-hidden="true">${escapeHtml(addon.icon || addonGroupIcons[group] || "•")}</span>
                    <span>${escapeHtml(addon.name)}</span>
                    <strong>${Math.max(1, Number(addon.quantity || 1))}x</strong>
                  </span>
                `
              )
              .join("")}
          </div>
        </div>
      `;
    })
    .filter(Boolean)
    .join("");
}
