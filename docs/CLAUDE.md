# CLAUDE.md — DivinArte

> O Claude Code lê este ficheiro no início de cada sessão.
> **Especificação completa do projeto: `docs/CONTEXT.md` — lê SEMPRE primeiro.**
> **Gestor de pacotes: `yarn`** — usar `yarn install`, `yarn dev`, `yarn add <pkg>` (nunca `npm`).

## Fase atual: VISUAL concluído (mock data) — próxima fase é o BACK-END

O visual (loja + painel admin) está **completo**, com mock data, sem back-end:
- UI: páginas, componentes, routing, estilos, interações — tudo feito.
- **Mock data** (ficheiros locais). Nada de Supabase, base de dados, API real ou autenticação real ainda — isso é a próxima fase.
- Todo o texto visível em **Português (Portugal)**. Usar € onde aplicável.

A próxima fase é ligar tudo a um back-end real (Supabase: auth, RLS, dados), pagamentos, i18n e motor de envios — ver `docs/CONTEXT.md` §6-12.

## Regra de ouro: continuar o MESMO estilo

- **Imita as convenções já existentes** no projeto: estrutura de pastas, padrões de componentes, design tokens, forma de organizar os mock data e o routing.
- **Não introduzas novos padrões nem bibliotecas** a não ser que a spec peça explicitamente (ex.: DnD Kit no construtor de páginas).
- **Reutiliza** os componentes que já existem (DataTable, formulários, cards, modais, etc.).

## Ordem de construção do visual (concluída)

1. ✅ **Prompt 2** — módulos Produção/ERP e Financeiro + alterações em `/admin/definicoes`. Spec: `docs/PROMPT_EMERGENT_ADMIN_2.md`.
2. ✅ **Prompt 2B** — Gestão de Envios (`/admin/envios`) + secção "Envio" no formulário de produto. Spec: `docs/PROMPT_2B_EMERGENT_ADMIN_2B.md`.
3. ✅ **Prompt 3** — Construtor de páginas (drag & drop, `/admin/paginas`). Spec: `docs/PROMPT_3_CONSTRUTOR_PAGINAS.md`.

Implementado no commit `8407c13` ("Completar visual do admin: Producao/ERP, Financeiro, Envios e Construtor de Paginas").

Ao trabalhar na próxima fase (back-end), faz **um módulo de cada vez**, em **Plan Mode**: descreve a abordagem e espera aprovação antes de implementar. Mantém os diffs pequenos e revisáveis.

## Design tokens (marca DivinArte)

- Cores: verde folha `#2E9E44` (primária/acento) · verde floresta `#14532D` · verde pinho `#2C4A3B` · oliva `#B7BD53` · creme `#F7F4EC` · carvão `#1A1A1A`.
- Fontes (Google Fonts): títulos/logo **Cinzel** · interface **Montserrat** · manuscrito **Caveat**.

## NÃO fazer ainda sem alinhar primeiro (é a próxima fase — lógica)

- Supabase, base de dados, autenticação real, RLS.
- Pagamentos (Stripe, MB Way, Multibanco, PayPal).
- Motor de i18n (react-i18next) — e o blog fica **fora** da tradução.
- Motor de resolução de envios no checkout.

Estas são o trabalho da próxima fase — não as atacar de surpresa numa tarefa não relacionada; confirma o âmbito com o utilizador antes de começar.

## Convenções detectadas

> Preenchido após exploração (sessão 2026-06-26). O código do visual vive em `frontend/`.

### Framework e build
- **React 19** + **JavaScript/JSX** (não TypeScript, apesar de o CONTEXT.md mencionar TS — o projeto Emergent é JS). `jsconfig.json` define o alias **`@/` → `frontend/src/`**.
- **Build:** Create React App via **CRACO** (`craco start/build/test`), **não Vite**. `craco.config.js` na raiz do frontend.
- **Estilos:** Tailwind CSS 3 + shadcn/ui (`components.json`, `src/components/ui/`). Animações via `tailwindcss-animate`.
- **Routing:** `react-router-dom` v7.
- **Outras libs já presentes:** `recharts` (gráficos), `sonner` (toasts), `lucide-react` (ícones), `framer-motion`, `react-hook-form`+`zod`, `@tanstack/react-query`. **DnD Kit ainda NÃO está instalado** — será preciso `yarn add @dnd-kit/...` no Prompt 3.

### Estrutura de pastas (`frontend/src/`)
- `data/mock.js` — mock data do **storefront** (produtos, categorias, blog).
- `context/` — `CartContext`.
- `components/` — componentes do storefront; `components/ui/` — primitivos shadcn.
- `pages/` — páginas do storefront.
- `lib/format.js` — `formatEUR(value)` (Intl pt-PT, EUR).
- `admin/` — **todo o back-office isolado aqui**:
  - `admin/components/` — `AdminLayout` (sidebar+main), `Topbar`, `Breadcrumbs`, `DataTable` (+ `StatusBadge`), `Modal`, `Bits` (`PageHeader`, `SectionTitle`, `FormRow`, `KpiCard`, `fieldClass`).
  - `admin/context/AdminContext.jsx` — provider único com estado de todos os módulos via `useState`; hook `useAdmin()`.
  - `admin/data/mockAdmin.js` — RBAC (`ROLES`, `NAV_PERMISSIONS`, `can(role, navId)`), produtos/encomendas/utilizadores/atributos, séries de KPI, `storeSettings`.
  - `admin/data/mockErp.js` — mock data de Produção/Financeiro/Envios/Idiomas (insumos, fichas técnicas, ordens, compras, séries financeiras, `initialShippingMethods`, `initialLanguages`).
  - `admin/data/mockMarketing.js` — `initialCoupons`, `COUPON_TYPES`, `COUPON_SCOPES` (cupões de desconto).
  - `admin/pages/` — uma página por módulo: catálogo/operação (`Dashboard`, `Products` [+`ProductForm`], `Categories`, `Stock`, `Orders` [+`OrderDetail`], `Blog` [+`ArticleForm`], `Users`, `Settings`, `Coupons`); painel do afiliado (`AfiliadoDashboard`, `AfiliadoProducts`, `AfiliadoSales`, `AfiliadoLinks`).
  - `lib/commission.js` — `calcCommission(product, qty)` / `formatCommission(product)` (comissão de afiliado).
  - `lib/coupons.js` — `validateCoupon(coupon, { subtotal, items })` / `couponToPromo(coupon)` (usados no `CartContext.applyPromo`).

### Design tokens
- Definidos como **variáveis CSS** em `src/index.css` (`:root`): `--da-leaf #2E9E44`, `--da-forest #14532D`, `--da-pine`, `--da-olive`, `--da-cream`, `--da-cream-2`, `--da-ink`, `--da-muted`, `--da-line` (hairline).
- Classes utilitárias próprias em `index.css`: `.btn-da` + `.btn-da-primary/-outline/-ghost`, `.hairline` (borda), `.font-serif-display` (Cinzel), `.font-script` (Caveat), `.font-body` (Montserrat).
- Uso típico no JSX: `text-[var(--da-forest)]`, `bg-white border hairline rounded-2xl`, superfícies claras sobre fundo `#F1ECDF`/creme, cantos `rounded-2xl`, sem sombras pesadas.

### Padrões de componentes (a imitar)
- **Página** = `<div data-testid="admin-x"> <PageHeader title subtitle actions/> ...secções... </div>`. Secções em `bg-white border hairline rounded-2xl p-6` com `<SectionTitle eyebrow title/>`.
- **Listas** = `<DataTable columns data getRowId searchKeys filters toolbarRight rowActions bulkActions pageSize/>`; estados via `<StatusBadge tone="green|amber|blue|red|muted">`.
- **Formulários** = `<FormRow label required hint>` + `className={fieldClass}` nos inputs; selects/textarea com `fieldClass`. Formulários de detalhe em rota própria (ex.: `/admin/produtos/:id`, com `id === "novo"` para criação); edições simples em `<Modal>`.
- **Feedback** = `toast.success/error(...)` de `sonner`; confirmações com `window.confirm`.
- **Moeda** sempre via `formatEUR`. Todos os `data-testid` em kebab-case por módulo.
- **Estado mock** = arrays/objetos iniciais nos ficheiros `mock*.js`, carregados para `useState` no `AdminProvider`; CRUD só atualiza estado local.

### Routing & navegação (onde mexer ao adicionar módulos)
1. `App.js` — adicionar `<Route>` dentro de `<Admin>` (prefixo `/admin`).
2. `admin/components/AdminLayout.jsx` — adicionar item/grupo a `navGroups` (com `id`, `to`, `label`, `icon`).
3. `admin/data/mockAdmin.js` — adicionar o `id` de nav a `NAV_PERMISSIONS` (senão `can()` esconde-o).
4. `admin/components/Breadcrumbs.jsx` — adicionar rótulos PT ao mapa `LABELS`.
5. `admin/context/AdminContext.jsx` — importar do mock e expor `state/setState` se o módulo precisar de estado partilhado.

### Estado de implementação (verificado — sessão 2026-06-28)
- **Mock data:** ✅ `mockErp.js` (insumos, fichas, ordens, compras, finanças, métodos de envio, idiomas), `mockPages.js` (construtor de páginas), `mockMarketing.js` (cupões).
- **Produção + Financeiro:** ✅ feito — páginas `Insumos`, `FichaTecnica`, `OrdensProducao`/`OrdemProducaoDetail`, `FinanceiroOverview`, `Compras`, `Margens`; grupos na sidebar, rotas em `App.js`, ligação ao `AdminContext`, permissões/breadcrumbs.
- **Definições (envios + idiomas):** ✅ feito — `Settings.jsx` usa a lista CRUD de modos de envio (`initialShippingMethods`) e tem o gestor de idiomas (`initialLanguages`, `LANGUAGE_CATALOG`).
- **Gestão de Envios (`/admin/envios`):** ✅ feito — tabs Zonas por País, Distritos PT/ES, Regras por Categoria; secção "Envio" no `ProductForm`.
- **Construtor de Páginas (`/admin/paginas`):** ✅ feito — editor drag & drop com DnD Kit, paleta de blocos, propriedades, undo/redo, pré-visualização responsiva.
- **Afiliados:** ✅ feito (sessão 2026-06-28; papel renomeado de "lojista" para "afiliado" na mesma sessão) — comissão por produto (`commissionType`/`commissionValue` + secção no `ProductForm`, visível só para quem não é `afiliado`); `affiliateCode`/`affiliateActive` nos utilizadores `afiliado` (gerado em `Users.jsx` via `makeAffiliateCode`); `AdminContext.me` deriva do utilizador mock real do papel ativo. Painel próprio em `/admin/painel-afiliado` (+`/produtos`, `/vendas`, `/links`), com grupo de sidebar e `NAV_PERMISSIONS` dedicados (`afiliado_*`) — os outros grupos somem automaticamente para esse papel. Distinto de `/admin/afiliados` (plural), a vista do admin que agrega comissão por afiliado.
- **Cupões de desconto:** ✅ feito — CRUD em `/admin/cupoes` (grupo "Marketing"); código, tipo (%/€), encomenda mínima, validade, limite de uso, âmbito (loja/categoria/produto). Aplicação real no `CartPage` e no `Checkout` (campo no resumo da encomenda, visível em qualquer passo), via `validateCoupon`/`couponToPromo` → `CartContext.applyPromo` (mecanismo já existia, usado antes só pelo bundle "RITUAL10").
- **Vista admin "Afiliados" (`/admin/afiliados`):** ✅ feito — agrega, por afiliado, vendas/receita/comissão acumulada (`Affiliates.jsx`); grupo "Administração" da sidebar, permissão `admin`/`super_admin`.
- **Próximo:** nenhum trabalho de visual pendente. A próxima fase é back-end (Supabase) — ver `docs/CONTEXT.md`.
