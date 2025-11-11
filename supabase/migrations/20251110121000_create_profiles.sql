-- 1) Criar tabela profiles (se não existir)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  email text,
  username text unique,
  coach boolean default false,
  criado_em timestamptz default now()
);

-- 2) Habilitar RLS
alter table public.profiles enable row level security;

-- 3) Policies (idempotentes: drop + create)

-- SELECT para usuários autenticados
drop policy if exists "profiles are viewable by authenticated users" on public.profiles;
create policy "profiles are viewable by authenticated users"
on public.profiles
for select
to authenticated
using (true);

-- INSERT apenas pelo próprio usuário (id = auth.uid())
drop policy if exists "users can insert their own profile" on public.profiles;
create policy "users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

-- UPDATE apenas pelo próprio usuário
drop policy if exists "users can update their own profile" on public.profiles;
create policy "users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- 4) Função que cria/atualiza profile ao criar usuário
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome, email, username, coach)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', new.email),
    new.email,
    nullif(
      lower(
        regexp_replace(
          coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
          '[^a-z0-9_]', '', 'g'
        )
      ),
      ''
    ),
    false
  )
  on conflict (id) do update
    set nome = excluded.nome,
        email = excluded.email,
        username = coalesce(public.profiles.username, excluded.username);
  return new;
end;
$$ language plpgsql security definer;

-- 5) Trigger vinculada à criação de usuário em auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 6) Índice único (garante unicidade mesmo se a constraint não existir)
create unique index if not exists profiles_username_key on public.profiles (username);

-- 7) Forçar reload do cache do PostgREST (evita "Could not find table ... in schema cache")
select pg_notify('pgrst', 'reload schema');