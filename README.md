# Villa Burger - Cardapio Digital

Cardapio digital responsivo da Villa Burger, feito com HTML, CSS e JavaScript puro.
O cliente monta o pedido pelo site e finaliza direto no WhatsApp da loja. O projeto
funciona como site estatico e pode ser publicado no GitHub Pages, sem backend, banco
de dados em runtime ou dependencias externas.

## Visao Geral

O site apresenta o cardapio completo por categoria, detalhes de cada item, adicionais
por tipo de produto, carrinho lateral e checkout que monta a mensagem do pedido para o
WhatsApp. O pedido pode ser para consumo no local ou para entrega, e o visitante escolhe
entre tema claro e escuro.

## Como pedir

- **No local** (padrao): o cliente informa apenas nome e WhatsApp. O nome identifica o
  pedido e o WhatsApp recebe o aviso quando ficar pronto.
- **Entrega**: alem de nome e WhatsApp, o cliente informa endereco e ponto de referencia.
  A taxa de entrega nao entra no total do site: ela e combinada no atendimento, porque
  varia conforme a localizacao.

## Funcionalidades

- Cardapio dividido em gourmet, tradicionais, hot dogs, combos, porcoes, coxinhas,
  bebidas e doces.
- Busca por nome, ingrediente ou tag.
- Cards com foto (ou icone da categoria, quando o item nao tem foto), selo, tempo de
  preparo, porcao, tags e preco.
- Detalhe do produto com ingredientes, quantidade, adicionais e observacao.
- Adicionais separados por grupo (carnes, extras e molhos) e filtrados por categoria,
  para nao oferecer opcao incompativel com o item.
- Carrinho lateral com alterar quantidade, remover item e limpar carrinho.
- Carrinho salvo no navegador, com fallback em memoria quando o armazenamento esta
  bloqueado (aba anonima, cookies desativados ou webview restrita).
- Pedido final montado automaticamente para o WhatsApp da loja.
- Tema claro e escuro, escolhido pelo visitante e lembrado no navegador. Sem escolha,
  o site segue a preferencia do sistema.
- Menu de acessibilidade com preferencias salvas no navegador.
- Layout responsivo para desktop e mobile.

## Dados do cardapio

Produtos e adicionais ficam em JSON, entao dá para atualizar preco ou item sem mexer
no codigo:

- `data/products.json` - itens do cardapio (id, nome, categoria, preco, descricao,
  ingredientes e tags). Deixe `image` como `null` quando nao houver foto: o site mostra
  o icone da categoria no lugar.
- `data/addons.json` - adicionais, com `group` (`protein`, `extra` ou `sauce`) e
  `categories`, que define em quais tipos de produto o adicional aparece.

Contato, Instagram e horario ficam em `js/config.js`.

### Horario de funcionamento

`OPENING_HOURS` em `js/config.js` comeca vazio. Enquanto estiver assim, o site direciona
o cliente para o Instagram em vez de exibir um horario que pode estar errado. Para fixar
o horario no site, preencha:

```js
export const OPENING_HOURS = [{ days: "Terça a Domingo", hours: "18:00 às 23:00" }];
```

## SEO e Acessibilidade

- `title`, `description`, `canonical`, `robots`, `theme-color`, `keywords` e `author`.
- Metatags Open Graph e Twitter Card.
- Dados estruturados JSON-LD para restaurante e lista de produtos.
- Link de pular conteudo e navegacao por teclado nas categorias com padrao de abas.
- Estados `aria-expanded`, `aria-selected`, `aria-live`, `aria-modal` e `aria-busy`.
- Carrinho e modal com controle de foco, fechamento por `Esc` e bloqueio do fundo com
  `inert`. O foco volta para o mesmo botao depois de alterar a quantidade no carrinho.
- Suporte a `prefers-reduced-motion` e `prefers-color-scheme`.
- Ajustes para modo de alto contraste com `forced-colors`.
- Menu de acessibilidade com tamanho de fonte, alto contraste, tema claro, espacamento
  de texto, fonte mais legivel, foco reforcado, links sublinhados e reducao de movimento.

## Estrutura

```text
.
|-- index.html
|-- script.js
|-- package.json
|-- css/
|   |-- accessibility.css
|   |-- base.css
|   |-- cart.css
|   |-- footer.css
|   |-- header.css
|   |-- hero.css
|   |-- menu.css
|   |-- modal.css
|   |-- responsive.css
|   `-- sections.css
|-- js/
|   |-- accessibility.js
|   |-- addons.js
|   |-- app.js
|   |-- cart.js
|   |-- catalog.js
|   |-- config.js
|   |-- dom.js
|   |-- events.js
|   |-- hours.js
|   |-- media.js
|   |-- modal.js
|   |-- products.js
|   |-- seo.js
|   |-- state.js
|   |-- storage.js
|   |-- theme.js
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

## Contato

- WhatsApp do pedido: `https://wa.me/5581989637167`
- Instagram: `https://www.instagram.com/villaburguer.pe/`

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
- CSS3 com variaveis de tema
- JavaScript com ES Modules
- JSON estatico
- GitHub Pages
