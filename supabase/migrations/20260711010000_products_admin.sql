-- Fase 2 — Catálogo do admin no Supabase (produtos)
-- Correr no Supabase → SQL Editor. Idempotente (pode correr mais que uma vez).

-- 1) Colunas admin-only usadas pelo formulário de produto -------------------
alter table public.products add column if not exists min_stock          int      default 5;
alter table public.products add column if not exists commission_type    text     default 'percentage';
alter table public.products add column if not exists commission_value   numeric  default 0;
alter table public.products add column if not exists shipping_mode       text     default 'inherit';
alter table public.products add column if not exists shipping_method_ids text[]   default '{}';

-- 2) RLS: staff (admin/super_admin) gere tudo; público continua a ler ativos -
alter table public.products enable row level security;

-- staff vê e gere todos os produtos (inclui rascunhos)
drop policy if exists "products staff manage" on public.products;
create policy "products staff manage" on public.products
  for all
  using      (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text in ('admin','super_admin')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text in ('admin','super_admin')));

-- leitura pública dos produtos ativos (mantém o storefront a funcionar)
drop policy if exists "products public read active" on public.products;
create policy "products public read active" on public.products
  for select using (active = true);

-- 3) Storage: bucket público para imagens de produto ------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- leitura pública das imagens
drop policy if exists "product-images public read" on storage.objects;
create policy "product-images public read" on storage.objects
  for select using (bucket_id = 'product-images');

-- upload / atualização / remoção por staff
drop policy if exists "product-images staff insert" on storage.objects;
create policy "product-images staff insert" on storage.objects
  for insert with check (
    bucket_id = 'product-images'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text in ('admin','super_admin'))
  );

drop policy if exists "product-images staff update" on storage.objects;
create policy "product-images staff update" on storage.objects
  for update using (
    bucket_id = 'product-images'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text in ('admin','super_admin'))
  );

drop policy if exists "product-images staff delete" on storage.objects;
create policy "product-images staff delete" on storage.objects
  for delete using (
    bucket_id = 'product-images'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text in ('admin','super_admin'))
  );
