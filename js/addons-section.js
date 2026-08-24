import { addonGroupIcons, addonGroupLabels, addonGroupOrder } from "./config.js";
import { addonsGrid } from "./dom.js";
import { state } from "./state.js";
import { escapeHtml, formatPrice } from "./utils.js";

// Vitrine dos adicionais do cardapio. E informativa: a escolha de fato acontece
// dentro de cada produto, onde so aparecem os adicionais compativeis com ele.
export function renderAddonsSection() {
  const groups = addonGroupOrder
    .map((group) => ({
      group,
      items: state.addons.filter((addon) => addon.group === group),
    }))
    .filter((groupData) => groupData.items.length);

  if (!groups.length) {
    addonsGrid.innerHTML = "";
    return;
  }

  addonsGrid.innerHTML = groups
    .map(
      ({ group, items }) => `
        <section class="addon-showcase">
          <h3>
            <span aria-hidden="true">${escapeHtml(addonGroupIcons[group] || "•")}</span>
            ${escapeHtml(addonGroupLabels[group] || "Adicionais")}
          </h3>
          <ul>
            ${items
              .map(
                (addon) => `
                  <li>
                    <span><span aria-hidden="true">${escapeHtml(addon.icon || "•")}</span> ${escapeHtml(addon.name)}</span>
                    <strong>${formatPrice(addon.price)}</strong>
                  </li>
                `
              )
              .join("")}
          </ul>
        </section>
      `
    )
    .join("");
}
