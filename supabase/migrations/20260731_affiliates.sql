-- Fase 2 — Afiliados no Supabase (identidade + atribuição + comissões)
-- Correr no Supabase → SQL Editor. Idempotente.

-- 1) Colunas -----------------------------------------------------------------
alter table public.profiles add column if not exists affiliate_code   text unique;
alter table public.profiles add column if not exists affiliate_active boolean not null default true;
alter table public.orders   add column if not exists affiliate_code   text;

create index if not exists orders_affiliate_idx on public.orders (affiliate_code);

-- 2) RLS: admin/super_admin gerem os perfis (para a página Afiliados) --------
drop policy if exists "profiles admin read all" on public.profiles;
create policy "profiles admin read all" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text in ('admin','super_admin'))
  );

drop policy if exists "profiles admin update all" on public.profiles;
create policy "profiles admin update all" on public.profiles
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text in ('admin','super_admin'))
  ) with check (true);

-- 3) Comissão de um pedido (helper) -----------------------------------------
create or replace function public.order_commission(p_order_id uuid)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(
    oi.qty * case when pr.commission_type = 'percentage'
                  then oi.price * coalesce(pr.commission_value,0) / 100
                  else coalesce(pr.commission_value,0) end
  ), 0)
  from public.order_items oi
  join public.products pr on pr.id = oi.product_id
  where oi.order_id = p_order_id;
$$;

-- 4) Visão geral do afiliado autenticado ------------------------------------
create or replace function public.affiliate_overview()
returns table (code text, sales_count bigint, revenue numeric, commission numeric)
language plpgsql
stable
security definer
set search_path = public
as $$
declare v_code text;
begin
  select affiliate_code into v_code from public.profiles where id = auth.uid();
  if v_code is null then
    return query select null::text, 0::bigint, 0::numeric, 0::numeric;
    return;
  end if;
  return query
    select v_code,
           count(*)::bigint,
           coalesce(sum(o.total),0),
           coalesce(sum(public.order_commission(o.id)),0)
    from public.orders o
    where o.affiliate_code = v_code and o.status = 'pago';
end;
$$;

-- 5) Vendas atribuídas ao afiliado autenticado ------------------------------
create or replace function public.affiliate_sales()
returns table (id uuid, order_number text, created_at timestamptz, total numeric, status text, commission numeric)
language plpgsql
stable
security definer
set search_path = public
as $$
declare v_code text;
begin
  select affiliate_code into v_code from public.profiles where id = auth.uid();
  if v_code is null then return; end if;
  return query
    select o.id, o.order_number, o.created_at, o.total, o.status, public.order_commission(o.id)
    from public.orders o
    where o.affiliate_code = v_code
    order by o.created_at desc;
end;
$$;

grant execute on function public.affiliate_overview() to authenticated;
grant execute on function public.affiliate_sales()   to authenticated;
