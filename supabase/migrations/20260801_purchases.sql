-- Fase 4 — Compras de insumos no Supabase
-- Correr no Supabase → SQL Editor. Idempotente. RLS staff.

create table if not exists public.purchases (
  id          uuid primary key default gen_random_uuid(),
  code        text not null,
  supplier_id uuid references public.suppliers(id),
  date        date not null default current_date,
  status      text not null default 'rascunho' check (status in ('rascunho','encomendada','recebida','cancelada')),
  lines       jsonb not null default '[]',
  created_at  timestamptz not null default now()
);

alter table public.purchases enable row level security;
drop policy if exists "purchases staff manage" on public.purchases;
create policy "purchases staff manage" on public.purchases
  for all
  using      (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text in ('admin','super_admin','producao')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text in ('admin','super_admin','producao')));
