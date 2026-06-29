// Pop-ups com regras de acionamento — guardados em localStorage (ver lib/popups.js).
// Conteúdo construído com o mesmo motor de blocos do Construtor de Páginas (ver mockPages.js).
import { makeBlock } from "./mockPages";

export const TRIGGER_TYPES = [
  { id: "time", label: "Tempo na página" },
  { id: "exit", label: "Intenção de saída (exit-intent)" },
  { id: "scroll", label: "Percentagem de scroll" },
];

export const PLACEMENT_TYPES = [
  { id: "all", label: "Todo o site" },
  { id: "page", label: "Página específica" },
  { id: "category", label: "Categoria de produtos" },
];

export const FREQUENCY_TYPES = [
  { id: "session", label: "Uma vez por sessão" },
  { id: "always", label: "Sempre que a regra for cumprida" },
];

// Rotas-tipo fixas para a segmentação "Página específica" — além destas, o seletor
// no admin acrescenta em runtime as páginas publicadas do Construtor de Páginas.
export const PLACEMENT_PAGE_OPTIONS = [
  { value: "/", label: "Início" },
  { value: "/loja", label: "Loja" },
  { value: "/sobre", label: "Sobre" },
  { value: "/contacto", label: "Contacto" },
  { value: "/blog", label: "Blog — lista" },
  { value: "/blog/*", label: "Blog — qualquer artigo" },
  { value: "/produto/*", label: "Produto — qualquer página de produto" },
];

export const emptyPopup = () => ({
  id: "pop-" + Date.now(),
  name: "Novo pop-up",
  status: "inativo",
  width: 480,
  blocks: [],
  trigger: { type: "time", seconds: 8, percent: 50 },
  placement: { type: "all", value: "" },
  frequency: "session",
});

export const initialPopups = [
  {
    id: "pop-newsletter",
    name: "Newsletter de boas-vindas",
    status: "inativo",
    width: 460,
    blocks: [
      { ...makeBlock("texto"), props: { text: "Subscreva a nossa newsletter e receba 10% de desconto na primeira compra.", align: "center", lineHeight: "", letterSpacing: "" } },
      { ...makeBlock("newsletter"), props: { title: "Não perca nenhuma novidade", text: "", buttonText: "Subscrever" } },
    ],
    trigger: { type: "time", seconds: 8, percent: 50 },
    placement: { type: "all", value: "" },
    frequency: "session",
  },
];
