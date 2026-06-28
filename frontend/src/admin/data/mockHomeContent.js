// Conteúdo editável da Home (textos/imagens estáticos) — frontend-only.
// Produtos, categorias, depoimentos e posts do blog continuam ligados aos mocks reais (data/mock.js).

// Fontes da marca (classes já definidas em index.css) — sem carregar fontes externas.
export const FONT_OPTIONS = [
  { id: "serif-display", label: "Título (Cinzel)", className: "font-serif-display" },
  { id: "body", label: "Texto (Montserrat)", className: "font-body" },
  { id: "script", label: "Manuscrita (Caveat)", className: "font-script" },
];

// Combinações Tailwind já usadas noutras páginas — garante responsividade e que as classes já existem no build.
export const FONT_SIZE_OPTIONS = [
  { id: "sm", label: "Pequeno", className: "text-2xl sm:text-3xl" },
  { id: "md", label: "Médio (atual)", className: "text-3xl sm:text-4xl" },
  { id: "lg", label: "Grande", className: "text-4xl sm:text-5xl" },
  { id: "xl", label: "Extra grande", className: "text-4xl sm:text-5xl lg:text-6xl" },
];

// Botões reais da Home, por secção — cada "prefix" gera os campos {prefix}Text/Link/Bg/Radius.
export const SECTION_BUTTONS = {
  hero: [
    { prefix: "ctaShop", label: 'Botão "Descobrir a loja"' },
    { prefix: "ctaAbout", label: 'Botão "A nossa história"' },
  ],
  story: [
    { prefix: "cta", label: 'Botão "Saber mais sobre nós"' },
  ],
};

// Links de texto (não-botão) — cada "prefix" gera {prefix}Text/Href.
export const SECTION_LINKS = {
  featured: { prefix: "link", label: 'Link "Ver toda a loja"' },
  blog: { prefix: "link", label: 'Link "Ver todos os artigos"' },
};

// Campos editáveis por secção (consumidos pelo HomeVisualEditor) — botões/links têm UI própria (ver acima),
// "trust" e os bullets de "story" também têm UI própria.
export const HOME_FIELDS = {
  hero: [
    { key: "eyebrow", label: "Texto de abertura", type: "text" },
    { key: "titleLine1", label: "Título (linha 1)", type: "text" },
    { key: "titleLine2", label: "Título (linha 2)", type: "text" },
    { key: "subtitle", label: "Subtítulo", type: "textarea" },
    { key: "image", label: "URL da imagem de fundo", type: "text" },
  ],
  featured: [
    { key: "eyebrow", label: "Texto de abertura", type: "text" },
    { key: "title", label: "Título", type: "text" },
  ],
  categories: [
    { key: "eyebrow", label: "Texto de abertura", type: "text" },
    { key: "title", label: "Título", type: "text" },
  ],
  story: [
    { key: "image", label: "URL da imagem", type: "text" },
    { key: "eyebrow", label: "Texto de abertura", type: "text" },
    { key: "title", label: "Título", type: "text" },
    { key: "paragraph", label: "Texto", type: "textarea" },
  ],
  testimonials: [
    { key: "eyebrow", label: "Texto de abertura", type: "text" },
    { key: "title", label: "Título", type: "text" },
  ],
  blog: [
    { key: "eyebrow", label: "Texto de abertura", type: "text" },
    { key: "title", label: "Título", type: "text" },
  ],
};

export const initialHomeContent = {
  hero: {
    image: "https://images.unsplash.com/photo-1556228852-80b6e5eeff06?auto=format&fit=crop&w=2000&q=70",
    eyebrow: "cuidar com atenção",
    titleLine1: "A divina arte de",
    titleLine2: "cuidar de você.",
    subtitle: "Cosmética natural artesanal feita em pequenos lotes, em Portugal — para que cada gesto de cuidado seja também um momento de pausa.",
    titleFont: "serif-display", titleSize: "xl", titleColor: "#F7F4EC",
    ctaShopText: "Descobrir a loja", ctaShopLink: "/loja", ctaShopBg: "", ctaShopRadius: 999,
    ctaAboutText: "A nossa história", ctaAboutLink: "/sobre", ctaAboutBg: "", ctaAboutRadius: 999,
  },
  trust: {
    labels: ["100% Natural", "Vegano", "Artesanal", "Ingredientes BIO"],
  },
  featured: {
    eyebrow: "novidades da casa",
    title: "Produtos em destaque",
    titleFont: "serif-display", titleSize: "md", titleColor: "#14532D",
    linkText: "Ver toda a loja", linkHref: "/loja",
  },
  categories: {
    eyebrow: "explora por categoria",
    title: "Pequenos rituais, grandes categorias",
    titleFont: "serif-display", titleSize: "md", titleColor: "#14532D",
  },
  story: {
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=75",
    eyebrow: "a nossa história",
    title: "Fórmulas suaves, feitas com mãos atentas.",
    paragraph: "A DivinArte nasceu de um gesto simples — o de cuidar. Cada produto é pensado em pequenos lotes, com ingredientes naturais escolhidos com calma, plantas locais sempre que possível, e a convicção de que beleza é também uma forma de bondade.",
    bullets: [
      "Produção artesanal em Portugal, em pequenos lotes",
      "Ingredientes naturais, vegan-friendly sempre que possível",
      "Embalagem em vidro âmbar, reutilizável",
    ],
    titleFont: "serif-display", titleSize: "md", titleColor: "#F7F4EC",
    ctaText: "Saber mais sobre nós", ctaLink: "/sobre", ctaBg: "", ctaRadius: 999,
  },
  testimonials: {
    eyebrow: "a voz de quem cuida connosco",
    title: "Pequenas palavras grandes",
    titleFont: "serif-display", titleSize: "md", titleColor: "#14532D",
  },
  blog: {
    eyebrow: "do nosso diário",
    title: "Rituais e ingredientes",
    titleFont: "serif-display", titleSize: "md", titleColor: "#14532D",
    linkText: "Ver todos os artigos", linkHref: "/blog",
  },
};
