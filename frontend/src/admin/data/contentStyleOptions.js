// Opções de tipografia partilhadas pelos editores visuais de conteúdo (Home, Sobre, Contacto, ...).

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
