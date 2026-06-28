# Prompt de primeiro build (loja DivinArte, SOMENTE FRONT-END)

Cole TUDO que está dentro do bloco abaixo no campo de chat da ferramenta de geração visual como seu primeiro prompt.

Quando o agente fizer perguntas antes de construir, responda:
- Chave de LLM: **"Use the Universal LLM Key."**
- Sistema de login / autenticação: **"Not needed — build the UI screens only, no real auth, no backend."**
- Banco de dados / back-end: **"Do not build any backend or database. Frontend only with mock data."**
- Começar: **"Start building based on this spec."**

> Dica de créditos: deixe o teto de orçamento baixo e peça refinamentos depois, **um de cada vez**.

---

```
Build the FRONT-END ONLY of an e-commerce storefront for a natural artisanal cosmetics brand called "DivinArte".

IMPORTANT CONSTRAINTS (read carefully):
- Build ONLY the React frontend: pages, components, routing, styling, and interactions.
- DO NOT build any backend, database, MongoDB, API, or authentication logic.
- Use hardcoded mock data (a single local TS/JSON file) for all products, categories, blog posts, and a demo user.
- All interactions (add to cart, filters, forms, cart total) work client-side against the mock data only.
- All visible interface text and content must be in Portuguese (Portugal market). Prices in Euro (€).
- Use React + Tailwind CSS. Build reusable, well-structured components (a shadcn/ui-style component library is welcome). Fully responsive, mobile-first.

BRAND & DESIGN SYSTEM:
- Voice: natural, serene, caring, artisanal, with a gentle spiritual warmth. Brand signature line: "A divina arte de cuidar de você". Tagline under the logo: "Cosmética natural artesanal".
- Colors: primary leaf green #2E9E44; forest green #14532D; pine green #2C4A3B (for dark sections); olive accent #B7BD53; cream background #F7F4EC; charcoal text #1A1A1A; white #FFFFFF.
- Typography (Google Fonts): headings and the logo wordmark in "Cinzel" (roman serif, uppercase); body and UI in "Montserrat"; occasional handwritten accents (banners, callouts) in "Caveat".
- Aesthetic: botanical, organic, premium-artisanal. Lots of whitespace, soft rounded corners, leafy/nature imagery, amber-glass product photos on green/leafy backgrounds. Flat and clean — no heavy shadows or gradients.
- Logo: the wordmark "DIVINARTE" set in Cinzel, with a small two-tone green leaf above it.

SCREENS / PAGES TO BUILD:
1. Global layout: sticky header (logo; nav: Início, Loja, Sobre, Blog, Contacto; search icon; cart icon with item count; account icon; a small "EUR / PT" currency+language indicator) and a rich footer (brand mini-story, quick links, categories, newsletter signup, social icons, payment badges).
2. Home: hero with brand promise + CTA; featured products carousel; categories grid; "Nossa história" brand-story section (natural, artisanal, values); a trust strip (100% Natural, Vegano, Artesanal, BIO); customer testimonials; latest blog posts teaser; newsletter section.
3. Shop / catalog: product grid with cards (image, name, short benefit, € price, add-to-cart); left sidebar with hierarchical category filters (categories + subcategories) and attribute filters (e.g., Tipo de pele, Finalidade, Vegano); search and sort (Preço, Novidades, Popularidade); pagination.
4. Product detail: image gallery with thumbnails; name; € price; short and long description; benefits list; "Modo de uso"; size/variant selector; quantity; add-to-cart; trust badges; related products.
5. Cart: a slide-over drawer AND a full cart page (line items, quantity edit, remove, subtotal, shipping note, checkout button).
6. Checkout (UI ONLY, mocked, multi-step): step 1 contact + shipping address; step 2 shipping method; step 3 payment method selection (show Cartão/Stripe, MB Way, Multibanco, PayPal as selectable options — NO real processing); an order-summary sidebar; a "Finalizar compra" button leading to a success/confirmation screen.
7. Customer account area (UI shells only, no real auth): login and register screens (with a "Continuar com Google" button — visual only); account dashboard; "Os meus pedidos" order history (mock); profile/details form; saved addresses.
8. Blog: a blog list (cards with cover, title, excerpt, category, date) and a single article page (cover, title, rich-text content, author, related posts).
9. Static pages: "Sobre" (brand story, artisanal and natural values, a gentle Christian-rooted caring tone) and "Contacto" (contact form UI + info).

CONTENT / COPY GUIDANCE (regulatory-safe):
- Use compliant wellness cosmetic copy. DO NOT claim to cure or treat diseases. Avoid "cura", "trata ansiedade/insónia", "tratamento de doenças". Prefer "auxilia no relaxamento", "promove bem-estar", "hidrata profundamente", "sensação de alívio e conforto".
- Example mock products: "Spray Sono e Ansiedade" (floral, 100ml), "Spray Concentração / Mindfulness" (100ml), "Bálsamo Analgésico", "Manteiga Corporal Vegana" (100ml), and one hair-care item. Create categories: Faciais, Corporais, Capilares, Bem-estar / Aromaterapia — each with a couple of subcategories.

DELIVERABLE:
A cohesive, polished, fully responsive React + Tailwind frontend with all the pages above, consistent shared components, and the DivinArte design system applied throughout — running on mock data only, with NO backend.
```

---

## Refinamentos sugeridos (depois do primeiro build, um de cada vez)

- "Make the hero section taller and add a soft leafy background image."
- "On the product cards, show the benefit text smaller and the price more prominent."
- "Add a sticky 'Adicionar ao carrinho' bar on the product detail page for mobile."
- "Create a 4th category section on the home page with an image banner."

## O que NÃO pedir à ferramenta de geração visual (fica pro VS Code + Claude Code)

- Painel administrativo, ERP, produção, insumos, fórmulas, estoque, financeiro.
- Integração real de pagamentos (Stripe, MB Way, etc.).
- Autenticação real, banco de dados, Supabase, RLS.

Esses módulos são back-end e lógica — feitos no VS Code para não gastar créditos e não depender do MongoDB padrão dessa ferramenta.
