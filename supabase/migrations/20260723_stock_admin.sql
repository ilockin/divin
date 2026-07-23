-- Fase 2 — Stock do admin no Supabase (saldo + histórico de movimentos)
-- Correr no Supabase → SQL Editor. Idempotente.

-- 1) Tabela de movimentos ---------------------------------------------------
create table if not exists public.stock_movements (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  qty         int  not null,                 -- positivo = entrada, negativo = saída
  type        text not null check (type in ('entrada','saida')),
  reason      text,
  created_at  timestamptz not null default now()
);

create index if not exists stock_movements_product_idx on public.stock_movements (product_id);
create index if not exists stock_movements_created_idx on public.stock_movements (created_at desc);

-- 2) RLS: só staff (admin/super_admin) ---------------------------------------
alter table public.stock_movements enable row level security;

drop policy if exists "stock_movements staff manage" on public.stock_movements;
create policy "stock_movements staff manage" on public.stock_movements
  for all
  using      (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text in ('admin','super_admin')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text in ('admin','super_admin')));

-- 3) Ajuste transacional: grava o movimento E atualiza o saldo ---------------
create or replace function public.adjust_stock(
  p_product_id uuid,
  p_qty        int,
  p_type       text,
  p_reason     text
) returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_delta int;
  v_new   int;
begin
  -- só staff pode ajustar
  if not exists (
    select 1 from public.profiles p
     where p.id = auth.uid() and p.role::text in ('admin','super_admin')
  ) then
    raise exception 'Sem permissão para ajustar stock';
  end if;

  if p_type not in ('entrada','saida') then
    raise exception 'Tipo inválido: %', p_type;
  end if;

  if p_qty is null or p_qty <= 0 then
    raise exception 'Quantidade inválida';
  end if;

  v_delta := case when p_type = 'entrada' then p_qty else -p_qty end;

  update public.products
     set stock_qty = greatest(0, coalesce(stock_qty, 0) + v_delta)
   where id = p_product_id
  returning stock_qty into v_new;

  if v_new is null then
    raise exception 'Produto não encontrado';
  end if;

  insert into public.stock_movements (product_id, qty, type, reason)
  values (p_product_id, v_delta, p_type, nullif(p_reason, ''));

  return v_new;
end;
$$;

grant execute on function public.adjust_stock(uuid, int, text, text) to authenticated;
