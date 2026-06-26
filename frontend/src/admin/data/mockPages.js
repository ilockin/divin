// Construtor de Páginas (Prompt 3) — catálogo de blocos e páginas mock (frontend-only)

// Ordem da paleta de blocos
export const BLOCK_LIBRARY = [
  { type: "hero", label: "Hero" },
  { type: "texto", label: "Texto" },
  { type: "imagem", label: "Imagem" },
  { type: "galeria", label: "Galeria" },
  { type: "produtos", label: "Grade de Produtos" },
  { type: "banner", label: "Banner / CTA" },
  { type: "video", label: "Vídeo" },
  { type: "testemunhos", label: "Testemunhos" },
  { type: "faq", label: "FAQ (acordeão)" },
  { type: "newsletter", label: "Newsletter" },
  { type: "colunas", label: "Colunas" },
  { type: "espacador", label: "Espaçador" },
];

export const BLOCK_LABELS = BLOCK_LIBRARY.reduce((acc, b) => { acc[b.type] = b.label; return acc; }, {});

const UNSPLASH = "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=70";
const UNSPLASH2 = "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&q=70";
const UNSPLASH3 = "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1200&q=70";

// Props por defeito de cada tipo de bloco
const DEFAULTS = {
  hero: () => ({ title: "A divina arte de cuidar de si", subtitle: "Cosmética natural artesanal, feita com serenidade.", buttonText: "Ver loja", buttonLink: "/loja", align: "center", bg: "#14532D" }),
  texto: () => ({ text: "Escreva aqui o seu texto. Pode ser uma introdução, uma história da marca ou qualquer conteúdo.", align: "left" }),
  imagem: () => ({ src: UNSPLASH, alt: "Imagem", align: "center" }),
  galeria: () => ({ items: [{ url: UNSPLASH }, { url: UNSPLASH2 }, { url: UNSPLASH3 }] }),
  produtos: () => ({ title: "Os nossos produtos", count: 3 }),
  banner: () => ({ title: "Oferta especial", text: "Portes grátis em compras acima de 49€.", buttonText: "Saber mais", buttonLink: "/loja", bg: "#2E9E44" }),
  video: () => ({ url: "", caption: "Legenda do vídeo (demonstração)." }),
  testemunhos: () => ({ title: "O que dizem de nós", items: [{ name: "Mariana F.", text: "Produtos maravilhosos, sinto a diferença na pele." }, { name: "João P.", text: "Aromas suaves e naturais. Recomendo!" }] }),
  faq: () => ({ title: "Perguntas frequentes", items: [{ q: "Os produtos são veganos?", a: "A maioria da nossa linha é vegana e indicamo-lo em cada produto." }, { q: "Qual o prazo de entrega?", a: "Entre 2 a 3 dias úteis em Portugal Continental." }] }),
  newsletter: () => ({ title: "Subscreva a nossa newsletter", text: "Receba novidades e rituais de bem-estar.", buttonText: "Subscrever" }),
  colunas: () => ({ col1: "Texto da coluna da esquerda.", col2: "Texto da coluna da direita." }),
  espacador: () => ({ height: 48 }),
};

// Campos escalares editáveis no painel de propriedades
export const BLOCK_FIELDS = {
  hero: [
    { key: "title", label: "Título", type: "text" },
    { key: "subtitle", label: "Subtítulo", type: "textarea" },
    { key: "buttonText", label: "Texto do botão", type: "text" },
    { key: "buttonLink", label: "Link do botão", type: "text" },
    { key: "align", label: "Alinhamento", type: "select", options: ["left", "center", "right"] },
    { key: "bg", label: "Cor de fundo", type: "color" },
  ],
  texto: [
    { key: "text", label: "Texto", type: "textarea" },
    { key: "align", label: "Alinhamento", type: "select", options: ["left", "center", "right"] },
  ],
  imagem: [
    { key: "src", label: "URL da imagem", type: "text" },
    { key: "alt", label: "Texto alternativo", type: "text" },
    { key: "align", label: "Alinhamento", type: "select", options: ["left", "center", "right"] },
  ],
  produtos: [
    { key: "title", label: "Título", type: "text" },
    { key: "count", label: "Nº de produtos", type: "number" },
  ],
  banner: [
    { key: "title", label: "Título", type: "text" },
    { key: "text", label: "Texto", type: "textarea" },
    { key: "buttonText", label: "Texto do botão", type: "text" },
    { key: "buttonLink", label: "Link do botão", type: "text" },
    { key: "bg", label: "Cor de fundo", type: "color" },
  ],
  video: [
    { key: "url", label: "URL do vídeo (embed)", type: "text" },
    { key: "caption", label: "Legenda", type: "text" },
  ],
  testemunhos: [{ key: "title", label: "Título", type: "text" }],
  faq: [{ key: "title", label: "Título", type: "text" }],
  newsletter: [
    { key: "title", label: "Título", type: "text" },
    { key: "text", label: "Texto", type: "textarea" },
    { key: "buttonText", label: "Texto do botão", type: "text" },
  ],
  colunas: [
    { key: "col1", label: "Coluna esquerda", type: "textarea" },
    { key: "col2", label: "Coluna direita", type: "textarea" },
  ],
  espacador: [{ key: "height", label: "Altura (px)", type: "number" }],
};

// Blocos com listas de itens (geridas à parte no painel de propriedades)
export const BLOCK_LISTS = {
  galeria: { prop: "items", label: "Imagens", newItem: () => ({ url: UNSPLASH }), fields: [{ key: "url", label: "URL da imagem", type: "text" }] },
  testemunhos: { prop: "items", label: "Testemunhos", newItem: () => ({ name: "", text: "" }), fields: [{ key: "name", label: "Nome", type: "text" }, { key: "text", label: "Texto", type: "textarea" }] },
  faq: { prop: "items", label: "Perguntas", newItem: () => ({ q: "", a: "" }), fields: [{ key: "q", label: "Pergunta", type: "text" }, { key: "a", label: "Resposta", type: "textarea" }] },
};

let blockSeq = 0;
export const makeBlock = (type) => {
  blockSeq += 1;
  return { id: `b-${Date.now()}-${blockSeq}`, type, props: (DEFAULTS[type] || (() => ({})))() };
};

// Páginas mock iniciais
export const initialPages = [
  {
    id: "pg-home", title: "Página inicial", slug: "inicio", status: "publicado", date: "2025-10-18",
    blocks: [
      { id: "b1", type: "hero", props: DEFAULTS.hero() },
      { id: "b2", type: "produtos", props: { title: "Mais vendidos", count: 3 } },
      { id: "b3", type: "banner", props: DEFAULTS.banner() },
      { id: "b4", type: "newsletter", props: DEFAULTS.newsletter() },
    ],
  },
  {
    id: "pg-sobre", title: "Sobre nós", slug: "sobre", status: "rascunho", date: "2025-10-25",
    blocks: [
      { id: "b1", type: "texto", props: { text: "A DivinArte nasceu do amor pela natureza e pelo cuidado sereno.", align: "center" } },
      { id: "b2", type: "imagem", props: DEFAULTS.imagem() },
    ],
  },
];
