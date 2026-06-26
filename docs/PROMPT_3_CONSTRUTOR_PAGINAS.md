# Prompt 3 — Construtor de Páginas (DivinArte) — VISUAL, mock data

Implementar **no projeto existente**, seguindo as convenções já presentes (ver `CLAUDE.md` e `docs/CONTEXT.md`). Usar **DnD Kit** para o drag & drop. Apenas UI com **mock data** — sem back-end.

## Onde
Nova área no admin: **`/admin/paginas`** "Construtor de Páginas" (adicionar à barra lateral).

## Ecrãs

1. **Lista de páginas**: DataTable (título, slug, estado [publicado/rascunho], data) + botão "Nova página". Editar e remover.

2. **Editor (canvas)** com três zonas:
   - **Painel esquerdo — Blocos**: paleta de secções arrastáveis — Hero, Texto, Imagem, Galeria, Grade de Produtos, Banner/CTA, Vídeo, Testemunhos, FAQ (acordeão), Newsletter, Colunas, Espaçador.
   - **Centro — Tela**: onde os blocos são largados, **reordenados** (handle de arrastar), selecionados e removidos.
   - **Painel direito — Propriedades**: edição do bloco selecionado (texto, imagem, cor, link, alinhamento, etc.).
   - **Barra superior**: nome da página, slug, **Guardar**, **Pré-visualizar**, **Publicar**, e **Desfazer/Refazer**.

3. **Pré-visualização responsiva**: alternar entre desktop / tablet / telemóvel.

## Comportamento (tudo client-side / mock)

- Arrastar um bloco da paleta para a tela **cria** o bloco; arrastar dentro da tela **reordena** (DnD Kit).
- Selecionar um bloco mostra as propriedades à direita; editar **atualiza a tela em tempo real**.
- As páginas são guardadas em **estado local** (mock). Sem persistência real.

## Reutilizar

- Mesmo design system, mesmos componentes (botões, inputs, cards, modais) e tokens da marca DivinArte.
- O bloco "Grade de Produtos" usa os produtos do **mock data já existente** no projeto.

## NÃO fazer (próxima fase — lógica)

- Guardar páginas no Supabase, renderização pública real das páginas, ou SEO. Agora é só o **construtor visual**.
