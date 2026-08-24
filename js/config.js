export const RESTAURANT_NAME = "Villa Burger";
export const RESTAURANT_WHATSAPP = "5581989637167";
export const CART_STORAGE_KEY = "villa-burger-cart-v1";
export const CHECKOUT_STORAGE_KEY = "villa-burger-checkout-v1";
export const THEME_STORAGE_KEY = "villa-burger-theme-v1";
export const SITE_URL = "https://melkzed.github.io/Cardapio/";
export const RESTAURANT_INSTAGRAM = "https://www.instagram.com/villaburguer.pe/";
export const RESTAURANT_INSTAGRAM_HANDLE = "@villaburguer.pe";

// Horario de funcionamento: preenchido com os dias/horarios reais da loja para
// aparecer no site e nos dados estruturados. Enquanto estiver vazio, o site
// direciona o cliente para o Instagram em vez de exibir um horario inventado.
export const OPENING_HOURS = [
  { days: "Segunda a Quarta", hours: "17:30 às 23:00" },
  { days: "Quinta a Domingo", hours: "17:00 às 23:30" },
];

export const RESTAURANT_UNIT = "Jardim São Paulo";

// A entrega e combinada no atendimento: o valor muda conforme a localizacao,
// entao o pedido nao soma taxa nenhuma ao total.
export const DELIVERY_FEE_LABEL = "A combinar";
export const DELIVERY_FEE_NOTE =
  "A taxa de entrega é combinada no WhatsApp e varia conforme a localização.";

export const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const categoryLabels = {
  all: "Todos",
  gourmet: "Hambúrguer gourmet",
  tradicional: "Lanche tradicional",
  hotdog: "Hot dog",
  combo: "Combo",
  porcao: "Porção",
  coxinha: "Coxinha",
  bebida: "Bebida",
  doce: "Doce",
};

// Emoji usado quando o produto nao tem foto no catalogo.
export const categoryIcons = {
  gourmet: "🍔",
  tradicional: "🍞",
  hotdog: "🌭",
  combo: "🥤",
  porcao: "🍟",
  coxinha: "🍗",
  bebida: "🥤",
  doce: "🍮",
};

export const addonGroupOrder = ["protein", "extra", "sauce"];

export const addonGroupLabels = {
  protein: "Adicionais de carne",
  extra: "Adicionais extras",
  sauce: "Molhos adicionais",
};

export const addonGroupIcons = {
  protein: "🥩",
  extra: "✨",
  sauce: "🥫",
};

export const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");
