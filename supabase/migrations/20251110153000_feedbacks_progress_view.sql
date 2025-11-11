-- Feedbacks do usuário e View de progresso semanal

create table if not exists public.feedbacks (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references auth.users(id) on delete cascade,
  treino_id uuid references public.treinos_catalogo(id) on delete set null,
  texto text not null,
  tipo text default 'auto', -- auto | manual
  data timestamptz default now()
);

alter table public.feedbacks enable row level security;

drop policy if exists "feedbacks view" on public.feedbacks;
create policy "feedbacks view"
on public.feedbacks for select
to authenticated
using (usuario_id = auth.uid());

drop policy if exists "feedbacks insert" on public.feedbacks;
create policy "feedbacks insert"
on public.feedbacks for insert
to authenticated
with check (usuario_id = auth.uid());

-- View de resumo semanal de progresso por usuário
create or replace view public.progresso_semana_resumo as
with base as (
  select usuario_id, min(carga_kg) as carga_min
  from public.progresso_usuario
  where carga_kg is not null
  group by usuario_id
),
agg as (
  select
    p.usuario_id,
    p.semana,
    avg(p.carga_kg) as media_carga,
    count(*) filter (where p.concluido) as total_exercicios,
    count(distinct p.treino_id) as total_treinos
  from public.progresso_usuario p
  group by p.usuario_id, p.semana
)
select
  a.usuario_id,
  a.semana,
  a.media_carga,
  a.total_exercicios,
  a.total_treinos,
  case when b.carga_min is null or b.carga_min = 0 then null
       else round(100 * (a.media_carga - b.carga_min) / b.carga_min, 1)
  end as percentual_progresso
from agg a
left join base b on b.usuario_id = a.usuario_id;

select pg_notify('pgrst', 'reload schema');