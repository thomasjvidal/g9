-- Ajustar checkins_diarios para o formato esperado pelo app
alter table public.checkins_diarios
  add column if not exists sono decimal(4,1),
  add column if not exists energia text,
  add column if not exists humor text,
  add column if not exists peso decimal(5,2),
  add column if not exists treino_feito boolean default false;

-- Índice único para suportar upsert(usuario_id, data)
create unique index if not exists checkins_diarios_usuario_data_unique
  on public.checkins_diarios (usuario_id, data);

-- Garantir coluna usada no insert de treinos_realizados
alter table public.treinos_realizados
  add column if not exists treino_nome text;

-- Forçar o PostgREST a recarregar o cache do schema
select pg_notify('pgrst', 'reload schema');