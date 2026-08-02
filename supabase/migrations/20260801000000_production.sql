-- Fase 3 — Produção / Fórmulas no Supabase
-- Correr no Supabase → SQL Editor. Idempotente.
-- RLS staff = admin / super_admin / producao.

-- 1) Fornecedores ------------------------------------------------------------
create table if not exists public.suppliers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  created_at timestamptz not null default now()
);
insert into public.suppliers (name) values
  ('Botanical PT'), ('EssênciasIbéria'), ('VidroPak'), ('Granel Bio'), ('Apicultor do Vale')
on conflict (name) do nothing;

-- 2) Insumos -----------------------------------------------------------------
create table if not exists public.insumos (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  category    text,
  unit        text,
  supplier_id uuid references public.suppliers(id),
  cost        numeric not null default 0,
  stock       numeric not null default 0,
  min_stock   numeric not null default 0,
  created_at  timestamptz not null default now()
);

insert into public.insumos (name, category, unit, supplier_id, cost, stock, min_stock)
select v.name, v.category, v.unit, s.id, v.cost, v.stock, v.min_stock
from (values
  ('Óleo de jojoba','Óleos vegetais','ml','Botanical PT',0.024,4500,1000),
  ('Óleo de amêndoa doce','Óleos vegetais','ml','Botanical PT',0.011,6000,1500),
  ('Manteiga de karité bio','Manteigas','g','Granel Bio',0.018,3200,1000),
  ('Manteiga de murumuru','Manteigas','g','Granel Bio',0.029,800,500),
  ('Cera de abelha','Ceras','g','Apicultor do Vale',0.022,1200,600),
  ('Óleo essencial lavanda','Essenciais','ml','EssênciasIbéria',0.380,350,100),
  ('Óleo essencial eucalipto','Essenciais','ml','EssênciasIbéria',0.260,240,80),
  ('Óleo essencial hortelã','Essenciais','ml','EssênciasIbéria',0.290,60,80),
  ('Hidrolato de rosa','Hidrolatos','ml','Botanical PT',0.045,5000,1500),
  ('Vitamina C estabilizada','Ativos','g','Granel Bio',0.180,120,50),
  ('Conservante natural','Conservantes','ml','Granel Bio',0.062,480,200),
  ('Frasco de vidro âmbar 100ml','Embalagem','un','VidroPak',1.10,240,80),
  ('Boião alumínio 50ml','Embalagem','un','VidroPak',0.85,18,50),
  ('Rótulo adesivo padrão','Rótulos','un','VidroPak',0.18,1200,300)
) as v(name,category,unit,supplier,cost,stock,min_stock)
left join public.suppliers s on s.name = v.supplier
on conflict (name) do nothing;

-- 3) Fichas técnicas (BOM por produto) --------------------------------------
create table if not exists public.product_recipes (
  product_id uuid primary key references public.products(id) on delete cascade,
  lines      jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

-- 4) Ordens de produção ------------------------------------------------------
create table if not exists public.production_orders (
  id           uuid primary key default gen_random_uuid(),
  order_number text not null,
  product_id   uuid references public.products(id),
  qty          int not null default 0,
  status       text not null default 'planeada',
  notes        text,
  date         date not null default current_date,
  created_at   timestamptz not null default now()
);

-- 5) RLS: apenas staff (admin/super_admin/producao) --------------------------
do $$
declare t text;
begin
  foreach t in array array['suppliers','insumos','product_recipes','production_orders'] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "%s staff manage" on public.%I;', t, t);
    execute format($f$
      create policy "%s staff manage" on public.%I
        for all
        using      (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text in ('admin','super_admin','producao')))
        with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text in ('admin','super_admin','producao')));
    $f$, t, t);
  end loop;
end $$;
