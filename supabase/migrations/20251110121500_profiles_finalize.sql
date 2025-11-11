-- Garantir coluna username (se ainda não existir)
alter table public.profiles
  add column if not exists username text;

-- Índice único para username (idempotente)
create unique index if not exists profiles_username_key
  on public.profiles (username);

-- Backfill: criar perfis para usuários já existentes (sem definir username para evitar conflitos)
insert into public.profiles (id, nome, email, username, coach)
select u.id,
       coalesce(u.raw_user_meta_data->>'nome', u.email),
       u.email,
       null,
       false
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
);

-- Recarregar o cache do PostgREST (evita erro de cache)
select pg_notify('pgrst', 'reload schema');