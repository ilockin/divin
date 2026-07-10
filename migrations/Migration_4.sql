-- Migration_4 — Políticas RLS para administração de encomendas
-- Correr no Supabase SQL Editor DEPOIS de Migration_3

-- Admin / producao lêem TODAS as encomendas
create policy "Admin lê todas as encomendas" on public.orders
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role in ('super_admin', 'admin', 'producao')
    )
  );

-- Admin pode atualizar o estado das encomendas
create policy "Admin atualiza encomendas" on public.orders
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role in ('super_admin', 'admin', 'producao')
    )
  ) with check (true);

-- Admin lê todos os itens de encomenda
create policy "Admin lê todos os itens" on public.order_items
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role in ('super_admin', 'admin', 'producao')
    )
  );

-- Função auxiliar que lê o role sem RLS (security definer evita recursão infinita
-- quando a política precisa de consultar a própria tabela profiles)
create or replace function public.get_my_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role::text from public.profiles where id = auth.uid();
$$;

-- Admin lê todos os perfis (necessário para a listagem de utilizadores)
-- Usa get_my_role() em vez de subquery directa para evitar recursão infinita no RLS
create policy "Admin lê todos os perfis" on public.profiles
  for select using (
    public.get_my_role() in ('super_admin', 'admin')
  );
