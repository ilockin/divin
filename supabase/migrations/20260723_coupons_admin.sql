-- Fase 2 — Cupões de desconto no Supabase (CRUD + validação no checkout)
-- Correr no Supabase → SQL Editor. Idempotente.

create table if not exists public.coupons (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  type        text not null default 'percentage' check (type in ('percentage','fixed')),
  value       numeric not null default 0,
  min_order   numeric not null default 0,
  valid_from  date,
  valid_until date,
  usage_limit int not null default 0,
  used_count  int not null default 0,
  active      boolean not null default true,
  scope       text not null default 'all' check (scope in ('all','category','product')),
  scope_ids   text[] not null default '{}',
  created_at  timestamptz not null default now()
);

-- RLS: leitura pública dos ativos + staff gere tudo
alter table public.coupons enable row level security;

drop policy if exists "coupons public read active" on public.coupons;
create policy "coupons public read active" on public.coupons
  for select using (active = true);

drop policy if exists "coupons staff manage" on public.coupons;
create policy "coupons staff manage" on public.coupons
  for all
  using      (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text in ('admin','super_admin')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text in ('admin','super_admin')));

-- Seed dos cupões existentes (não sobrescreve se já existir)
insert into public.coupons (code, type, value, min_order, valid_from, valid_until, usage_limit, used_count, active, scope, scope_ids) values
  ('BEMVINDA10',  'percentage', 10, 0,  '2025-01-01', '2026-12-31', 0,   134, true,  'all',      '{}'),
  ('ENVIOGRATIS', 'fixed',      4.9, 30, '2025-01-01', '2026-12-31', 0,   58,  true,  'all',      '{}'),
  ('FACIAL15',    'percentage', 15, 0,  '2025-06-01', '2025-12-31', 200, 41,  true,  'category', '{faciais}'),
  ('BLACKFRIDAY', 'percentage', 20, 25, '2025-11-20', '2025-11-30', 500, 0,   false, 'all',      '{}')
on conflict (code) do nothing;
