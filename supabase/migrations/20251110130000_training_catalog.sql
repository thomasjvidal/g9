-- Catálogo de Treinos, Exercícios e Progresso do Usuário
-- Este script é idempotente e configura RLS e policies.

-- Tabela: treinos_catalogo
create table if not exists public.treinos_catalogo (
  id uuid primary key default gen_random_uuid(),
  ordem integer not null check (ordem between 1 and 5),
  titulo text not null,
  descricao text,
  intro_video_url text,
  thumbnail_video_url text,
  tempo_estimado_min integer,
  ativo boolean default true,
  criado_em timestamptz default now()
);

-- Tabela: exercicios
create table if not exists public.exercicios (
  id uuid primary key default gen_random_uuid(),
  treino_id uuid not null references public.treinos_catalogo(id) on delete cascade,
  nome text not null,
  descricao text,
  reps_sugeridas text, -- ex: '10–12 reps' ou '10–12 reps (DropSet)'
  video_url text,
  ordem integer not null,
  criado_em timestamptz default now()
);

-- Tabela: progresso_usuario
create table if not exists public.progresso_usuario (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references auth.users(id) on delete cascade,
  treino_id uuid not null references public.treinos_catalogo(id) on delete cascade,
  exercicio_id uuid references public.exercicios(id) on delete set null,
  data date not null default (timezone('utc', now()))::date,
  fase integer not null check (fase between 1 and 4),
  semana integer not null check (semana between 1 and 12),
  series_previstas integer not null,
  carga_kg numeric(6,2),
  concluido boolean not null default true,
  feedback text,
  criado_em timestamptz default now()
);

-- Índices
create index if not exists treinos_catalogo_ordem_idx on public.treinos_catalogo (ordem);
create index if not exists exercicios_treino_id_idx on public.exercicios (treino_id, ordem);
create index if not exists progresso_usuario_usuario_data_idx on public.progresso_usuario (usuario_id, data);
create index if not exists progresso_usuario_treino_idx on public.progresso_usuario (usuario_id, treino_id);

-- RLS
alter table public.treinos_catalogo enable row level security;
alter table public.exercicios enable row level security;
alter table public.progresso_usuario enable row level security;

-- Policies
-- Catálogo: coaches podem gerenciar, autenticados podem ver
drop policy if exists "catalog view" on public.treinos_catalogo;
create policy "catalog view"
on public.treinos_catalogo for select
to authenticated
using (true);

drop policy if exists "catalog manage" on public.treinos_catalogo;
create policy "catalog manage"
on public.treinos_catalogo for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.coach = true
  )
);

-- Exercícios: coaches gerenciam, autenticados veem
drop policy if exists "exercises view" on public.exercicios;
create policy "exercises view"
on public.exercicios for select
to authenticated
using (true);

drop policy if exists "exercises manage" on public.exercicios;
create policy "exercises manage"
on public.exercicios for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.coach = true
  )
);

-- Progresso: usuário gerencia seu próprio progresso
drop policy if exists "progress view" on public.progresso_usuario;
create policy "progress view"
on public.progresso_usuario for select
to authenticated
using (usuario_id = auth.uid());

drop policy if exists "progress insert" on public.progresso_usuario;
create policy "progress insert"
on public.progresso_usuario for insert
to authenticated
with check (usuario_id = auth.uid());

drop policy if exists "progress update" on public.progresso_usuario;
create policy "progress update"
on public.progresso_usuario for update
to authenticated
using (usuario_id = auth.uid())
with check (usuario_id = auth.uid());

-- Seed básico (opcional): criar 5 treinos se não existirem
insert into public.treinos_catalogo (ordem, titulo, descricao, intro_video_url, thumbnail_video_url, tempo_estimado_min)
select * from (
  values
  (1, 'Treino 1 — Pernas / Glúteos', 'Força + Volume — foco em ativação e estabilidade.', 'https://videos.example/intro1.mp4', 'https://videos.example/thumb1.mp4', 55),
  (2, 'Treino 2 — Costas / Bíceps', 'Trações e remadas com técnica limpa.', 'https://videos.example/intro2.mp4', 'https://videos.example/thumb2.mp4', 50),
  (3, 'Treino 3 — Peito / Tríceps', 'Volume moderado, foco em controle excêntrico.', 'https://videos.example/intro3.mp4', 'https://videos.example/thumb3.mp4', 50),
  (4, 'Treino 4 — Ombros / Core', 'Estabilidade de tronco e mobilidade de cintura escapular.', 'https://videos.example/intro4.mp4', 'https://videos.example/thumb4.mp4', 45),
  (5, 'Treino 5 — Full Body', 'Integração de padrões com carga moderada.', 'https://videos.example/intro5.mp4', 'https://videos.example/thumb5.mp4', 60)
) as v(ordem, titulo, descricao, intro, thumb, tempo)
where not exists (
  select 1 from public.treinos_catalogo tc where tc.ordem = v.ordem
)
returning intro as intro_video_url, thumb as thumbnail_video_url;

-- Forçar reload do cache do PostgREST
select pg_notify('pgrst', 'reload schema');