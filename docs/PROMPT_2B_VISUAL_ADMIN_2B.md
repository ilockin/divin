Continue in THIS SAME project. Build a dedicated SHIPPING MANAGEMENT page and add a shipping section to the existing product form. Reuse the existing admin shell, design system, DataTable / form components, fonts, and colors. The base "Modos de Envio" (shipping methods) already exist in /admin/definicoes — REUSE that same mock data here (populate the method dropdowns from it).



SAME CONSTRAINTS:

\- Frontend UI only. No backend, no database, no MongoDB, no API, no real auth.

\- All data from hardcoded mock data; create/edit/delete update local state only.

\- All visible text in Portuguese (Portugal). Use € where relevant.

\- Reuse existing components and keep visual consistency. Desktop-first, responsive to tablet.



NEW PAGE — /admin/envios "Gestão de Envios" (add it to the sidebar).

Organize the page in three tabs:



TAB 1 — "Zonas por País":

\- A table of countries/zones with the shipping methods available in each (shown as chips). Seed with: Portugal, Espanha, Resto da Europa, Internacional.

\- An edit modal per zone to: select which shipping methods are available (multi-select from the existing methods), optionally override the custo (€) and prazo per method for that zone, and set estado ativo/inativo.

\- An "Adicionar país/zona" button to add more countries.



TAB 2 — "Distritos (Portugal e Espanha)":

\- A country switch (Portugal / Espanha).

\- For Portugal, list all 18 distritos PLUS Madeira and Açores. For Espanha, list the comunidades autónomas.

\- A table of distritos/regiões where, per district, the admin assigns which shipping methods apply and can override custo/prazo (e.g., Madeira and Açores typically differ from the mainland). Edit modal per district.

\- Helper text: "Estas regras são mais específicas e têm prioridade sobre a zona do país."



TAB 3 — "Regras por Categoria/Produto":

\- A table mapping product categories to the shipping methods allowed for them (chips), with an edit modal to select the allowed methods. Include a "regra predefinida" applied to categories without a specific rule.

\- Helper text: "Define que tipos de produto podem usar que modos de envio."



PRODUCT FORM UPDATE (Catálogo › Produtos, create/edit form):

\- Add an "Envio" section with a choice: "Herdar das regras da categoria" (default) OR "Personalizar". When "Personalizar" is selected, let the admin pick the specific shipping methods allowed for this product (multi-select from the existing methods).



DELIVERABLE:

The /admin/envios page with the three tabs (Zonas por País; Distritos PT/ES; Regras por Categoria/Produto) plus the new "Envio" section in the product form — all reusing the existing components and the shipping-methods mock data, on mock data only, no backend.

