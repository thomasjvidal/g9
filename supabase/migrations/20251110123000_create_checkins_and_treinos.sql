-- Tabela de Check-ins Diários
create table if not exists public.checkins_diarios (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references auth.users(id) on delete cascade,
  data date not null default (timezone('utc', now()))::date,
  energia text,  -- valores esperados: 'baixa', 'média', 'alta'
  criado_em timestamptz default now()
);

-- Índices úteis
create index if not exists checkins_diarios_usuario_id_idx on public.checkins_diarios (usuario_id);
create index if not exists checkins_diarios_data_idx on public.checkins_diarios (data);

-- Habilitar RLS e Policies para authenticated
alter table public.checkins_diarios enable row level security;

drop policy if exists "select own checkins" on public.checkins_diarios;
create policy "select own checkins"
on public.checkins_diarios
for select
to authenticated
using (usuario_id = auth.uid());

drop policy if exists "insert own checkins" on public.checkins_diarios;
create policy "insert own checkins"
on public.checkins_diarios
for insert
to authenticated
with check (usuario_id = auth.uid());

drop policy if exists "update own checkins" on public.checkins_diarios;
create policy "update own checkins"
on public.checkins_diarios
for update
to authenticated
using (usuario_id = auth.uid())
with check (usuario_id = auth.uid());

--------------------------------------------------------------------------------

-- Tabela de Treinos Realizados (usada em Dashboard/Mentor)
create table if not exists public.treinos_realizados (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references auth.users(id) on delete cascade,
  data date not null default (timezone('utc', now()))::date,
  concluido boolean not null default false,
  criado_em timestamptz default now()
);

-- Índices úteis
create index if not exists treinos_realizados_usuario_id_idx on public.treinos_realizados (usuario_id);
create index if not exists treinos_realizados_data_idx on public.treinos_realizados (data);

-- RLS e Policies
alter table public.treinos_realizados enable row level security;

drop policy if exists "select own trainings" on public.treinos_realizados;
create policy "select own trainings"
on public.treinos_realizados
for select
to authenticated
using (usuario_id = auth.uid());

drop policy if exists "insert own trainings" on public.treinos_realizados;
create policy "insert own trainings"
on public.treinos_realizados
for insert
to authenticated
with check (usuario_id = auth.uid());

drop policy if exists "update own trainings" on public.treinos_realizados;
create policy "update own trainings"
on public.treinos_realizados
for update
to authenticated
using (usuario_id = auth.uid())
with check (usuario_id = auth.uid());

--------------------------------------------------------------------------------

-- Forçar o PostgREST a recarregar o cache do schema (evita o erro de cache)
select pg_notify('pgrst', 'reload schema');