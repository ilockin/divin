-- Fase 2 — RLS de escrita para o admin gerir categorias
-- Correr no Supabase → SQL Editor. Idempotente.

alter table public.categories enable row level security;

-- staff (admin/super_admin) gere tudo
drop policy if exists "categories staff manage" on public.categories;
create policy "categories staff manage" on public.categories
  for all
  using      (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text in ('admin','super_admin')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text in ('admin','super_admin')));

-- leitura pública das categorias ativas (mantém o storefront)
drop policy if exists "categories public read active" on public.categories;
create policy "categories public read active" on public.categories
  for select using (active = true);
