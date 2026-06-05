import { addonsGrid, productGrid } from "./dom.js";
import { normalizeAddon, normalizeCartAddons } from "./addons.js";
import { normalizeProduct, renderProducts } from "./products.js";
import { persistCart } from "./storage.js";
import { renderAddons } from "./builder.js";
import { renderCart } from "./cart.js";
import { state } from "./state.js";
import { updateMenuStructuredData } from "./seo.js";

async function getJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Falha ao carregar ${path}: ${response.status}`);
  }
  return response.json();
}

export async function loadCatalog() {
  productGrid.innerHTML = '<p class="menu-status">Carregando cardápio...</p>';
  productGrid.setAttribute("aria-busy", "true");
  addonsGrid.innerHTML = '<p class="menu-status">Carregando adicionais...</p>';

  try {
    const [loadedProducts, loadedAddons] = await Promise.all([
      getJson("data/products.json"),
      getJson("data/addons.json"),
    ]);

    state.products = loadedProducts.map(normalizeProduct);
    state.addons = loadedAddons.map(normalizeAddon);
    reconcileStoredCart();
    renderProducts();
    renderAddons();
    renderCart();
    updateMenuStructuredData();
    productGrid.setAttribute("aria-busy", "false");
  } catch (error) {
    console.error(error);
    productGrid.innerHTML = `
      <p class="menu-status error">
        Não foi possível carregar o cardápio. Rode <strong>python -m http.server 5173</strong>
        ou publique a pasta <strong>data/</strong> junto com o site.
      </p>
    `;
    addonsGrid.innerHTML = "";
    productGrid.setAttribute("aria-busy", "false");
  }
}

function reconcileStoredCart() {
  state.cart = state.cart
    .map((item) => {
      const liveProduct = state.products.find((product) => product.id === item.product?.id);
      if (!liveProduct) {
        return item;
      }

      return {
        ...item,
        product: liveProduct,
        addons: normalizeCartAddons(item.addons),
      };
    })
    .filter((item) => item.product && item.quantity > 0);
  persistCart(state.cart);
}
