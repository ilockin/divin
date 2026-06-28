import { FONT_OPTIONS, FONT_SIZE_OPTIONS, TEXT_SIZE_OPTIONS } from "../admin/data/contentStyleOptions";

// Classe/estilo de QUALQUER texto de uma secção, a partir de `${prefix}Font/Size/Color`.
// `sizeOptions` permite usar uma escala diferente (títulos vs. eyebrow/corpo/itens).
export const textClassFor = (content, prefix, sizeOptions = FONT_SIZE_OPTIONS) => {
  const font = FONT_OPTIONS.find((f) => f.id === content[`${prefix}Font`])?.className || "";
  const size = sizeOptions.find((s) => s.id === content[`${prefix}Size`])?.className || "";
  return `${font} ${size}`;
};

export const textStyleFor = (content, prefix) => ({ color: content[`${prefix}Color`] || undefined });

// Atalhos para o título (escala de tamanhos grande) — usados desde a Fase 1, mantidos tal qual.
export const titleClassFor = (content) => textClassFor(content, "title", FONT_SIZE_OPTIONS);
export const titleStyleFor = (content) => textStyleFor(content, "title");

// Atalhos para eyebrow/corpo/itens (escala de tamanhos menor).
export const eyebrowClassFor = (content) => textClassFor(content, "eyebrow", TEXT_SIZE_OPTIONS);
export const eyebrowStyleFor = (content) => textStyleFor(content, "eyebrow");
export const bodyClassFor = (content) => textClassFor(content, "body", TEXT_SIZE_OPTIONS);
export const bodyStyleFor = (content) => textStyleFor(content, "body");
export const itemClassFor = (content) => textClassFor(content, "item", TEXT_SIZE_OPTIONS);
export const itemStyleFor = (content) => textStyleFor(content, "item");

// Estilo de um botão a partir de {prefix}Bg/{prefix}Radius. Bg só é aplicado quando definido
// (string vazia = mantém a cor/hover original da classe .btn-da-*).
export const buttonStyleFor = (content, prefix) => ({
  borderRadius: `${content[`${prefix}Radius`] ?? 999}px`,
  ...(content[`${prefix}Bg`] ? { backgroundColor: content[`${prefix}Bg`] } : {}),
});
