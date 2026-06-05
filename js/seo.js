import { SITE_URL } from "./config.js";
import { availableAddonsForProduct } from "./addons.js";
import { state } from "./state.js";
import { absoluteUrl } from "./utils.js";

export function updateMenuStructuredData() {
  const menuData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_URL}#menu-items`,
    name: "Itens do cardápio Mordida Perfeita",
    itemListElement: state.products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "MenuItem",
        name: product.name,
        description: product.description,
        image: absoluteUrl(product.image),
        menuAddOn: availableAddonsForProduct(product).map((addon) => ({
          "@type": "MenuItem",
          name: addon.name,
          offers: {
            "@type": "Offer",
            price: addon.price.toFixed(2),
            priceCurrency: "BRL",
          },
        })),
        offers: {
          "@type": "Offer",
          price: product.price.toFixed(2),
          priceCurrency: "BRL",
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };

  let script = document.querySelector("#menu-structured-data");
  if (!script) {
    script = document.createElement("script");
    script.id = "menu-structured-data";
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(menuData);
}
