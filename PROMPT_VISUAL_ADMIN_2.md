Continue in THIS SAME project. Build two things: (A) the PRODUCTION/ERP and FINANCIAL admin modules, and (B) modifications to the existing /admin/definicoes (Settings) page. Reuse the existing admin shell, design system, DataTable / form / KPI / chart components, fonts, and colors.

SAME CONSTRAINTS:
- Frontend UI only. No backend, no database, no MongoDB, no API, no real auth.
- All data from hardcoded mock data; create/edit/delete update local state only.
- All visible text in Portuguese (Portugal). Use € where relevant.
- Reuse existing components and keep visual consistency. Add new pages under /admin with new sidebar groups.
- Desktop-first, responsive down to tablet.

PART A — PRODUCTION/ERP + FINANCIAL MODULES
Add two new sidebar groups: "Produção" and "Financeiro".

PRODUÇÃO:
1. Insumos (matérias-primas): a DataTable (nome, categoria de insumo, unidade [g/ml/un/kg], fornecedor, custo por unidade €, quantidade em stock, stock mínimo, estado) with a low-stock indicator; a create/edit form with those fields.
2. Ficha Técnica (Fórmulas) — the centerpiece: select a produto (from the catalog), then build its recipe by adding rows of (insumo, quantidade, unidade). As rows change, LIVE-calculate and display: "custo total de produção" (sum of insumo cost × quantity) and, comparing with the product's preço de venda, the "margem" (% and €). Allow saving the ficha técnica per product. Show a list of produtos indicating which already have a ficha técnica and which don't.
3. Ordens de Produção: a DataTable (nº, produto, quantidade a produzir, estado [planeada / em produção / concluída], data); a create-order form (produto, quantidade); a detail view that — from the product's ficha técnica × quantidade — shows the "insumos necessários" (required vs available stock, flagging shortages in red) and the "custo total da ordem"; a status flow; and helper text noting that completing an order consumes insumos from stock and adds finished products to stock (the actual logic is handled later).

FINANCEIRO:
4. Financeiro › Visão Geral: a financial dashboard — KPI cards (Receita, Custos, Lucro, Margem média); a receita-vs-custos chart over time; a "custos por categoria" breakdown chart.
5. Financeiro › Compras: a purchases DataTable (nº, fornecedor, data, total €, estado) for insumo purchases; a create-purchase form (fornecedor, data, linhas de insumos com quantidade e custo, total calculado), with helper text noting it feeds insumo stock and cost.
6. Financeiro › Margens: a per-product margins table (produto, custo de produção [from ficha técnica], preço de venda, margem € e %), sortable, with visual indicators for low margins.

PART B — MODIFY /admin/definicoes (Settings)
Update the EXISTING Settings page (do not duplicate it):

B1. Modo de Envio — replace any fixed shipping toggles with a MANAGEABLE LIST of shipping methods the admin can create:
- A list/table of shipping methods (nome, custo €, prazo estimado, estado ativo/inativo).
- An "Adicionar modo de envio" button opening a form/modal to create a new method: nome (e.g., CTT Normal, CTT Expresso, Recolha na loja), descrição, custo €, prazo estimado (e.g., "2-3 dias úteis"), zonas/condições (optional), estado.
- Edit and remove existing methods. Full CRUD on mock data.

B2. Preferências Gerais — add a SITE LANGUAGES manager:
- A section where the Super Admin chooses which languages the site is displayed in: a list of languages (Português, Inglês, Espanhol, Francês, …) with enable toggles, the ability to "Adicionar idioma", and an "Idioma predefinido" selector.
- Add clear helper text under this section, exactly: "Os idiomas traduzem as páginas gerais do site (interface). Os conteúdos escritos do blog não são traduzidos automaticamente por esta definição."
- This controls interface localization for the general site pages only.

DELIVERABLE:
The new Produção and Financeiro modules under /admin (consistent with the existing admin), plus the updated /admin/definicoes with manageable shipping methods and the site-languages manager — all on mock data, no backend.