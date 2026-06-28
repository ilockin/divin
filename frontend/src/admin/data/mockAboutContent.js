// Conteúdo editável da página "Sobre" (textos/imagens estáticos) — frontend-only.

export const SECTION_BUTTONS = {
  cta: [{ prefix: "button", label: 'Botão "Descobrir a loja"' }],
};

export const ABOUT_FIELDS = {
  hero: [
    { key: "eyebrow", label: "Texto de abertura", type: "text" },
    { key: "title", label: "Título", type: "text" },
    { key: "subtitle", label: "Subtítulo", type: "textarea" },
    { key: "image", label: "URL da imagem de fundo", type: "text" },
  ],
  story: [
    { key: "image", label: "URL da imagem", type: "text" },
    { key: "eyebrow", label: "Texto de abertura", type: "text" },
    { key: "title", label: "Título", type: "text" },
    { key: "paragraph1", label: "Texto (parágrafo 1)", type: "textarea" },
    { key: "paragraph2", label: "Texto (parágrafo 2)", type: "textarea" },
  ],
  values: [
    { key: "eyebrow", label: "Texto de abertura", type: "text" },
    { key: "title", label: "Título", type: "text" },
  ],
  cta: [
    { key: "eyebrow", label: "Texto de abertura", type: "text" },
    { key: "title", label: "Título", type: "text" },
  ],
};

export const initialAboutContent = {
  hero: {
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=2000&q=70",
    eyebrow: "a nossa história",
    title: "Cuidar é uma forma de bondade.",
    subtitle: "A DivinArte nasce do gesto simples de cuidar. Pequenos lotes, ingredientes naturais, mãos atentas — para que cada produto seja um momento de pausa.",
    titleFont: "serif-display", titleSize: "xl", titleColor: "#F7F4EC",
  },
  story: {
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=70",
    eyebrow: "como começou",
    title: "Um diário de plantas e gestos.",
    paragraph1: "A nossa marca foi crescendo aos poucos — entre infusões, óleos macerados e cadernos cheios de notas. Acreditamos que a cosmética pode ser feita com a mesma atenção com que se cozinha em casa: poucos ingredientes, escolhidos com cuidado, e respeito pelo tempo.",
    paragraph2: "Inspiramo-nos numa visão serena e cristã do cuidado — cuidar do outro como gesto silencioso de amor, sem promessas grandiosas, sem milagres. Apenas pequenos rituais, repetidos com atenção.",
    titleFont: "serif-display", titleSize: "md", titleColor: "#14532D",
  },
  values: {
    eyebrow: "os nossos valores",
    title: "No que acreditamos",
    titleFont: "serif-display", titleSize: "md", titleColor: "#14532D",
    items: [
      { title: "Natural", text: "Ingredientes de origem botânica, escolhidos pela sua bondade." },
      { title: "Cuidado", text: "Pequenos lotes, mãos atentas, produção artesanal em Portugal." },
      { title: "Sereno", text: "Aromas suaves, embalagens limpas, gestos sem pressa." },
      { title: "Honesto", text: "Comunicação clara, sem promessas que não podemos cumprir." },
    ],
  },
  cta: {
    eyebrow: "vamos cuidar juntos",
    title: "Começa o teu ritual",
    titleFont: "serif-display", titleSize: "md", titleColor: "#14532D",
    buttonText: "Descobrir a loja", buttonLink: "/loja", buttonBg: "", buttonRadius: 999,
  },
};
