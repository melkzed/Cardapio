export const RESTAURANT_WHATSAPP = "5581994616516";
export const DELIVERY_FEE = 6;
export const CART_STORAGE_KEY = "mordida-perfeita-cart-v3";
export const CHECKOUT_STORAGE_KEY = "mordida-perfeita-checkout-v1";
export const SITE_URL = "https://melkzed.github.io/Cardapio/";

export const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const categoryLabels = {
  all: "Todos",
  burger: "Hambúrguer",
  combo: "Combo",
  portion: "Porção",
  drink: "Bebida",
  promo: "Promoção",
};

export const addonGroupOrder = [
  "bread",
  "protein",
  "cheese",
  "sauce",
  "extra",
  "side",
  "drink",
  "fries",
];

export const addonGroupLabels = {
  bread: "Pães",
  protein: "Carnes",
  cheese: "Queijos",
  sauce: "Molhos",
  extra: "Adicionais",
  side: "Acompanhamentos",
  drink: "Bebidas",
  fries: "Batatas",
};

export const addonGroupIcons = {
  bread: "🍞",
  protein: "🥩",
  cheese: "🧀",
  sauce: "🥫",
  extra: "✨",
  side: "🍗",
  drink: "🥤",
  fries: "🍟",
};

export const builderProduct = {
  id: "lanche-personalizado",
  name: "Lanche do Seu Jeito",
  category: "burger",
  image: "assets/hero-burger-ai.jpg",
  description: "Pedido montado pelo cliente.",
  price: 0,
  rating: 5,
  details: {
    badge: "Personalizado",
    prepTime: "25-35 min",
    serves: "1 pessoa",
    ingredients: ["Itens escolhidos pelo cliente"],
    tags: ["Montado"],
  },
};

export const builderItems = [
  { id: "pao-brioche", icon: "🍞", name: "Pão brioche", price: 5, group: "bread" },
  { id: "pao-australiano", icon: "🍞", name: "Pão australiano", price: 6, group: "bread" },
  { id: "smash-90g", icon: "🥩", name: "Smash bovino 90g", price: 10, group: "protein" },
  { id: "burger-180g", icon: "🥩", name: "Burger artesanal 180g", price: 16, group: "protein" },
  { id: "frango-crispy", icon: "🍗", name: "Frango crispy", price: 13, group: "protein" },
  { id: "burger-vegetal", icon: "🥬", name: "Burger vegetal", price: 14, group: "protein" },
  { id: "cheddar-builder", icon: "🧀", name: "Cheddar", price: 4, group: "cheese" },
  { id: "mussarela", icon: "🧀", name: "Mussarela", price: 4, group: "cheese" },
  { id: "catupiry-builder", icon: "🧀", name: "Catupiry", price: 5, group: "cheese" },
  { id: "molho-casa-builder", icon: "🥫", name: "Molho da casa", price: 3, group: "sauce" },
  { id: "barbecue-builder", icon: "🔥", name: "Barbecue defumado", price: 4, group: "sauce" },
  { id: "honey-mustard", icon: "🍯", name: "Honey mustard", price: 3, group: "sauce" },
  { id: "bacon-builder", icon: "🥓", name: "Bacon", price: 5, group: "extra" },
  { id: "ovo-builder", icon: "🥚", name: "Ovo", price: 3, group: "extra" },
  { id: "cebola-builder", icon: "🧅", name: "Cebola caramelizada", price: 4, group: "extra" },
  { id: "picles-builder", icon: "🥒", name: "Picles", price: 2.5, group: "extra" },
  { id: "onion-builder", icon: "🧅", name: "Onion rings", price: 9, group: "side" },
  { id: "nuggets-builder", icon: "🍗", name: "Nuggets", price: 12, group: "side" },
  { id: "refri-builder", icon: "🥤", name: "Refrigerante lata", price: 7, group: "drink" },
  { id: "cha-builder", icon: "🧋", name: "Chá gelado", price: 9.9, group: "drink" },
  { id: "batata-p-builder", icon: "🍟", name: "Batata P", price: 8, group: "fries" },
  { id: "batata-m-builder", icon: "🍟", name: "Batata M", price: 12, group: "fries" },
  { id: "batata-g-builder", icon: "🍟", name: "Batata G", price: 16, group: "fries" },
];

export const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");
