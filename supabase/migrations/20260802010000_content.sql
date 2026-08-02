-- Fase 5 (etapa 1) — Conteúdo editorial no Supabase.
-- Até aqui, Home/Sobre/Contacto/menu/rodapé/blog/páginas viviam em localStorage: o que era
-- editado no admin nunca chegava a um visitante. Estas três tabelas passam a ser a fonte de
-- verdade. Idempotente.
--
-- RLS via public.is_staff() (20260802000000_profiles_rls_recursion.sql) — nunca voltar ao
-- subselect a public.profiles dentro das políticas, que causou recursão infinita.

-- 1) Singletons de conteúdo (home, about, contact, blog, menu, footer, integrations) ---------
create table if not exists public.site_content (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

-- A loja lê sem sessão iniciada.
drop policy if exists "site_content public read" on public.site_content;
create policy "site_content public read" on public.site_content
  for select using (true);

drop policy if exists "site_content staff manage" on public.site_content;
create policy "site_content staff manage" on public.site_content
  for all using (public.is_staff()) with check (public.is_staff());

-- 2) Artigos do blog ---------------------------------------------------------
create table if not exists public.articles (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  title      text not null,
  excerpt    text,
  category   text,
  author     text,
  cover      text,
  body       text,
  status     text not null default 'rascunho',
  views      integer not null default 0,
  date       date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.articles enable row level security;

-- O público só vê os publicados; o staff vê e gere tudo.
drop policy if exists "articles public read published" on public.articles;
create policy "articles public read published" on public.articles
  for select using (status = 'publicado');

drop policy if exists "articles staff manage" on public.articles;
create policy "articles staff manage" on public.articles
  for all using (public.is_staff()) with check (public.is_staff());

-- 3) Páginas do construtor ---------------------------------------------------
create table if not exists public.pages (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  title      text not null,
  status     text not null default 'rascunho',
  blocks     jsonb not null default '[]'::jsonb,
  date       date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pages enable row level security;

drop policy if exists "pages public read published" on public.pages;
create policy "pages public read published" on public.pages
  for select using (status = 'publicado');

drop policy if exists "pages staff manage" on public.pages;
create policy "pages staff manage" on public.pages
  for all using (public.is_staff()) with check (public.is_staff());

-- 4) Seed dos artigos que hoje já estão visíveis na loja (frontend/src/data/mock.js).
--    site_content e pages ficam vazias de propósito: as libs caem nos valores de fábrica
--    e a primeira gravação no admin cria a linha.
insert into public.articles (slug, title, excerpt, category, author, cover, body, status, views, date) values
(
  'ritual-de-noite-3-passos',
  'O ritual de noite em 3 passos',
  'Pequenos gestos que preparam o corpo e a mente para o descanso.',
  'Rituais',
  'Equipa DivinArte',
  'https://images.unsplash.com/photo-1556228852-80b6e5eeff06?auto=format&fit=crop&w=1400&q=70',
  '<p>Há noites em que basta acender uma luz quente, respirar fundo e aplicar um gesto de cuidado para o corpo entender que é hora de abrandar. Neste artigo partilhamos um ritual simples — em três passos — que pode acompanhar-te todas as noites.</p><h2>1. Prepara o ambiente</h2><p>Luz suave, telefone longe, um momento só teu. Estes pequenos momentos não exigem grandes preparativos — bastam alguns minutos e a vontade de pausar.</p><h2>2. O gesto de cuidado</h2><p>Aplica o Spray Sono e Ansiedade na almofada e nos pulsos, com respirações lentas e profundas.</p><h2>3. Repete com atenção</h2><ul><li>Mesma hora, todas as noites</li><li>Sem pressa</li><li>Sem expectativas — só o gesto</li></ul><blockquote>Cuidar é a forma mais antiga de bondade.</blockquote><p>Em cada artigo partilhamos uma parte do nosso modo de fazer. Esperamos que aqui encontres inspiração para os teus próprios rituais.</p>',
  'publicado', 820, '2025-10-12'
),
(
  'ingredientes-em-foco-rosa-mosqueta',
  'Ingredientes em foco: rosa-mosqueta',
  'Como este óleo se tornou um clássico da cosmética natural.',
  'Ingredientes',
  'Equipa DivinArte',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1400&q=70',
  '<p>A rosa-mosqueta é apreciada pelas suas notas suaves e pela sua textura sedosa. Aqui contamos um pouco da sua origem e da forma como a usamos.</p><h2>De onde vem</h2><p>Extraído das semente da roseira-brava, é um óleo tradicionalmente usado em rituais de cuidado da pele em climas frios e secos.</p><h2>Como o usamos</h2><ul><li>No Sérum Revigorante, combinado com vitamina C</li><li>Em pequenas quantidades, para não pesar na pele</li><li>De preferência à noite, antes de dormir</li></ul><p>Em cada artigo partilhamos uma parte do nosso modo de fazer. Esperamos que aqui encontres inspiração para os teus próprios rituais.</p>',
  'publicado', 654, '2025-09-30'
),
(
  'natural-vs-bio-o-que-significa',
  'Natural vs BIO: o que significa, afinal?',
  'Pequeno guia honesto sobre os termos que aparecem nos rótulos.',
  'Saber mais',
  'Equipa DivinArte',
  'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1400&q=70',
  '<p>Natural, BIO, vegano… Os rótulos nem sempre dizem o mesmo. Neste artigo damos definições simples para te ajudar a escolher.</p><h2>Natural</h2><p>Ingredientes de origem botânica, sem promessas exageradas — só o essencial.</p><h2>BIO</h2><p>Cultivo sem pesticidas de síntese, com origem certificada.</p><h2>Vegano</h2><p>Sem ingredientes de origem animal, em nenhuma fase do processo.</p><p>Em cada artigo partilhamos uma parte do nosso modo de fazer. Esperamos que aqui encontres inspiração para os teus próprios rituais.</p>',
  'rascunho', 412, '2025-09-15'
)
on conflict (slug) do nothing;
