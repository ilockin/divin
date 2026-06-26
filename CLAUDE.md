# CLAUDE.md — DivinArte

> O Claude Code lê este ficheiro no início de cada sessão.
> **Especificação completa do projeto: `docs/CONTEXT.md` — lê SEMPRE primeiro.**
> **Gestor de pacotes: `yarn`** — usar `yarn install`, `yarn dev`, `yarn add <pkg>` (nunca `npm`).

## Fase atual: terminar o VISUAL (mock data)

Estamos a continuar um projeto cujo visual começou no Emergent. Agora o Claude Code completa o restante do visual, **sem back-end**:
- Apenas UI: páginas, componentes, routing, estilos, interações.
- **Mock data** (ficheiro local). Nada de Supabase, base de dados, API real ou autenticação real — isso é a próxima fase.
- Todo o texto visível em **Português (Portugal)**. Usar € onde aplicável.

## Regra de ouro: continuar o MESMO estilo

- **Imita as convenções já existentes** no projeto: estrutura de pastas, padrões de componentes, design tokens, forma de organizar os mock data e o routing.
- **Não introduzas novos padrões nem bibliotecas** a não ser que a spec peça explicitamente (ex.: DnD Kit no construtor de páginas).
- **Reutiliza** os componentes que já existem (DataTable, formulários, cards, modais, etc.).

## Ordem de construção (o que falta)

1. **Prompt 2** — completar o que ficou por fazer: módulos Produção/ERP e Financeiro + alterações em `/admin/definicoes`. Spec: `docs/PROMPT_EMERGENT_ADMIN_2.md`.
2. **Prompt 2B** — Gestão de Envios (`/admin/envios`) + secção "Envio" no formulário de produto. Spec: `docs/PROMPT_EMERGENT_ENVIOS.md`.
3. **Prompt 3** — Construtor de páginas (drag & drop). Spec: `docs/PROMPT_3_CONSTRUTOR_PAGINAS.md`.

Faz **um módulo de cada vez**, em **Plan Mode**: descreve a abordagem e espera aprovação antes de implementar. Mantém os diffs pequenos e revisáveis.

## Design tokens (marca DivinArte)

- Cores: verde folha `#2E9E44` (primária/acento) · verde floresta `#14532D` · verde pinho `#2C4A3B` · oliva `#B7BD53` · creme `#F7F4EC` · carvão `#1A1A1A`.
- Fontes (Google Fonts): títulos/logo **Cinzel** · interface **Montserrat** · manuscrito **Caveat**.

## NÃO fazer agora (é a próxima fase — lógica)

- Supabase, base de dados, autenticação real, RLS.
- Pagamentos (Stripe, MB Way, Multibanco, PayPal).
- Motor de i18n (react-i18next) — e o blog fica **fora** da tradução.
- Motor de resolução de envios no checkout.

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
  - `admin/data/mockErp.js` — **já contém** os mock data de Produção/Financeiro/Envios/Idiomas (insumos, fichas técnicas, ordens, compras, séries financeiras, `initialShippingMethods`, `initialLanguages`). Falta ligá-los e construir as páginas.
  - `admin/pages/` — uma página por módulo (`Dashboard`, `Products` [+`ProductForm`], `Categories`, `Stock`, `Orders` [+`OrderDetail`], `Blog` [+`ArticleForm`], `Users`, `Settings`).

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

### Estado de implementação do Prompt 2 (verificado)
- **Mock data:** ✅ já existe em `mockErp.js` (insumos, fichas, ordens, compras, finanças, métodos de envio, idiomas).
- **Parte A (Produção + Financeiro):** ❌ por fazer — sem páginas, sem grupos na sidebar, sem rotas, sem ligação ao `AdminContext`, sem permissões/breadcrumbs.
- **Parte B (Definições):** ❌ por fazer — `Settings.jsx` ainda usa os toggles de envio fixos (Standard/Expresso) em vez da lista CRUD de modos de envio; e não tem o gestor de idiomas. Os dados (`initialShippingMethods`, `initialLanguages`, `LANGUAGE_CATALOG`) já existem mas não estão a ser usados.
