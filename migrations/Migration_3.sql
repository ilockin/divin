-- Migration_3 — Encomendas: orders + order_items
-- Correr no Supabase SQL Editor DEPOIS de Migration_2

-- ── ENCOMENDAS ───────────────────────────────────────────────────────────────
create table public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    text not null unique,
  user_id         uuid references public.profiles(id) on delete set null,
  email           text not null,
  status          text not null default 'pendente'
                  check (status in ('pendente','pago','processando','enviado','entregue','cancelado')),
  subtotal        numeric(10,2) not null,
  shipping_cost   numeric(10,2) not null default 0,
  discount_amount numeric(10,2) not null default 0,
  total           numeric(10,2) not null,
  shipping_address jsonb not null default '{}',
  notes           text,
  stripe_session_id text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid references public.products(id) on delete set null,
  product_slug text not null,
  name        text not null,
  price       numeric(10,2) not null,
  qty         int not null,
  image_url   text,
  size        text
);

-- índices úteis
create index on public.orders (user_id);
create index on public.orders (order_number);
create index on public.orders (created_at desc);
create index on public.order_items (order_id);

-- gerador de número de encomenda  DA-YYYYMMDD-XXXX
create or replace function public.generate_order_number()
returns trigger language plpgsql as $$
begin
  new.order_number := 'DA-' || to_char(now(), 'YYYYMMDD') || '-' || lpad((floor(random() * 9000) + 1000)::text, 4, '0');
  return new;
end; $$;

create trigger set_order_number
  before insert on public.orders
  for each row
  when (new.order_number is null or new.order_number = '')
  execute function public.generate_order_number();

-- atualiza updated_at automaticamente
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.orders     enable row level security;
alter table public.order_items enable row level security;

-- cliente vê as suas próprias encomendas
create policy "Próprias encomendas" on public.orders
  for select using (auth.uid() = user_id);

-- cliente pode criar encomenda (user_id pode ser null para hóspedes, mas aqui exigimos sessão)
create policy "Criar encomenda" on public.orders
  for insert with check (auth.uid() = user_id);

-- itens: leitura via encomendas do próprio
create policy "Itens das próprias encomendas" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

-- inserção de itens (mesma sessão que cria a encomenda — feito na mesma transação)
create policy "Criar itens de encomenda" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );
