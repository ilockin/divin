// Opções de tipografia partilhadas pelos editores visuais de conteúdo (Home, Sobre, Contacto, ...).

// Fontes da marca (classes já definidas em index.css) — sem carregar fontes externas.
export const FONT_OPTIONS = [
  { id: "serif-display", label: "Título (Cinzel)", className: "font-serif-display" },
  { id: "body", label: "Texto (Montserrat)", className: "font-body" },
  { id: "script", label: "Manuscrita (Caveat)", className: "font-script" },
];

// Combinações Tailwind já usadas noutras páginas — garante responsividade e que as classes já existem no build.
// Escala grande — usada nos títulos (h1/h2).
export const FONT_SIZE_OPTIONS = [
  { id: "sm", label: "Pequeno", className: "text-2xl sm:text-3xl" },
  { id: "md", label: "Médio (atual)", className: "text-3xl sm:text-4xl" },
  { id: "lg", label: "Grande", className: "text-4xl sm:text-5xl" },
  { id: "xl", label: "Extra grande", className: "text-4xl sm:text-5xl lg:text-6xl" },
];

// Escala pequena — usada no eyebrow (script), corpo de texto e itens de lista.
// Tamanhos simples (sem par responsivo) — bate exatamente com o que já está em uso no código,
// para os valores por defeito ficarem sempre idênticos ao visual atual.
export const TEXT_SIZE_OPTIONS = [
  { id: "xs", label: "Muito pequeno", className: "text-xs" },
  { id: "sm", label: "Pequeno", className: "text-sm" },
  { id: "base", label: "Médio (atual)", className: "text-base" },
  { id: "lg", label: "Grande", className: "text-lg" },
  { id: "xl", label: "Extra grande", className: "text-xl" },
  { id: "2xl", label: "Eyebrow (atual)", className: "text-2xl" },
  { id: "3xl", label: "Eyebrow grande", className: "text-3xl" },
];

// "" = automático (sem override inline) — preserva o alinhamento/altura/espaçamento herdado
// do contentor ou da classe Tailwind original, para não quebrar secções já centradas, etc.
export const ALIGN_OPTIONS = [
  { id: "", label: "Automático (atual)" },
  { id: "left", label: "Esquerda" },
  { id: "center", label: "Centro" },
  { id: "right", label: "Direita" },
];

export const LINE_HEIGHT_OPTIONS = [
  { id: "", label: "Automático (atual)" },
  { id: "tight", label: "Apertada", value: "1.25" },
  { id: "normal", label: "Normal", value: "1.5" },
  { id: "relaxed", label: "Larga", value: "1.75" },
  { id: "loose", label: "Extra larga", value: "2" },
];

export const LETTER_SPACING_OPTIONS = [
  { id: "", label: "Automático (atual)" },
  { id: "tight", label: "Apertado", value: "-0.02em" },
  { id: "wide", label: "Largo", value: "0.05em" },
  { id: "wider", label: "Extra largo", value: "0.1em" },
];
