// Conteúdo editável da listagem do Blog (só o cabeçalho — os posts vêm de mockAdmin/Blog admin).

export const HEADER_FIELDS = [
  { key: "eyebrow", label: "Texto de abertura", type: "text" },
  { key: "title", label: "Título", type: "text" },
  { key: "subtitle", label: "Subtítulo", type: "textarea" },
];

export const initialBlogContent = {
  header: {
    eyebrow: "do nosso diário",
    title: "Blog",
    subtitle: "Rituais, ingredientes e pequenas reflexões sobre a arte de cuidar.",
    titleFont: "serif-display", titleSize: "lg", titleColor: "#14532D",
    eyebrowFont: "script", eyebrowSize: "2xl", eyebrowColor: "#2E9E44",
    bodyFont: "body", bodySize: "base", bodyColor: "#6B6F66",
  },
};
