-- Corrige a recursão infinita no RLS de public.profiles.
--
-- As políticas criadas em 20260731000000_affiliates.sql avaliavam
--   exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in (...))
-- dentro de uma política DA PRÓPRIA tabela profiles. Esse subselect volta a ser
-- filtrado pelo RLS de profiles, o que o Postgres deteta como recursão infinita
-- (42P17) e devolve 500 em qualquer leitura de perfil — partindo o login no admin
-- e, por arrasto, todas as políticas de outras tabelas que consultam profiles.
--
-- A correção é isolar a consulta ao papel numa função security definer, que corre
-- com os privilégios do dono e por isso não reentra no RLS.

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role::text in ('admin', 'super_admin')
  );
$$;

grant execute on function public.is_staff() to authenticated, anon;

-- Cada utilizador lê e atualiza sempre o seu próprio perfil (sem tocar em profiles
-- noutra política, logo sem recursão).
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
  for select using (id = auth.uid());

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Staff lê e atualiza todos os perfis, agora via is_staff().
drop policy if exists "profiles admin read all" on public.profiles;
create policy "profiles admin read all" on public.profiles
  for select using (public.is_staff());

drop policy if exists "profiles admin update all" on public.profiles;
create policy "profiles admin update all" on public.profiles
  for update using (public.is_staff()) with check (true);
