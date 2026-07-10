-- Migration_5 — Tabela de configurações da loja (Stripe e outras integrações)
-- Correr no Supabase SQL Editor DEPOIS de Migration_4

create table public.store_settings (
  key        text primary key,
  value      text not null default '',
  is_secret  boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.store_settings enable row level security;

-- Utilizadores autenticados podem ler definições não secretas (ex: publishable_key, stripe_enabled)
create policy "Leitura pública de definições" on public.store_settings
  for select using (auth.uid() is not null and is_secret = false);

-- Admin lê TODAS as definições (incluindo secretas)
create policy "Admin lê todas as definições" on public.store_settings
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('super_admin', 'admin')
    )
  );

-- Admin pode inserir definições
create policy "Admin insere definições" on public.store_settings
  for insert with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('super_admin', 'admin')
    )
  );

-- Admin pode atualizar definições
create policy "Admin actualiza definições" on public.store_settings
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('super_admin', 'admin')
    )
  );

-- Seed: chaves Stripe (vazias por defeito)
insert into public.store_settings (key, value, is_secret) values
('stripe_enabled',        'false', false),
('stripe_test_mode',      'true',  false),
('stripe_publishable_key','',      false),
('stripe_secret_key',     '',      true),
('stripe_webhook_secret', '',      true);
