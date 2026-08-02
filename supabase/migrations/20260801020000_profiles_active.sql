-- Garante a coluna usada pela gestão de utilizadores (/admin/utilizadores, função admin-users).
alter table public.profiles add column if not exists active boolean not null default true;
