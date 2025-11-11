-- Ajustar treinos_realizados para alinhar com o frontend
-- e garantir que o PostgREST recarregue o cache do schema

-- Adicionar colunas esperadas pelo app
alter table if exists public.treinos_realizados
  add column if not exists treino_id uuid references public.treinos_catalogo(id) on delete set null,
  add column if not exists semana integer,
  add column if not exists fase integer;

-- Índice útil para consultas por treino
create index if not exists treinos_realizados_treino_id_idx on public.treinos_realizados (treino_id);

-- Recarregar cache do PostgREST (evita erro de schema cache)
select pg_notify('pgrst', 'reload schema');

-- Observação: a tabela public.progresso_usuario já é criada em 20251110130000_training_catalog.sql.
-- Se o erro "Could not find the table 'public.progresso_usuario' in the schema cache" ocorrer,
-- certifique-se de aplicar as migrações ao projeto Supabase (local/cloud) e executar o reload acima.