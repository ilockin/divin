import { FONT_OPTIONS, FONT_SIZE_OPTIONS } from "../admin/data/contentStyleOptions";

// Classe/estilo do título de uma secção, a partir de titleFont/titleSize/titleColor.
// Partilhado entre HomeSections, AboutSections, ContactSections, ...
export const titleClassFor = (content) => {
  const font = FONT_OPTIONS.find((f) => f.id === content.titleFont)?.className || "";
  const size = FONT_SIZE_OPTIONS.find((s) => s.id === content.titleSize)?.className || "";
  return `${font} ${size}`;
};

export const titleStyleFor = (content) => ({ color: content.titleColor || undefined });

// Estilo de um botão a partir de {prefix}Bg/{prefix}Radius. Bg só é aplicado quando definido
// (string vazia = mantém a cor/hover original da classe .btn-da-*).
export const buttonStyleFor = (content, prefix) => ({
  borderRadius: `${content[`${prefix}Radius`] ?? 999}px`,
  ...(content[`${prefix}Bg`] ? { backgroundColor: content[`${prefix}Bg`] } : {}),
});
