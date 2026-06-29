// Conteúdo editável do Rodapé (frontend-only) — colunas flexíveis (% ou px), igual mecânica
// do bloco "Colunas" do Construtor de Páginas (ver rebalanceColumns em mockPages.js).

export const NEWSLETTER_FIELDS = [
  { key: "eyebrow", label: "Texto de abertura", type: "text" },
  { key: "title", label: "Título", type: "text" },
  { key: "text", label: "Texto", type: "textarea" },
  { key: "buttonText", label: "Texto do botão", type: "text" },
];

export const BOTTOM_BAR_FIELDS = [
  { key: "text", label: "Texto de copyright", type: "text" },
];

let colSeq = 0;
export const makeFooterColumn = (type = "links") => {
  colSeq += 1;
  return type === "brand"
    ? { id: `fcol-${Date.now()}-${colSeq}`, width: 25, widthUnit: "%", type: "brand", text: "", showSocial: true, textColor: "" }
    : { id: `fcol-${Date.now()}-${colSeq}`, width: 25, widthUnit: "%", type: "links", heading: "Nova coluna", headingColor: "", linkColor: "", links: [] };
};

export const initialFooterContent = {
  bg: "",
  textColor: "",
  newsletter: {
    visible: true,
    eyebrow: "junta-te ao círculo",
    title: "Cuidado, calma e novidades — na tua caixa de entrada.",
    text: "Subscreve a nossa newsletter e recebe rituais, ingredientes em foco e ofertas pensadas para quem cuida com atenção.",
    buttonText: "Subscrever",
    bg: "", textColor: "",
    eyebrowFont: "script", eyebrowSize: "2xl", eyebrowColor: "#B7BD53",
    titleFont: "serif-display", titleSize: "md", titleColor: "#F7F4EC",
    bodyFont: "body", bodySize: "sm", bodyColor: "", bodyAlign: "", bodyLineHeight: "", bodyLetterSpacing: "",
  },
  columns: [
    { id: "fcol-brand", width: 25, widthUnit: "%", type: "brand", textColor: "", showSocial: true,
      text: "Cosmética natural e artesanal feita em Portugal. Pequenos lotes, fórmulas suaves e o cuidado de quem acredita que beleza é também uma forma de bondade." },
    { id: "fcol-loja", width: 25, widthUnit: "%", type: "links", heading: "Loja", headingColor: "", linkColor: "",
      links: [
        { label: "Faciais", url: "/loja?categoria=faciais" },
        { label: "Corporais", url: "/loja?categoria=corporais" },
        { label: "Capilares", url: "/loja?categoria=capilares" },
        { label: "Bem-estar", url: "/loja?categoria=bem-estar" },
      ] },
    { id: "fcol-marca", width: 25, widthUnit: "%", type: "links", heading: "Marca", headingColor: "", linkColor: "",
      links: [
        { label: "A nossa história", url: "/sobre" },
        { label: "Blog", url: "/blog" },
        { label: "Contacto", url: "/contacto" },
        { label: "Conta", url: "/conta/login" },
      ] },
    { id: "fcol-apoio", width: 25, widthUnit: "%", type: "links", heading: "Apoio", headingColor: "", linkColor: "",
      links: [
        { label: "Envios e devoluções", url: "#" },
        { label: "FAQ", url: "#" },
        { label: "Termos e condições", url: "#" },
        { label: "Política de privacidade", url: "#" },
      ] },
  ],
  bottomBar: {
    text: "© {ano} DivinArte. Todos os direitos reservados.",
    showPaymentBadges: true,
    bg: "", textColor: "",
  },
};
