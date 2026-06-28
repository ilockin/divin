// Conteúdo editável do menu principal do site — frontend-only.

let itemSeq = 0;
export const makeMenuItem = () => {
  itemSeq += 1;
  return { id: `mi-${Date.now()}-${itemSeq}`, label: "Novo item", link: "/", children: [] };
};

export const initialMenuContent = {
  items: [
    { id: "mi-inicio", label: "Início", link: "/", children: [] },
    { id: "mi-loja", label: "Loja", link: "/loja", children: [] },
    { id: "mi-sobre", label: "Sobre", link: "/sobre", children: [] },
    { id: "mi-blog", label: "Blog", link: "/blog", children: [] },
    { id: "mi-contacto", label: "Contacto", link: "/contacto", children: [] },
  ],
};
