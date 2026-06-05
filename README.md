# Mordida Perfeita - Cardápio Delivery

Cardápio digital responsivo para hamburgueria delivery, feito com HTML, CSS e JavaScript puro. O projeto funciona como site estático e pode ser publicado diretamente no GitHub Pages, sem backend, banco de dados em runtime ou dependências externas.

## Funcionalidades

- Cardápio com imagens de IA otimizadas.
- Produtos organizados por categoria.
- Busca por nome, ingrediente ou tag.
- Filtros para todos, hambúrgueres, combos, porções, bebidas e promoções.
- Cards com selo, tempo de preparo, porção, tags, preço e preço promocional.
- Modal de produto com imagem, ingredientes, detalhes, observação, quantidade e adicionais.
- Seleção de adicionais com visual integrado ao cardápio.
- Carrinho lateral com aumentar, diminuir, remover item e limpar carrinho.
- Carrinho salvo no navegador por `localStorage`.
- Checkout com entrega ou retirada.
- Formulário com nome, WhatsApp, endereço, referência, pagamento e troco.
- Cálculo automático de subtotal, taxa de entrega e total.
- Pedido final montado automaticamente para WhatsApp.
- Layout responsivo para desktop e mobile.

## Estrutura

```text
.
├── index.html
├── styles.css
├── script.js
├── data/
│   ├── products.json
│   └── addons.json
└── assets/
    ├── bacon-bbq-ai.jpg
    ├── chicken-crispy-ai.jpg
    ├── combo-ai.jpg
    ├── drinks-ai.jpg
    ├── hero-burger-ai.jpg
    ├── loaded-fries-ai.jpg
    ├── smash-double-ai.jpg
    └── veggie-ai.jpg
```

## Como Rodar Localmente

Use qualquer servidor estático. Com Python instalado:

```powershell
python -m http.server 8000
```

Depois abra:

```text
http://127.0.0.1:8000
```

## Publicar no GitHub Pages

1. Envie o projeto para um repositório no GitHub.
2. No repositório, abra `Settings`.
3. Vá em `Pages`.
4. Em `Build and deployment`, selecione `Deploy from a branch`.
5. Escolha a branch principal, normalmente `main`.
6. Escolha a pasta `/root`.
7. Salve.

O GitHub vai gerar uma URL parecida com:

```text
https://seu-usuario.github.io/nome-do-repositorio/
```

## Editar Produtos

Os produtos ficam em:

```text
data/products.json
```

Cada produto segue este formato:

```json
{
  "id": "mordida-perfeita",
  "name": "Mordida Perfeita",
  "category": "promo",
  "image": "assets/hero-burger-ai.jpg",
  "description": "Duplo smash, cheddar, bacon crocante, cebola crispy, tomate confitado e molho secreto.",
  "oldPrice": 35,
  "price": 29.9,
  "rating": 4.9,
  "details": {
    "badge": "Mais pedido",
    "prepTime": "20-30 min",
    "serves": "1 pessoa",
    "ingredients": ["Pão brioche", "2 smash bovinos", "Cheddar"],
    "tags": ["Promo", "Artesanal", "Bacon"]
  }
}
```

Categorias disponíveis:

```text
burger
combo
portion
drink
promo
```

## Editar Adicionais

Os adicionais ficam em:

```text
data/addons.json
```

Formato:

```json
{
  "id": "bacon",
  "icon": "🥓",
  "name": "Bacon Extra",
  "price": 5
}
```

## WhatsApp

O número do WhatsApp fica no início do arquivo `script.js`:

```js
const RESTAURANT_WHATSAPP = "5581994616516";
```

Troque pelo número real no formato:

```text
55 + DDD + número
```

Exemplo:

```text
5581994616516
```

## Endereço Atual do Site

```text
Shopping Recife
Recife - Pernambuco
WhatsApp: (81) 99461-6516
```

## Taxa de Entrega

A taxa de entrega também fica no início do `script.js`:

```js
const DELIVERY_FEE = 6;
```

Para retirada, a taxa é automaticamente zerada.

## Tecnologias

- HTML5
- CSS3
- JavaScript
- JSON estático
- GitHub Pages
