-- Fase 2 — Modos de envio no Supabase (usados no admin e no checkout)
-- Correr no Supabase → SQL Editor. Idempotente.
-- id é text (sm1, sm2…) para manter compatível com products.shipping_method_ids
-- e com as regras de zona/distrito/categoria.

create table if not exists public.shipping_methods (
  id          text primary key,
  name        text not null,
  description text,
  cost        numeric not null default 0,
  eta         text,
  zones       text,
  active      boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.shipping_methods enable row level security;

drop policy if exists "shipping_methods public read active" on public.shipping_methods;
create policy "shipping_methods public read active" on public.shipping_methods
  for select using (active = true);

drop policy if exists "shipping_methods staff manage" on public.shipping_methods;
create policy "shipping_methods staff manage" on public.shipping_methods
  for all
  using      (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text in ('admin','super_admin')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text in ('admin','super_admin')));

-- Seed dos métodos atuais (não sobrescreve)
insert into public.shipping_methods (id, name, description, cost, eta, zones, active, sort_order) values
  ('sm1', 'CTT Normal',      'Entrega standard pela CTT.',        4.9, '2-3 dias úteis',   'Portugal Continental', true,  1),
  ('sm2', 'CTT Expresso',    'Entrega no dia útil seguinte.',     7.9, '1 dia útil',       'Portugal Continental', true,  2),
  ('sm3', 'Recolha na loja', 'Levantamento gratuito no atelier.', 0,   'Disponível em 24h','Porto',                true,  3),
  ('sm4', 'Envio Ilhas',     'Para Madeira e Açores via CTT.',    9.9, '5-7 dias úteis',   'Madeira, Açores',      false, 4)
on conflict (id) do nothing;
