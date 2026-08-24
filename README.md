# Mordida Perfeita - Cardapio Delivery

Cardapio digital responsivo para hamburgueria delivery, feito com HTML, CSS e JavaScript puro. O projeto funciona como site estatico e pode ser publicado diretamente no GitHub Pages, sem backend, banco de dados em runtime ou dependencias externas.

## Visao Geral

O site apresenta produtos, detalhes do pedido, adicionais por categoria, montagem personalizada de lanche, carrinho lateral, checkout por WhatsApp, localizacao com Google Maps e uma area de avaliacoes. A pagina tambem recebeu estrutura de SEO e acessibilidade para melhorar leitura por buscadores, leitores de tela, teclado e diferentes necessidades de navegacao.

## Funcionalidades

- Cardapio com produtos organizados por categoria.
- Busca por nome, ingrediente ou tag.
- Filtros para todos, hamburgueres, combos, porcoes, bebidas e promocoes.
- Cards com imagem, selo, tempo de preparo, porcao, tags, preco e preco promocional.
- Detalhe do produto com imagem, informacoes principais, quantidade e observacao no final.
- Adicionais com botoes de aumentar e diminuir quantidade, permitindo repetir o mesmo item.
- Adicionais separados por categoria de produto para evitar opcoes incorretas, como ovo em bebidas.
- Grupos de adicionais em ordem: adicionais, acompanhamentos, bebidas e batatas P/M/G.
- Area "Montar do meu jeito" para criar um lanche personalizado.
- Carrinho lateral com estilo da marca, marcadores visuais dos adicionais, alterar quantidade, remover item e limpar carrinho.
- Carrinho salvo no navegador por `localStorage`.
- Checkout com entrega ou retirada.
- Formulario com nome, WhatsApp, endereco, referencia, pagamento e troco.
- Calculo automatico de subtotal, taxa de entrega e total.
- Pedido final montado automaticamente para WhatsApp.
- Localizacao com Google Maps.
- Area de avaliacoes com depoimentos de exibicao.
- Footer com botoes de redes sociais: LinkedIn, GitHub, WhatsApp e Instagram.
- Logo propria aplicada no site e como favicon do navegador.
- Menu de acessibilidade com preferencias de aparencia salvas no navegador.
- Layout responsivo para desktop e mobile.

## SEO e Acessibilidade

A pagina inclui recursos para melhorar indexacao e acesso por diferentes publicos:

- `title`, `description`, `canonical`, `robots`, `theme-color`, `keywords` e `author`.
- Metatags Open Graph e Twitter Card.
- Dados estruturados JSON-LD para restaurante e lista de produtos.
- Links internos para secoes principais.
- Link de pular conteudo.
- Labels e textos auxiliares para campos de busca e formulario.
- Navegacao por teclado nas categorias com padrao de abas.
- Estados `aria-expanded`, `aria-selected`, `aria-live`, `aria-modal` e `aria-busy`.
- Carrinho e modal com controle de foco, fechamento por `Esc` e bloqueio do fundo com `inert`.
- Estilos de foco visiveis.
- Suporte a `prefers-reduced-motion`.
- Ajustes para modo de alto contraste com `forced-colors`.
- Imagens com textos alternativos.
- Menu de acessibilidade com aumento/reducao de fonte, alto contraste, tema claro, espacamento de texto, fonte mais legivel, foco reforcado, links sublinhados e reducao de movimento.

## Estrutura

```text
.
|-- index.html
|-- script.js
|-- package.json
|-- css/
|   |-- accessibility.css
|   |-- base.css
|   |-- builder.css
|   |-- cart.css
|   |-- footer.css
|   |-- header.css
|   |-- hero.css
|   |-- menu.css
|   |-- modal.css
|   |-- promos.css
|   |-- responsive.css
|   `-- sections.css
|-- js/
|   |-- accessibility.js
|   |-- addons.js
|   |-- app.js
|   |-- builder.js
|   |-- cart.js
|   |-- catalog.js
|   |-- config.js
|   |-- dom.js
|   |-- events.js
|   |-- modal.js
|   |-- products.js
|   |-- seo.js
|   |-- state.js
|   |-- storage.js
|   |-- ui.js
|   `-- utils.js
|-- scripts/
|   |-- check.mjs
|   `-- dev-server.mjs
|-- data/
|   |-- products.json
|   `-- addons.json
`-- assets/
    |-- bacon-bbq-ai.jpg
    |-- chicken-crispy-ai.jpg
    |-- combo-ai.jpg
    |-- drinks-ai.jpg
    |-- hero-burger-ai.jpg
    |-- loaded-fries-ai.jpg
    |-- logo.svg
    |-- smash-double-ai.jpg
    `-- veggie-ai.jpg
```

## Redes Sociais

Os links ficam no footer de `index.html` e usam icones como botoes:

- LinkedIn: `https://www.linkedin.com/in/melk-zedek`
- GitHub: `https://github.com/melkzed`
- WhatsApp: `https://wa.me/5581994616516`
- Instagram: `https://www.instagram.com/melkzedektech/`

## Localização

A secao de localizacao usa um iframe do Google Maps em `index.html`. Para trocar o endereco exibido, atualize o `src` do iframe e os textos da secao de localizacao.

## Como rodar

O site e estatico, mas precisa ser servido por HTTP: o cardapio carrega
`data/products.json` e `data/addons.json` via `fetch`, e abrir o `index.html`
direto pelo arquivo (`file://`) e bloqueado pelo navegador.

Com Node 20 ou superior instalado:

```bash
npm run dev
```

O terminal mostra o endereco (`http://localhost:5173` por padrao). O servidor de
desenvolvimento fica em `scripts/dev-server.mjs`, usa apenas modulos nativos do
Node e nao exige `npm install`. Ele recarrega o navegador sozinho quando um
arquivo do projeto muda.

Para trocar a porta:

```bash
npm run dev -- 3000
# ou
PORT=3000 npm run dev
```

Se preferir nao usar Node, qualquer servidor estatico serve:

```bash
python -m http.server 5173
```

## Validação

Confere a sintaxe de todo o JavaScript e o carregamento dos JSON de dados:

```bash
npm run check
```

## Tecnologias

- HTML5
- CSS3
- JavaScript com ES Modules
- JSON estatico
- Google Maps embed
- GitHub Pages
