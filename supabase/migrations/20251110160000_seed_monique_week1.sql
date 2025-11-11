-- Seed da Semana 1 do Protocolo G9 de Monique Rayol
-- Ajusta títulos/descrições dos 5 treinos e insere os exercícios com reps/estratégias/intervalos

-- 1) Upsert dos 5 treinos (ordem 1..5) com títulos e descrição curta
-- Atualiza se existir, insere se faltar
update public.treinos_catalogo set
  titulo = 'Treino 1 — Pernas / Glúteos',
  descricao = 'Semana 1: 3 séries • Intervalo 30s nas 2 primeiras e 40s nas seguintes • Foco técnico limpo',
  intro_video_url = coalesce(intro_video_url, 'https://your-supabase-project.storage/v1/object/public/videos/treino1-intro.mp4'),
  thumbnail_video_url = coalesce(thumbnail_video_url, 'https://your-supabase-project.storage/v1/object/public/videos/treino1-thumb.mp4'),
  tempo_estimado_min = 55,
  ativo = true
where ordem = 1;

insert into public.treinos_catalogo (ordem, titulo, descricao, intro_video_url, thumbnail_video_url, tempo_estimado_min, ativo)
select 1, 'Treino 1 — Pernas / Glúteos', 'Semana 1: 3 séries • Intervalo 30s nas 2 primeiras e 40s nas seguintes • Foco técnico limpo',
       'https://your-supabase-project.storage/v1/object/public/videos/treino1-intro.mp4',
       'https://your-supabase-project.storage/v1/object/public/videos/treino1-thumb.mp4', 55, true
where not exists (select 1 from public.treinos_catalogo where ordem = 1);

update public.treinos_catalogo set
  titulo = 'Treino 2 — Peito / Costas',
  descricao = 'Semana 1: 3 séries • Intervalo 30s nas 2 primeiras e 40s nas seguintes • Bi-set e foco dorsal/peitoral',
  intro_video_url = coalesce(intro_video_url, 'https://your-supabase-project.storage/v1/object/public/videos/treino2-intro.mp4'),
  thumbnail_video_url = coalesce(thumbnail_video_url, 'https://your-supabase-project.storage/v1/object/public/videos/treino2-thumb.mp4'),
  tempo_estimado_min = 50,
  ativo = true
where ordem = 2;

insert into public.treinos_catalogo (ordem, titulo, descricao, intro_video_url, thumbnail_video_url, tempo_estimado_min, ativo)
select 2, 'Treino 2 — Peito / Costas', 'Semana 1: 3 séries • Intervalo 30s nas 2 primeiras e 40s nas seguintes • Bi-set e foco dorsal/peitoral',
       'https://your-supabase-project.storage/v1/object/public/videos/treino2-intro.mp4',
       'https://your-supabase-project.storage/v1/object/public/videos/treino2-thumb.mp4', 50, true
where not exists (select 1 from public.treinos_catalogo where ordem = 2);

update public.treinos_catalogo set
  titulo = 'Treino 3 — Core / Abdômen / Cardio',
  descricao = 'Semana 1: 3 séries • Intervalo 30s/40s • Complemento de cardio 30–40min',
  intro_video_url = coalesce(intro_video_url, 'https://your-supabase-project.storage/v1/object/public/videos/treino3-intro.mp4'),
  thumbnail_video_url = coalesce(thumbnail_video_url, 'https://your-supabase-project.storage/v1/object/public/videos/treino3-thumb.mp4'),
  tempo_estimado_min = 60,
  ativo = true
where ordem = 3;

insert into public.treinos_catalogo (ordem, titulo, descricao, intro_video_url, thumbnail_video_url, tempo_estimado_min, ativo)
select 3, 'Treino 3 — Core / Abdômen / Cardio', 'Semana 1: 3 séries • Intervalo 30s/40s • Complemento de cardio 30–40min',
       'https://your-supabase-project.storage/v1/object/public/videos/treino3-intro.mp4',
       'https://your-supabase-project.storage/v1/object/public/videos/treino3-thumb.mp4', 60, true
where not exists (select 1 from public.treinos_catalogo where ordem = 3);

update public.treinos_catalogo set
  titulo = 'Treino 4 — Pernas / Panturrilhas / Glúteos',
  descricao = 'Semana 1: 3 séries • Intervalo 30s/40s • Isometrias em hack e quadril',
  intro_video_url = coalesce(intro_video_url, 'https://your-supabase-project.storage/v1/object/public/videos/treino4-intro.mp4'),
  thumbnail_video_url = coalesce(thumbnail_video_url, 'https://your-supabase-project.storage/v1/object/public/videos/treino4-thumb.mp4'),
  tempo_estimado_min = 55,
  ativo = true
where ordem = 4;

insert into public.treinos_catalogo (ordem, titulo, descricao, intro_video_url, thumbnail_video_url, tempo_estimado_min, ativo)
select 4, 'Treino 4 — Pernas / Panturrilhas / Glúteos', 'Semana 1: 3 séries • Intervalo 30s/40s • Isometrias em hack e quadril',
       'https://your-supabase-project.storage/v1/object/public/videos/treino4-intro.mp4',
       'https://your-supabase-project.storage/v1/object/public/videos/treino4-thumb.mp4', 55, true
where not exists (select 1 from public.treinos_catalogo where ordem = 4);

update public.treinos_catalogo set
  titulo = 'Treino 5 — Full Body (Corpo Inteiro)',
  descricao = 'Semana 1: Circuito • 1 série de cada sem descanso • Intervalo ativo 6min',
  intro_video_url = coalesce(intro_video_url, 'https://your-supabase-project.storage/v1/object/public/videos/treino5-intro.mp4'),
  thumbnail_video_url = coalesce(thumbnail_video_url, 'https://your-supabase-project.storage/v1/object/public/videos/treino5-thumb.mp4'),
  tempo_estimado_min = 60,
  ativo = true
where ordem = 5;

insert into public.treinos_catalogo (ordem, titulo, descricao, intro_video_url, thumbnail_video_url, tempo_estimado_min, ativo)
select 5, 'Treino 5 — Full Body (Corpo Inteiro)', 'Semana 1: Circuito • 1 série de cada sem descanso • Intervalo ativo 6min',
       'https://your-supabase-project.storage/v1/object/public/videos/treino5-intro.mp4',
       'https://your-supabase-project.storage/v1/object/public/videos/treino5-thumb.mp4', 60, true
where not exists (select 1 from public.treinos_catalogo where ordem = 5);

-- 2) Mapear IDs dos treinos
-- Usar tabela temporária para que "t" esteja disponível em todos os inserts abaixo
create temporary table if not exists t as
select id, ordem from public.treinos_catalogo where ordem between 1 and 5;
-- 3) Inserir exercícios da Semana 1 (se não existirem ainda para cada treino)
-- Treino 1 — Pernas/Glúteos
insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 1), 'Leg Press 45° ou Horizontal', 'Intervalo: 30s nas 2 primeiras séries, 40s nas seguintes.', '3×10–12', 'https://your-supabase-project.storage/v1/object/public/videos/leg-press.mp4', 1
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 1) and e.nome = 'Leg Press 45° ou Horizontal'
);

insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 1), 'Cadeira Extensora', 'Última série com Drop Set 6/6/Falha. Intervalo: 30s/40s.', '3×10–12 (Drop Set final)', 'https://your-supabase-project.storage/v1/object/public/videos/cadeira-extensora.mp4', 2
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 1) and e.nome = 'Cadeira Extensora'
);

insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 1), 'Cadeira Extensora Unilateral', 'Intervalo: 30s/40s.', '3×10–12', 'https://your-supabase-project.storage/v1/object/public/videos/extensora-unilateral.mp4', 3
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 1) and e.nome = 'Cadeira Extensora Unilateral'
);

insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 1), 'Mesa Flexora ou Cadeira Flexora', 'Intervalo: 30s/40s.', '3×10–12', 'https://your-supabase-project.storage/v1/object/public/videos/flexora.mp4', 4
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 1) and e.nome = 'Mesa Flexora ou Cadeira Flexora'
);

insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 1), 'Abdução de Quadril na Máquina em 2 Tempos', 'Execução em 2 tempos; Intervalo: 30s/40s.', '3×12–15', 'https://your-supabase-project.storage/v1/object/public/videos/abducao-quadril.mp4', 5
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 1) and e.nome = 'Abdução de Quadril na Máquina em 2 Tempos'
);

insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 1), 'Elevação de Quadril Barra ou Máquina (isometria 10s)', 'Isometria final de 10s em cada série; Intervalo: 30s/40s.', '3×10–12', 'https://your-supabase-project.storage/v1/object/public/videos/elevacao-quadril.mp4', 6
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 1) and e.nome = 'Elevação de Quadril Barra ou Máquina (isometria 10s)'
);

insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 1), 'Abdominal Supra Solo ou Máquina', 'Complemento Core; Intervalo: 30s/40s.', '3×20–30', 'https://your-supabase-project.storage/v1/object/public/videos/abdominal-supra.mp4', 7
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 1) and e.nome = 'Abdominal Supra Solo ou Máquina'
);

-- Treino 2 — Peito/Costas (+ Cardio H.I.I.T.)
insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 2), 'Supino Reto na Barra ou Máquina', 'Intervalo: 30s/40s.', '3×10–12', 'https://your-supabase-project.storage/v1/object/public/videos/supino-reto.mp4', 1
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 2) and e.nome = 'Supino Reto na Barra ou Máquina'
);

insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 2), 'Crucifixo Inclinado + Supino Inclinado Fechado (bi-set)', 'Bi-set: 10–12 + 12–15; Intervalo: 30s/40s.', '3×(10–12 + 12–15)', 'https://your-supabase-project.storage/v1/object/public/videos/crucifixo-supino-inclinado.mp4', 2
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 2) and e.nome = 'Crucifixo Inclinado + Supino Inclinado Fechado (bi-set)'
);

insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 2), 'Puxada na Barra', 'Intervalo: 30s/40s.', '3×10–12', 'https://your-supabase-project.storage/v1/object/public/videos/puxada-barra.mp4', 3
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 2) and e.nome = 'Puxada na Barra'
);

insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 2), 'Remada Sentada Articulada ou Máquina', 'Intervalo: 30s/40s.', '3×10–12', 'https://your-supabase-project.storage/v1/object/public/videos/remada-sentada.mp4', 4
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 2) and e.nome = 'Remada Sentada Articulada ou Máquina'
);

insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 2), 'Pull Down na Polia', 'Intervalo: 30s/40s.', '3×15–20', 'https://your-supabase-project.storage/v1/object/public/videos/pull-down.mp4', 5
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 2) and e.nome = 'Pull Down na Polia'
);

insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 2), 'Cardio H.I.I.T. 16’ + 2’ volta calma', 'Estratégia: caminhada moderada 1’ / forte 2’ / trote 1’ • repetir 4x', '18min total', 'https://your-supabase-project.storage/v1/object/public/videos/cardio-hiit.mp4', 6
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 2) and e.nome = 'Cardio H.I.I.T. 16’ + 2’ volta calma'
);

-- Treino 3 — Core/Abdômen/Cardio
insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 3), 'Abdominal Infra Solo ou Máquina', 'Intervalo: 30s/40s.', '3×20–30', 'https://your-supabase-project.storage/v1/object/public/videos/abdominal-infra.mp4', 1
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 3) and e.nome = 'Abdominal Infra Solo ou Máquina'
);

insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 3), 'Prancha Frontal Isométrica', 'Isometria por série: 45”–1’', '3×45”–1’', 'https://your-supabase-project.storage/v1/object/public/videos/prancha-frontal.mp4', 2
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 3) and e.nome = 'Prancha Frontal Isométrica'
);

insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 3), 'Lombar no Banco', 'Intervalo: 30s/40s.', '3×20–30', 'https://your-supabase-project.storage/v1/object/public/videos/lombar-banco.mp4', 3
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 3) and e.nome = 'Lombar no Banco'
);

insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 3), 'Cardio 30–40 minutos', 'Caminhada rápida (rua/esteira), bike ergométrica ou elíptico.', '30–40min', 'https://your-supabase-project.storage/v1/object/public/videos/cardio-longo.mp4', 4
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 3) and e.nome = 'Cardio 30–40 minutos'
);

-- Treino 4 — Pernas/Panturrilhas/Glúteos
insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 4), 'Agachamento Livre ou Smith', 'Intervalo: 30s/40s.', '3×10–12', 'https://your-supabase-project.storage/v1/object/public/videos/agachamento-livre.mp4', 1
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 4) and e.nome = 'Agachamento Livre ou Smith'
);

insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 4), 'Hack Machine (isometria 10s por série)', 'Isometria final de 10s; Intervalo: 30s/40s.', '3×10–12 + isometria 10s', 'https://your-supabase-project.storage/v1/object/public/videos/hack-machine.mp4', 2
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 4) and e.nome = 'Hack Machine (isometria 10s por série)'
);

insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 4), 'Mesa/Cadeira Flexora Unilateral', 'Intervalo: 30s/40s.', '3×10–12', 'https://your-supabase-project.storage/v1/object/public/videos/flexora-unilateral.mp4', 3
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 4) and e.nome = 'Mesa/Cadeira Flexora Unilateral'
);

insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 4), 'Stiff', 'Intervalo: 30s/40s.', '3×12–15', 'https://your-supabase-project.storage/v1/object/public/videos/stiff.mp4', 4
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 4) and e.nome = 'Stiff'
);

insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 4), 'Adução de Quadril na Máquina', 'Intervalo: 30s/40s.', '3×15–20', 'https://your-supabase-project.storage/v1/object/public/videos/aducao-maquina.mp4', 5
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 4) and e.nome = 'Adução de Quadril na Máquina'
);

insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 4), 'Panturrilha em Pé ou no Leg', 'Intervalo: 30s/40s.', '3×20–25', 'https://your-supabase-project.storage/v1/object/public/videos/panturrilha.mp4', 6
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 4) and e.nome = 'Panturrilha em Pé ou no Leg'
);

-- Treino 5 — Full Body
insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 5), 'Intervalo Ativo no Cardio', 'Caminhada rápida na esteira/bike/elíptico.', '6min', 'https://your-supabase-project.storage/v1/object/public/videos/cardio-ativo.mp4', 1
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 5) and e.nome = 'Intervalo Ativo no Cardio'
);

insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 5), 'Abdução de Ombros com Halteres', 'Circuito: 1 série, sem descanso entre exercícios.', '1×10–12', 'https://your-supabase-project.storage/v1/object/public/videos/abducao-ombros.mp4', 2
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 5) and e.nome = 'Abdução de Ombros com Halteres'
);

insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 5), 'Remada em Pé no Cross Over', 'Circuito.', '1×10–12', 'https://your-supabase-project.storage/v1/object/public/videos/remada-cross.mp4', 3
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 5) and e.nome = 'Remada em Pé no Cross Over'
);

insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 5), 'Afundo Funcional Alternado', 'Circuito.', '1×30', 'https://your-supabase-project.storage/v1/object/public/videos/afundo-funcional.mp4', 4
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 5) and e.nome = 'Afundo Funcional Alternado'
);

insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 5), 'Tríceps Pulley', 'Circuito.', '1×10–12', 'https://your-supabase-project.storage/v1/object/public/videos/triceps-pulley.mp4', 5
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 5) and e.nome = 'Tríceps Pulley'
);

insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 5), 'Agachamento Funcional (kettlebell/anilha)', 'Circuito.', '1×20', 'https://your-supabase-project.storage/v1/object/public/videos/agachamento-funcional.mp4', 6
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 5) and e.nome = 'Agachamento Funcional (kettlebell/anilha)'
);

insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 5), 'Rosca Direta com Halteres', 'Circuito.', '1×10–12', 'https://your-supabase-project.storage/v1/object/public/videos/rosca-direta.mp4', 7
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 5) and e.nome = 'Rosca Direta com Halteres'
);

insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 5), 'Prancha "Alpinista" Solo ou Banco', 'Circuito.', '1×20', 'https://your-supabase-project.storage/v1/object/public/videos/prancha-alpinista.mp4', 8
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 5) and e.nome = 'Prancha "Alpinista" Solo ou Banco'
);

insert into public.exercicios (treino_id, nome, descricao, reps_sugeridas, video_url, ordem)
select (select id from t where ordem = 5), 'Voador Máquina ou Crucifixo Reto com Halteres', 'Após circuito: 3 séries com foco peitoral.', '3×12–15', 'https://your-supabase-project.storage/v1/object/public/videos/voador-crucifixo.mp4', 9
where not exists (
  select 1 from public.exercicios e where e.treino_id = (select id from t where ordem = 5) and e.nome = 'Voador Máquina ou Crucifixo Reto com Halteres'
);

-- Notificar PostgREST para recarregar schema
select pg_notify('pgrst', 'reload schema');