# CONTEXT.md — DivinArte (Plataforma E-commerce + ERP) — v2

> **Documento mestre do projeto. Toda sessão de trabalho no Claude Code deve LER este arquivo primeiro.**
> Última atualização: 26/06/2026 · Versão: 2

---

## 0. O que mudou nesta versão (v2)

- **Emergent** agora é plano **pago** (export via GitHub habilitado); usado **apenas** para o visual.
- **Hospedagem definida:** front-end na **Vercel** (deploy automático a cada `git push`); banco/auth/API no **Supabase**.
- **Lovable descartado** (não importa repositórios; é construtor de IA, não host).
- **Modos de envio** são **geríveis pelo admin** (CRUD), não fixos.
- Site **multi-idioma na interface** (i18n); **o blog NÃO é traduzido** por esta definição.
- Novo **Sistema de Envios** por zona (país), por distrito (PT/ES) e por produto/categoria, com página dedicada `/admin/envios`.
- **Painel administrativo** construído visualmente no Emergent (Prompts 1, 2, 2B e 3).

---

## 1. Visão geral

**DivinArte** é uma plataforma unificada e customizada (Caminho B: sistema único, **não** híbrido com Shopify/WooCommerce) que combina:

- **Loja online (e-commerce)** de cosméticos naturais artesanais. Mercado-alvo: **Portugal** (moeda €, copy em português).
- **ERP interno**: produção, insumos, fórmulas (ficha técnica), estoque e financeiro.
- **CMS**: blog e construtor de páginas.

Marca: **DivinArte — Cosmética natural artesanal**. Tom de voz: **cristão protestante, sereno, acolhedor**. Assinatura: *"A divina arte de cuidar de você"*.

---

## 2. Decisões já tomadas

- Arquitetura: **sistema único custom** (não híbrido).
- **Emergent** (plano pago) é usado **APENAS** para gerar o **visual** (loja + painel do cliente + painel admin) com mock data. Nenhuma lógica ou back-end é feito nele. Export via **"Save to GitHub"**.
- **Lógica, back-end, banco, autenticação, pagamentos, i18n e motor de envios** são feitos no **VS Code + Claude Code**.
- **Banco de dados:** **Supabase (PostgreSQL)**. **NÃO usar MongoDB** (default do Emergent é descartado).
- **Hospedagem:** front-end na **Vercel** (auto-deploy via GitHub). Supabase para dados/auth.
- **Pagamentos:** **Stripe** primeiro; **MB Way / Multibanco** e **PayPal** depois.

---

## 3. Stack técnica

**Front-end:** React 18 + TypeScript + Vite · Tailwind CSS + shadcn/ui · React Router · TanStack React Query · React Hook Form + Zod · Recharts (dashboards) · DnD Kit (construtor de páginas e ordenações) · TipTap (editor do blog) · **react-i18next (i18n da interface)**.

**Back-end / dados:** Supabase (PostgreSQL, Auth, Storage, RLS) · Edge Functions para lógica sensível (ex.: editar senha de usuário via Admin API, webhooks de pagamento, motor de cálculo de envio).

**Hospedagem:** **Vercel** (front-end, deploy automático a cada push) · **Supabase** (banco/auth/storage).

**Pagamentos:** Stripe (cartão e múltiplos métodos); depois MB Way/Multibanco e PayPal, Klarna, LusoPay.

**Repositório:** GitHub (ex.: `divinarte-storefront`).

---

## 4. Design system (extraído da marca)

**Cores:**
| Token | Hex | Uso |
|---|---|---|
| Verde folha (primária) | `#2E9E44` | Botões, links, destaques, nav ativo |
| Verde floresta (secundária) | `#14532D` | Títulos, sidebar, ícones |
| Verde pinho | `#2C4A3B` | Seções/fundos escuros |
| Oliva (acento) | `#B7BD53` | Selos, detalhes |
| Creme | `#F7F4EC` | Fundos claros |
| Carvão | `#1A1A1A` | Texto |
| Branco | `#FFFFFF` | Base |

**Tipografia (Google Fonts):** Títulos/logo: **Cinzel** · Corpo/interface: **Montserrat** · Toques manuscritos: **Caveat**.

**Estética:** natural, botânica, premium-artesanal, serena. No admin: back-office limpo, superfícies claras, verde folha como acento. Flat, sem sombras pesadas.

---

## 5. Papéis de usuário (RBAC)

- **super_admin** — controla tudo; gerencia todas as contas, edita campos personalizáveis e até a **senha** de usuários (via Supabase Admin API em Edge Function). **Tudo no sistema é editável por ele.**
- **admin** — gestão geral da loja e conteúdo.
- **producao** — produção, insumos, fórmulas, estoque.
- **lojista** — vendas e pedidos.
- **cliente** — compra na loja, área do cliente.

**Cadastro:** e-mail/senha + **login com Google** (OAuth via Supabase Auth).
**RLS:** políticas por papel em todas as tabelas. Usar casting `::text` ao comparar enum de papel com texto (evita `operator does not exist: text = app_role`).

---

## 6. Módulos (10) + Painel Admin

1. **Auth & Usuários** — Supabase Auth + Google OAuth; papéis; RLS; gestão de usuários (super_admin edita tudo, inclusive senha).
2. **Catálogo** — produtos, variantes, categorias hierárquicas, tags. *(Formulário de produto inclui secção "Envio" — ver §11.)*
3. **Filtros & categorias inteligentes** — filtros dinâmicos por categoria/atributo.
4. **Estoque** — saldo e movimentações por produto.
5. **Produção / Fórmulas** *(núcleo customizado)* — insumos com custo; ficha técnica (BOM: produto → insumos + quantidades); ordem de produção que baixa insumo e calcula custo.
6. **Financeiro** — compras de insumo, receita, margens, relatórios.
7. **Loja (storefront)** — home, catálogo, detalhe, carrinho, checkout, área do cliente. *(Visual gerado no Emergent; multi-idioma na interface — ver §12.)*
8. **Pagamentos** — Stripe; depois MB Way/Multibanco, PayPal.
9. **Blog / CMS** — editor TipTap, artigos, categorias. *(Conteúdo NÃO traduzido pelo i18n — ver §12.)*
10. **Construtor de páginas** — drag & drop (DnD Kit). O mais complexo; por último.

➕ **Painel Admin** (`/admin`) onde o super_admin edita todos os campos de tudo. Inclui **Definições** (`/admin/definicoes`) e **Gestão de Envios** (`/admin/envios`).

---

## 7. Roadmap em fases

- **Fase 0 — Fundação:** Supabase, auth + papéis + RLS, design system.
- **Fase 1 — MVP loja:** catálogo + categorias + filtros + carrinho + checkout + Stripe.
- **Fase 2 — Admin + Estoque.**
- **Fase 3 — Produção / Fórmulas.**
- **Fase 4 — Financeiro.**
- **Fase 5 — Conteúdo:** blog e, por último, construtor de páginas.

> Visual de todas as áreas (loja, painel cliente, admin) é gerado no Emergent; a lógica de cada fase é implementada no VS Code.

---

## 8. Fluxo de trabalho: Emergent → VS Code → Vercel

1. **Emergent (pago)** gera o visual (loja + painel cliente + admin), só mock data.
2. **"Save to GitHub"** → repositório.
3. **Clonar** o repo no VS Code.
4. **Claude Code:** monta projeto Vite + TS limpo, porta os componentes de UI do Emergent e implementa todo o back-end (Supabase, auth, RLS, lógica, pagamentos, i18n, motor de envios).
5. **Deploy:** Vercel conectada ao repo → **auto-deploy a cada `push`**.
   - Chaves do Supabase: `.env` (local, **não** vai pro GitHub) **e** Environment Variables da Vercel.
   - A `anon key` pode ficar no front (a RLS protege os dados). A **`service_role key` NUNCA** vai no front — só em Edge Functions (servidor).

> Nota: o stack nativo do Emergent (React + FastAPI + MongoDB) é descartado; aproveita-se **só a camada React/UI**, substituindo o back-end por Supabase.

---

## 9. Regras de trabalho com o Claude Code

- **Ler este `CONTEXT.md` no início de cada sessão.**
- Explicar o problema em **linguagem simples** antes de gerar/alterar código.
- Mudanças de SQL vão **direto no Supabase SQL Editor**.
- Manter a stack e os papéis acima; **não introduzir MongoDB**.
- Preferir componentes reutilizáveis e tipados (TypeScript + Zod).

---

## 10. Conformidade (cosméticos UE/Portugal)

Cosmético na UE (Reg. (CE) 1223/2009) **não pode alegar "curar" ou "tratar doenças"**.
- **Evitar:** "cura", "trata ansiedade/insónia", "tratamento de doenças".
- **Preferir:** "auxilia no relaxamento", "promove bem-estar", "hidrata profundamente", "sensação de alívio e conforto".

Vale para loja, blog e rótulos.

---

## 11. Sistema de Envios

**Modos de Envio (base):** geríveis pelo admin em `/admin/definicoes` (CRUD — nome, custo €, prazo, estado).

**Página dedicada `/admin/envios` "Gestão de Envios"**, com três níveis de regra:
- **Zonas por País** — métodos disponíveis + override de custo/prazo por país (Portugal, Espanha, Resto da Europa, Internacional, e adicionáveis).
- **Distritos (PT e ES)** — Portugal: 18 distritos + Madeira + Açores; Espanha: comunidades autónomas. Override de métodos/custo/prazo por distrito. **O distrito tem prioridade sobre o país.**
- **Regras por Categoria/Produto** — que categorias podem usar que métodos; regra predefinida para categorias sem regra específica.

**Formulário de produto:** secção **"Envio"** — *Herdar das regras da categoria* (predefinido) ou *Personalizar* (escolher métodos específicos do produto).

**Lógica de resolução (VS Code):** as opções no checkout = **interseção** entre (métodos elegíveis do produto/categoria) ∩ (métodos que chegam ao destino), com **distrito > país** para disponibilidade e custo.

**Modelo de dados sugerido (Supabase):** `shipping_methods` · `shipping_zones` (país) · `shipping_district_rules` (PT/ES) · `shipping_category_rules` · `product_shipping_overrides`.

---

## 12. Internacionalização / Idiomas (i18n)

- O **Super Admin** gere os idiomas em `/admin/definicoes › Preferências Gerais` (ativar idiomas, definir **idioma predefinido**, adicionar idioma).
- A tradução aplica-se às **PÁGINAS GERAIS do site (interface)**.
- **O CONTEÚDO ESCRITO DO BLOG NÃO é traduzido automaticamente** por esta definição.
- **Implementação (VS Code):** `react-i18next` + ficheiros de tradução para os textos de interface. O blog fica **fora** do i18n.

---

## 13. Produtos (linha atual — exemplos)

- Spray Sono e Ansiedade (floral) — 100ml
- Spray Concentração / Mindfulness — 100ml
- Bálsamo Analgésico
- Manteiga Corporal Vegana — 100ml
- Linha capilar (reconstrutor capilar, etc.)

Categorias sugeridas: Faciais, Corporais, Capilares, Bem-estar / Aromaterapia (com subcategorias).
