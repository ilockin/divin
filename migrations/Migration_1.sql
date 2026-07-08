-- Migration_1: Fase 0, Módulo 1 — Auth real do cliente (perfis + moradas)
-- Cria: enum app_role, tabelas profiles/addresses, trigger de auto-criação de perfil
-- no signup, guarda contra auto-promoção de role, e políticas RLS (cada utilizador
-- só lê/edita os seus próprios dados).
-- Executar no Supabase SQL Editor (projeto: hyaxzywkftqnizbhzbug).

create type app_role as enum ('super_admin', 'admin', 'producao', 'afiliado', 'cliente');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  phone text,
  role app_role not null default 'cliente',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  line1 text not null,
  city text not null,
  zip text not null,
  country text not null default 'Portugal',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- cria o profile automaticamente ao registar (lê "name" dos metadados passados no signUp)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- impede o próprio utilizador de mudar o seu role (promoção a admin só virá no Módulo 2, por staff)
create or replace function public.prevent_role_self_escalation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role <> old.role and auth.uid() = old.id then
    new.role := old.role;
  end if;
  return new;
end; $$;

create trigger guard_profile_role
  before update on public.profiles
  for each row execute function public.prevent_role_self_escalation();

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;

create policy "Própria leitura do perfil" on public.profiles for select using (auth.uid() = id);
create policy "Própria atualização do perfil" on public.profiles for update using (auth.uid() = id);
create policy "Próprias moradas" on public.addresses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
