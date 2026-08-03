-- Fase 2 — Envios avançados: zonas, regras por distrito e por categoria.
-- Correr no Supabase → SQL Editor. Idempotente. Leitura pública + escrita staff.

-- 1) Zonas por país -----------------------------------------------------------
create table if not exists public.shipping_zones (
  id         text primary key,
  name       text not null,
  active     boolean not null default true,
  method_ids text[] not null default '{}',
  overrides  jsonb  not null default '{}',
  created_at timestamptz not null default now()
);
insert into public.shipping_zones (id, name, active, method_ids, overrides) values
  ('z-pt','Portugal',        true,  array['sm1','sm2','sm3'], '{}'::jsonb),
  ('z-es','Espanha',         true,  array['sm1','sm2'],       '{"sm1":{"cost":7.9,"eta":"4-6 dias úteis"}}'::jsonb),
  ('z-eu','Resto da Europa', true,  array['sm1'],             '{"sm1":{"cost":12.9,"eta":"5-8 dias úteis"}}'::jsonb),
  ('z-int','Internacional',  false, array['sm1'],             '{"sm1":{"cost":19.9,"eta":"7-15 dias úteis"}}'::jsonb)
on conflict (id) do nothing;

-- 2) Regras por distrito/região (PT/ES) --------------------------------------
create table if not exists public.shipping_district_rules (
  country    text not null,
  district   text not null,
  method_ids text[] not null default '{}',
  overrides  jsonb  not null default '{}',
  primary key (country, district)
);
insert into public.shipping_district_rules (country, district, method_ids, overrides) values
  ('PT','Madeira',        array['sm4'], '{"sm4":{"cost":9.9,"eta":"5-7 dias úteis"}}'::jsonb),
  ('PT','Açores',         array['sm4'], '{"sm4":{"cost":11.9,"eta":"6-9 dias úteis"}}'::jsonb),
  ('ES','Canárias',       array['sm1'], '{"sm1":{"cost":14.9,"eta":"7-10 dias úteis"}}'::jsonb),
  ('ES','Ilhas Baleares', array['sm1'], '{"sm1":{"cost":10.9,"eta":"5-7 dias úteis"}}'::jsonb)
on conflict (country, district) do nothing;

-- 3) Regras por categoria (linha __default__ = regra predefinida) -------------
create table if not exists public.shipping_category_rules (
  category_slug text primary key,
  method_ids    text[] not null default '{}'
);
insert into public.shipping_category_rules (category_slug, method_ids) values
  ('__default__', array['sm1','sm2','sm3']),
  ('corporais',   array['sm1','sm2'])
on conflict (category_slug) do nothing;

-- 4) RLS ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['shipping_zones','shipping_district_rules','shipping_category_rules'] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "%s staff manage" on public.%I;', t, t);
    execute format($f$
      create policy "%s staff manage" on public.%I
        for all
        using      (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text in ('admin','super_admin')))
        with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text in ('admin','super_admin')));
    $f$, t, t);
    execute format('drop policy if exists "%s public read" on public.%I;', t, t);
    execute format('create policy "%s public read" on public.%I for select using (true);', t, t);
  end loop;
end $$;
