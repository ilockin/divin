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

-- Admin lê todos os perfis (necessário para a listagem de utilizadores)
create policy "Admin lê todos os perfis" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
        and p2.role in ('super_admin', 'admin')
    )
  );
