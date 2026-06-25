# DivinArte — Loja de Cosmética Natural Artesanal (Frontend-only)

## Problem statement (original)
Build the FRONT-END ONLY of an e-commerce storefront for a natural artisanal cosmetics brand called "DivinArte".
- React + Tailwind. Mock data. No backend, no database, no auth, no real payments.
- Portuguese (Portugal). EUR prices.
- Brand line: "A divina arte de cuidar de você". Tagline: "Cosmética natural artesanal".
- Palette: leaf #2E9E44, forest #14532D, pine #2C4A3B, olive #B7BD53, cream #F7F4EC, ink #1A1A1A.
- Fonts: Cinzel (headings/logo), Montserrat (body), Caveat (accents).

## User personas
- Cliente final feminina/masculina, sensível a marcas artesanais e naturais, mercado Portugal.
- Compra ocasional de presentes / rituais de bem-estar.

## Architecture
- Frontend único: React 19 + Tailwind + shadcn-ready components + react-router v7.
- Estado do carrinho: `CartContext` + localStorage (`divinarte-cart-v1`).
- Dados mock em `/app/frontend/src/data/mock.js` (16 produtos, 4 categorias, 3 artigos, demo user, encomendas).
- Imagens via Unsplash.
- Backend FastAPI/Mongo permanece intacto — não é usado pelo storefront.

## Routes
- `/` Home  ·  `/loja` Shop (filtros + paginação)  ·  `/produto/:slug` Detalhe
- `/carrinho` Cart  ·  `/checkout` Checkout 3 passos  ·  `/checkout/sucesso` Confirmação
- `/conta/login`  ·  `/conta/registar`  ·  `/conta` (overview / encomendas / perfil / moradas)
- `/blog`  ·  `/blog/:slug`  ·  `/sobre`  ·  `/contacto`

## What's been implemented (2025-12)
- Sistema de design DivinArte (CSS tokens + utilitários, fontes Google, paleta completa).
- Layout global (Header sticky + announcement bar, Footer com newsletter, Cart Drawer).
- Home com hero, trust strip, destaques, grade de categorias, história, testemunhos, blog teaser.
- Loja com filtros (categoria, subcategoria, tipo de pele, finalidade, vegano), sort e paginação (8/página).
- Página de produto com galeria/thumbnails, quantidade, benefícios, modo de uso, relacionados.
- "Compõe o teu ritual" no detalhe (3 itens com toggle, −10% para 2+ itens).
- Carrinho (drawer + página completa) com totais, envio grátis acima de 49 €, persistência local.
- Cart drawer: barra de progresso de envio grátis + upsell pequeno + linha de desconto removível.
- Checkout 3 passos (contacto+morada, envio, pagamento) e página de sucesso com ID gerado; promo propagado.
- Área de conta (mock): visão geral, encomendas, perfil, moradas; login + registo (visual only).
- Blog (lista + detalhe) e páginas estáticas Sobre / Contacto.
- **Admin Panel** sob `/admin/*` com layout próprio (sidebar colapsável, topbar com pesquisa/notificações/role switcher/user menu, breadcrumbs).
  - Dashboard com 4 KPIs, gráficos Recharts (linha + barras), pedidos recentes, alerta stock baixo.
  - **Catálogo**: Produtos (DataTable + bulk publicar/rascunho + form completo com galeria/benefícios/flags), Categorias (árvore hierárquica + drag-to-reorder + subcategorias), Atributos & Filtros (cards + modal).
  - **Stock**: tabela por produto + movimentos com histórico + modal de ajuste (entrada/saída).
  - **Pedidos**: tabela com filtros pagamento/envio + detalhe com radios para atualizar estados.
  - **Conteúdo**: Blog com DataTable de artigos + form com "rich-text" toolbar (markdown).
  - **Administração**: Utilizadores com CRUD + papéis + bloqueio de reset de password fora de Super Admin; Definições (restritas a Super Admin) com dados da loja, toggles de pagamentos, opções de envio, preferências gerais.
  - **Permissões por papel** (Super Admin / Admin / Produção / Lojista) aplicadas à navegação e a funcionalidades sensíveis.
- Testing agent: 24/24 storefront + 17/17 admin checks aprovados.

## P0 / next actions (deferred to subsequent finishes)
- Validações inline mais ricas (mensagens por campo) + máscaras (CP/telefone).
- Pesquisa avançada (autocomplete por produto/ingrediente).
- Persistência de "favoritos" / wishlist.
- Animações de entrada subtis (intersection observer / framer-motion) — staggered reveals.

## P1
- Modo "quick view" no card de produto.
- Cross-sell no carrinho.
- Filtros adicionais (preço por intervalo).

## P2
- Integração real (Stripe, Supabase, etc.) — fora do scope, será feito em VS Code.
- Painel admin — fora do scope.
- Pagamentos reais — fora do scope.

## Mocked / not real
- Auth (login/registo) — apenas UI, navega para `/conta`.
- Continuar com Google — apenas botão visual.
- Pagamentos (Cartão/MB Way/Multibanco/PayPal) — apenas seleção visual, sem processamento.
- Newsletter, formulário de contacto, "Os meus pedidos" — dados/respostas mock.
