// Conteúdo editável da página "Contacto" (textos + formulário) — frontend-only.

export const FIELD_TYPES = [
  { id: "text", label: "Texto curto" },
  { id: "email", label: "E-mail" },
  { id: "tel", label: "Telefone" },
  { id: "textarea", label: "Texto longo" },
];

export const HEADER_FIELDS = [
  { key: "eyebrow", label: "Texto de abertura", type: "text" },
  { key: "title", label: "Título", type: "text" },
  { key: "subtitle", label: "Subtítulo", type: "textarea" },
];

export const SECTIONS_WITH_BODY = ["header"];

let fieldSeq = 0;
export const makeFormField = (type = "text") => {
  fieldSeq += 1;
  return { id: `f-${Date.now()}-${fieldSeq}`, label: "Novo campo", type, required: false };
};

export const initialContactContent = {
  header: {
    eyebrow: "fala connosco",
    title: "Contacto",
    subtitle: "Estamos aqui para te ouvir — dúvidas, sugestões, recomendações de uso ou só uma palavra amiga.",
    titleFont: "serif-display", titleSize: "lg", titleColor: "#14532D",
    eyebrowFont: "script", eyebrowSize: "2xl", eyebrowColor: "#2E9E44",
    bodyFont: "body", bodySize: "base", bodyColor: "#6B6F66",
  },
  form: {
    submitText: "Enviar mensagem",
    notifyEmail: "",
    fields: [
      { id: "name", label: "Nome", type: "text", required: true },
      { id: "email", label: "E-mail", type: "email", required: true },
      { id: "subject", label: "Assunto", type: "text", required: false },
      { id: "message", label: "Mensagem", type: "textarea", required: true },
    ],
  },
  info: {
    itemTitleFont: "serif-display", itemTitleSize: "sm", itemTitleColor: "#14532D",
    itemTextFont: "body", itemTextSize: "sm", itemTextColor: "#6B6F66",
    cards: [
      { title: "E-mail", lines: ["ola@divinarte.pt"] },
      { title: "Telefone", lines: ["+351 220 000 000", "Seg–Sex, 10h–18h"] },
      { title: "Atelier", lines: ["Rua das Camélias, 12", "4100-100 Porto, Portugal"] },
    ],
  },
};
