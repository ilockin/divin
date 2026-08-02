-- Fase 5 (etapa 2) — Interações públicas no Supabase: avaliações, newsletter, leads e pop-ups.
-- Até aqui viviam em localStorage, ou seja, não funcionavam: uma avaliação ou uma mensagem de
-- contacto ficava no browser de quem a escreveu e nunca chegava ao admin. Idempotente.
--
-- Princípio de segurança desta migration: NENHUMA destas tabelas aceita escrita anónima direta.
-- As três submissões públicas passam pela Edge Function `public-forms`, que verifica o
-- reCAPTCHA e escreve com service role (que ignora o RLS).
--
-- RLS via public.is_staff() (20260802000000_profiles_rls_recursion.sql) — nunca o subselect a
-- public.profiles dentro das políticas, que causou recursão infinita.

-- 1) Avaliações de produto ---------------------------------------------------
create table if not exists public.reviews (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  user_id    uuid references auth.users(id) on delete set null,
  name       text,
  email      text,
  rating     integer not null check (rating between 1 and 5),
  comment    text,
  status     text not null default 'pendente',
  created_at timestamptz not null default now()
);

create index if not exists reviews_product_idx on public.reviews (product_id);

alter table public.reviews enable row level security;

-- Sem política para anon/authenticated: a tabela é território do staff. O público lê a vista.
drop policy if exists "reviews staff manage" on public.reviews;
create policy "reviews staff manage" on public.reviews
  for all using (public.is_staff()) with check (public.is_staff());

-- A loja lê daqui. Uma política de linha não filtra colunas e restringir por `grant` tiraria o
-- e-mail também ao staff (mesmo papel `authenticated`); a vista resolve as duas coisas: o
-- e-mail do autor nunca sai, e pendentes/rejeitadas ficam invisíveis.
drop view if exists public.public_reviews;
create view public.public_reviews as
  select id, product_id, name, rating, comment, created_at
  from public.reviews
  where status = 'aprovado';

grant select on public.public_reviews to anon, authenticated;

-- Quem pode avaliar: só quem tem sessão iniciada e uma encomenda paga com o produto.
-- Verificado por auth.uid(), nunca por um e-mail escrito no formulário.
create or replace function public.can_review(p_product_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.orders o
    join public.order_items oi on oi.order_id = o.id
    where o.user_id = auth.uid()
      and o.status = 'pago'
      and oi.product_id = p_product_id
  );
$$;

grant execute on function public.can_review(uuid) to authenticated;

-- 2) Subscritores da newsletter ----------------------------------------------
create table if not exists public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  source     text,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

-- Dados pessoais: nunca legíveis publicamente.
drop policy if exists "newsletter staff manage" on public.newsletter_subscribers;
create policy "newsletter staff manage" on public.newsletter_subscribers
  for all using (public.is_staff()) with check (public.is_staff());

-- 3) Leads do formulário de contacto -----------------------------------------
-- fields_snapshot guarda os rótulos dos campos no momento da submissão, para a lista no admin
-- continuar legível mesmo que o formulário seja alterado depois.
create table if not exists public.leads (
  id              uuid primary key default gen_random_uuid(),
  status          text not null default 'novo',
  note            text default '',
  fields_snapshot jsonb not null default '[]'::jsonb,
  values          jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

alter table public.leads enable row level security;

drop policy if exists "leads staff manage" on public.leads;
create policy "leads staff manage" on public.leads
  for all using (public.is_staff()) with check (public.is_staff());

-- 4) Pop-ups ------------------------------------------------------------------
create table if not exists public.popups (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  status     text not null default 'inativo',
  width      integer not null default 480,
  blocks     jsonb not null default '[]'::jsonb,
  trigger    jsonb not null default '{}'::jsonb,
  placement  jsonb not null default '{}'::jsonb,
  frequency  text not null default 'session',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.popups enable row level security;

-- Sem dados pessoais: a loja precisa de ler os ativos sem sessão.
drop policy if exists "popups public read active" on public.popups;
create policy "popups public read active" on public.popups
  for select using (status = 'ativo');

drop policy if exists "popups staff manage" on public.popups;
create policy "popups staff manage" on public.popups
  for all using (public.is_staff()) with check (public.is_staff());

-- Sem seed: os initial* de mockReviews/mockLeads/mockNewsletter são pessoas inventadas com
-- e-mails de exemplo e não têm lugar numa base de dados real.
