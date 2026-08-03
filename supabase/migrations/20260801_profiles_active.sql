-- Fase 2 — coluna de estado (ativo/inativo) para gestão de utilizadores.
-- Correr no Supabase → SQL Editor. Idempotente.
alter table public.profiles add column if not exists active boolean not null default true;
