import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Play, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const Treinos = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // Dia atual (1..7), seta muda para dia seguinte/anterior
  const dow = new Date().getDay(); // 0..6 (domingo)
  const initialDayRaw = dow === 0 ? 7 : dow; // 1..7 (segunda=1)
  const initialDay = Math.min(5, initialDayRaw); // Semana 1 vai até dia 5
  const [currentDay, setCurrentDay] = useState(initialDay);
  // Removido modal de vídeo: manter somente imagens nos cards
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [doneTreinos, setDoneTreinos] = useState<Record<string, boolean>>({});

  // Fase/semana atuais do usuário (frontend, simples)
  const computePhaseWeek = (startDate?: string) => {
    const start = startDate ? new Date(startDate) : new Date();
    // fallback: se não houver histórico, começa hoje como semana 1
    const now = new Date();
    const diffDays = Math.floor((Number(now) - Number(start)) / (1000 * 60 * 60 * 24));
    const week = Math.max(1, Math.min(12, Math.floor(diffDays / 7) + 1));
    const phase = week <= 3 ? 1 : week <= 6 ? 2 : week <= 9 ? 3 : 4;
    const series = phase === 1 ? 3 : phase === 2 ? 4 : 5;
    const cargaPct = phase === 1 ? 0 : phase === 2 ? 10 : phase === 3 ? 20 : 30;
    return { week, phase, series, cargaPct };
  };

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      return data;
    },
  });

  const { data: treinos } = useQuery({
    queryKey: ['treinosCatalogo'],
    queryFn: async () => {
      const { data } = await supabase
        .from('treinos_catalogo')
        .select('*')
        .eq('ativo', true)
        .order('ordem');
      return data || [];
    },
  });

  const { data: exerciciosAll } = useQuery({
    queryKey: ['exerciciosCatalogo'],
    queryFn: async () => {
      const { data } = await supabase
        .from('exercicios')
        .select('*')
        .order('treino_id, ordem');
      return data || [];
    },
  });

  const exercisesByTreino = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    (exerciciosAll || []).forEach((ex: any) => {
      if (!grouped[ex.treino_id]) grouped[ex.treino_id] = [];
      grouped[ex.treino_id].push(ex);
    });
    return grouped;
  }, [exerciciosAll]);

  // Fallback: mostrar Treinos da Semana 1 em pilha caso não haja dados
  const fallbackTreinos = [
    {
      id: 'fake-1',
      titulo: 'Treino 1 • Pernas e Glúteos',
      descricao: 'Foco: volume e estabilidade. Técnica limpa e controle excêntrico.',
      intro_video_url: 'https://videos.example/intro1.mp4',
      thumbnail_video_url: 'https://videos.example/thumb1.mp4',
      thumbnail_img_url: '/images/treino-a.svg',
      tempo_estimado_min: 55,
    },
    {
      id: 'fake-2',
      titulo: 'Treino 2 • Peito e Costas',
      descricao: 'Força moderada com foco em ativação dorsal e peitoral.',
      intro_video_url: 'https://videos.example/intro2.mp4',
      thumbnail_video_url: 'https://videos.example/thumb2.mp4',
      thumbnail_img_url: '/images/treino-b.svg',
      tempo_estimado_min: 50,
    },
    {
      id: 'fake-3',
      titulo: 'Treino 3 • Core e Cardio',
      descricao: 'Estabilidade de tronco e condicionamento leve a moderado.',
      intro_video_url: 'https://videos.example/intro3.mp4',
      thumbnail_video_url: 'https://videos.example/thumb3.mp4',
      thumbnail_img_url: '/images/treino-c.svg',
      tempo_estimado_min: 45,
    },
    {
      id: 'fake-4',
      titulo: 'Treino 4 • Pernas/Panturrilhas/Glúteos',
      descricao: 'Força e mobilidade com foco em posteriores e panturrilhas.',
      intro_video_url: 'https://videos.example/intro4.mp4',
      thumbnail_video_url: 'https://videos.example/thumb4.mp4',
      thumbnail_img_url: '/images/treino-mobilidade.svg',
      tempo_estimado_min: 50,
    },
    {
      id: 'fake-5',
      titulo: 'Treino 5 • Full Body (Funcional)',
      descricao: 'Circuito sem descanso, 1 série por exercício, intensidade contínua.',
      intro_video_url: 'https://videos.example/intro5.mp4',
      thumbnail_video_url: 'https://videos.example/thumb5.mp4',
      thumbnail_img_url: '/images/treino-funcional.svg',
      tempo_estimado_min: 35,
    },
  ];

  const fallbackExercisesByTreino: Record<string, any[]> = {
    'fake-1': [
      { id: 'ex-f1-1', nome: 'Agachamento Livre', reps_sugeridas: '10–12 reps', descricao: 'Mantenha coluna neutra e joelhos alinhados.', video_url: 'https://videos.example/agachamento.mp4' },
      { id: 'ex-f1-2', nome: 'Leg Press', reps_sugeridas: '12–15 reps', descricao: 'Amplitude controlada; foco em quadríceps.', video_url: 'https://videos.example/legpress.mp4' },
      { id: 'ex-f1-3', nome: 'Peso Rumano', reps_sugeridas: '8–10 reps', descricao: 'Ativação de posteriores e glúteos.', video_url: 'https://videos.example/rumano.mp4' },
    ],
    'fake-2': [
      { id: 'ex-f2-1', nome: 'Supino Reto', reps_sugeridas: '8–10 reps', descricao: 'Cotovelos 45°, controle total.', video_url: 'https://videos.example/supino.mp4' },
      { id: 'ex-f2-2', nome: 'Remada Curvada', reps_sugeridas: '10–12 reps', descricao: 'Escápulas retraídas e tronco firme.', video_url: 'https://videos.example/remada.mp4' },
    ],
    'fake-3': [
      { id: 'ex-f3-1', nome: 'Prancha', reps_sugeridas: '3×45s', descricao: 'Alinhe quadril e ombros; respire.', video_url: 'https://videos.example/prancha.mp4' },
      { id: 'ex-f3-2', nome: 'Bike Ergométrica', reps_sugeridas: '10 min', descricao: 'Ritmo constante, respiração nasal.', video_url: 'https://videos.example/bike.mp4' },
    ],
    'fake-4': [
      { id: 'ex-f4-1', nome: 'Agachamento Livre ou Smith', reps_sugeridas: '10–12 reps', descricao: 'Postura firme, amplitude segura.', video_url: 'https://videos.example/agachamento-smith.mp4' },
      { id: 'ex-f4-2', nome: 'Hack Machine (isometria 10s)', reps_sugeridas: '10–12 + iso', descricao: 'Trava final de 10s por série.', video_url: 'https://videos.example/hack.mp4' },
      { id: 'ex-f4-3', nome: 'Flexora Unilateral', reps_sugeridas: '10–12 reps', descricao: 'Controle e simetria entre lados.', video_url: 'https://videos.example/flexora-unilateral.mp4' },
      { id: 'ex-f4-4', nome: 'Stiff', reps_sugeridas: '12–15 reps', descricao: 'Quadril como pivô, coluna neutra.', video_url: 'https://videos.example/stiff.mp4' },
      { id: 'ex-f4-5', nome: 'Adução de Quadril Máquina', reps_sugeridas: '15–20 reps', descricao: 'Amplitude confortável, sem impulso.', video_url: 'https://videos.example/aducao.mp4' },
      { id: 'ex-f4-6', nome: 'Panturrilha em Pé/Leg', reps_sugeridas: '20–25 reps', descricao: 'Pausa breve no topo, alonga no fundo.', video_url: 'https://videos.example/panturrilha.mp4' },
    ],
    'fake-5': [
      { id: 'ex-f5-1', nome: 'Abdução de Ombros com Halteres', reps_sugeridas: '1×10–12', descricao: 'Sem impulso; elevação controlada.', video_url: 'https://videos.example/abducao-ombros.mp4' },
      { id: 'ex-f5-2', nome: 'Remada em Pé no Cross Over', reps_sugeridas: '1×10–12', descricao: 'Pulso neutro; cotovelos altos.', video_url: 'https://videos.example/remada-pe.mp4' },
      { id: 'ex-f5-3', nome: 'Afundo Funcional Alternado', reps_sugeridas: '1×30', descricao: 'Passo firme; joelho alinhado.', video_url: 'https://videos.example/afundo.mp4' },
      { id: 'ex-f5-4', nome: 'Tríceps Pulley', reps_sugeridas: '1×10–12', descricao: 'Braços junto ao tronco.', video_url: 'https://videos.example/triceps-pulley.mp4' },
      { id: 'ex-f5-5', nome: 'Agachamento Funcional (KB/Anilha)', reps_sugeridas: '1×20', descricao: 'Centro de massa estável.', video_url: 'https://videos.example/agachamento-funcional.mp4' },
      { id: 'ex-f5-6', nome: 'Rosca Direta com Halteres', reps_sugeridas: '1×10–12', descricao: 'Punhos neutros, sem balanço.', video_url: 'https://videos.example/rosca-direta.mp4' },
      { id: 'ex-f5-7', nome: 'Prancha Alpinista', reps_sugeridas: '1×20', descricao: 'Ritmo constante, quadril alinhado.', video_url: 'https://videos.example/alpinista.mp4' },
      { id: 'ex-f5-8', nome: 'Voador Máquina / Crucifixo Reto', reps_sugeridas: '3×12–15', descricao: 'Amplitude segura e controle.', video_url: 'https://videos.example/voador.mp4' },
    ],
  };

  const treinosToShow = (treinos && treinos.length > 0) ? treinos : fallbackTreinos;

  const { data: progressoResumo } = useQuery({
    queryKey: ['progressoResumo'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { totalSemana: 0, concluidosSemana: 0 };
      const today = new Date();
      const weekStart = new Date(today); weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6);

      const { data } = await supabase
        .from('progresso_usuario')
        .select('id, data, concluido')
        .eq('usuario_id', user.id)
        .gte('data', weekStart.toISOString().split('T')[0])
        .lte('data', weekEnd.toISOString().split('T')[0]);
      const concluidos = (data || []).filter(d => d.concluido).length;
      return { totalSemana: 5, concluidosSemana: concluidos };
    },
  });

  const phaseWeek = computePhaseWeek();

  // Categorias: A, B, C, Mobilidade, Funcional — usa ordem/índice
  const categorized = useMemo(() => {
    const list = treinosToShow as any[];
    const items = [
      { label: 'A', treino: list[0] },
      { label: 'B', treino: list[1] },
      { label: 'C', treino: list[2] },
      { label: 'Mobilidade', treino: list[3] },
      { label: 'Funcional', treino: list[4] },
    ].filter(i => !!i.treino);
    return items as Array<{ label: string; treino: any }>;
  }, [treinosToShow]);

  // Seleção de treino por dia (1..5) — 6/7 repetem
  const selectedByDay = categorized.length
    ? categorized[(currentDay - 1) % categorized.length]
    : null;

  // Imagens padrão por categoria
  const categoryImages: Record<string, string> = {
    'A': '/images/treino-a.svg',
    'B': '/images/treino-b.svg',
    'C': '/images/treino-c.svg',
    'Mobilidade': '/images/treino-mobilidade.svg',
    'Funcional': '/images/treino-funcional.svg',
  };

  // Especificidades (inline no card) baseado no treino e exercícios do dia
  const especificidadesToday = useMemo(() => {
    const estrategia: string[] = [];
    const intervalos: string[] = [];
    const complementos: string[] = [];
    const notas: string[] = [];

    const treino = selectedByDay?.treino;
    const listaEx = ((treino && (exercisesByTreino[treino.id] || fallbackExercisesByTreino[treino.id])) || []) as any[];

    // Informações de estratégia gerais
    if (phaseWeek?.series) {
      estrategia.push(`Séries por exercício: ${phaseWeek.series}`);
    }
    if (treino?.tempo_estimado_min) {
      notas.push(`Duração estimada: ${treino.tempo_estimado_min} min`);
    }

    if (treino?.descricao) {
      notas.push(treino.descricao);
      if (/Semana\s*1/i.test(treino.descricao)) {
        estrategia.push('Semana 1: 3 séries, foco técnico limpo.');
      }
      if (/intervalo.*30s.*40s/i.test(treino.descricao)) {
        intervalos.push('Intervalos: 30s nas 2 primeiras séries e 40s nas seguintes.');
      }
    }

    // Regras por categoria (Funcional/Mobilidade)
    if (selectedByDay?.label === 'Funcional') {
      estrategia.push('Circuito contínuo: 1 série por exercício; transições rápidas.');
      intervalos.push('Funcional: sem intervalos formais, ritmo contínuo.');
    }
    if (selectedByDay?.label === 'Mobilidade') {
      estrategia.push('Ênfase em amplitude e controle; cadência moderada.');
      notas.push('Priorize técnica e conforto articular em toda execução.');
    }

    listaEx.forEach((ex: any) => {
      const desc = (ex.descricao || '') as string;
      const nome = (ex.nome || '') as string;
      if (/drop\s*set/i.test(desc)) {
        estrategia.push('Aplicar Drop Set na última série do exercício: ' + nome);
      }
      if (/bi[- ]?set/i.test(desc) || /bi[- ]?set/i.test(nome)) {
        estrategia.push('Executar Bi-set conforme especificado em: ' + nome);
      }
      if (/isometria\s*10s/i.test(desc) || /isometria\s*10s/i.test(nome)) {
        estrategia.push('Isometria de 10s ao final de cada série: ' + nome);
      }
      if (/intervalo/i.test(desc)) {
        const m = desc.match(/30s.*40s|30s\/40s|30–40min|45”–1’|18min|6min/i);
        if (m) intervalos.push(`${nome}: ${m[0]}`);
      }
      if (/cardio/i.test(nome) || /cardio/i.test(desc)) {
        complementos.push(`${nome}: ${desc.replace(/\s+/g, ' ').trim()}`);
      }
    });

    if (estrategia.length === 0) estrategia.push('Mantenha técnica limpa; progrida cargas semanalmente com segurança.');
    if (intervalos.length === 0) intervalos.push('Intervalos padrão: 30s nas 2 primeiras séries; 40s nas seguintes.');
    if (complementos.length === 0) complementos.push('Sem complementos específicos além dos exercícios listados.');
    if (notas.length === 0) notas.push('Anote cargas e percepções; ajuste execução conforme orientação do protocolo.');

    return { estrategia, intervalos, complementos, notas };
  }, [selectedByDay, exercisesByTreino, fallbackExercisesByTreino]);

  // Resumo do dia (contagem de exercícios concluídos, duração)
  const resumoToday = useMemo(() => {
    const treino = selectedByDay?.treino;
    const listaEx = ((treino && (exercisesByTreino[treino.id] || fallbackExercisesByTreino[treino.id])) || []) as any[];
    const total = listaEx.length;
    const completed = listaEx.reduce((acc, ex: any) => {
      const exKey = String(ex.id || `${treino?.id}-${ex.nome}`);
      return acc + (checked[exKey] ? 1 : 0);
    }, 0);
    const duracao = treino?.tempo_estimado_min || 55;
    return { total, completed, duracao };
  }, [selectedByDay, exercisesByTreino, fallbackExercisesByTreino, checked]);

  // Progresso do dia (treino e exercícios) para hidratar estado local
  const { data: progressToday } = useQuery({
    queryKey: ['progressToday', selectedByDay?.treino?.id, currentDay],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !selectedByDay?.treino?.id) return { treinoDone: false, checkedMap: {} };
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('progresso_usuario')
        .select('treino_id, exercicio_id, concluido')
        .eq('usuario_id', user.id)
        .eq('data', today)
        .eq('treino_id', selectedByDay.treino.id);
      if (error) return { treinoDone: false, checkedMap: {} };
      const checkedMap: Record<string, boolean> = {};
      let treinoDone = false;
      (data || []).forEach((row: any) => {
        if (row.exercicio_id) checkedMap[row.exercicio_id] = !!row.concluido;
        if (!row.exercicio_id && row.concluido) treinoDone = true;
      });
      return { treinoDone, checkedMap };
    },
    enabled: Boolean(selectedByDay?.treino?.id),
  });

  useEffect(() => {
    if (progressToday?.checkedMap) setChecked(progressToday.checkedMap);
    if (selectedByDay?.treino?.id) setDoneTreinos(prev => ({ ...prev, [selectedByDay.treino.id]: !!progressToday?.treinoDone }));
  }, [progressToday, selectedByDay?.treino?.id]);

  // Dia concluído (UI): usado para pintar cabeçalho e desativar inputs
  const dayDone = selectedByDay?.treino?.id ? !!doneTreinos[selectedByDay.treino.id] : false;

  // Concluir treino: grava constância da semana (uma linha por treino)
  const concluirMutation = useMutation({
    mutationFn: async (treinoId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      const today = new Date().toISOString().split('T')[0];
      const series = 3; // Semana 1: 3 séries por exercício
      const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s));
      const usingFallbackId = !isUuid(treinoId);
      if (!usingFallbackId) {
        // 1) Registrar treino realizado (nível do treino)
        const { error: errTreino } = await supabase
          .from('treinos_realizados')
          .insert({
            usuario_id: user.id,
            treino_id: treinoId,
            data: today,
            semana: phaseWeek.week,
            fase: phaseWeek.phase,
            concluido: true,
          });
        // 2) Marcar concluído em progresso_usuario (linha agregada do treino)
        const { error } = await supabase
          .from('progresso_usuario')
          .insert({
            usuario_id: user.id,
            treino_id: treinoId,
            exercicio_id: null,
            data: today,
            fase: phaseWeek.phase,
            semana: phaseWeek.week,
            series_previstas: series,
            concluido: true,
          });
        if (errTreino) console.warn('Falha em treinos_realizados:', errTreino.message);
        if (error) throw error;
      }
    },
    onSuccess: (_data, treinoId) => {
      setDoneTreinos(prev => ({ ...prev, [treinoId]: true }));
      queryClient.invalidateQueries({ queryKey: ['progressoResumo'] });
      queryClient.invalidateQueries({ queryKey: ['progressToday', treinoId] });
      queryClient.invalidateQueries({ queryKey: ['weeklyStats'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyStats'] });
      const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s));
      if (isUuid(treinoId)) {
        toast.success('Treino concluído! Constância atualizada.');
      } else {
        toast.info('Concluído localmente. Para persistir, publique o catálogo de treinos.');
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erro ao concluir treino');
    }
  });

  // Toggle de exercício: persiste por exercício em progresso_usuario
  const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s));
  const toggleExerciseMutation = useMutation({
    mutationFn: async ({ treinoId, exercicioId, checked }: { treinoId: string; exercicioId: string; checked: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      const today = new Date().toISOString().split('T')[0];
      const series = 3;
      if (!isUuid(treinoId) || !isUuid(exercicioId)) {
        return;
      }
      const { error } = await supabase
        .from('progresso_usuario')
        .upsert({
          usuario_id: user.id,
          treino_id: treinoId,
          exercicio_id: exercicioId,
          data: today,
          fase: phaseWeek.phase,
          semana: phaseWeek.week,
          series_previstas: series,
          concluido: checked,
        });
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      if (isUuid(variables.treinoId) && isUuid(variables.exercicioId)) {
        setChecked(prev => ({ ...prev, [variables.exercicioId]: variables.checked }));
      }
      queryClient.invalidateQueries({ queryKey: ['progressoResumo'] });
      queryClient.invalidateQueries({ queryKey: ['progressToday', variables.treinoId] });
      if (!isUuid(variables.treinoId) || !isUuid(variables.exercicioId)) {
        toast.info('Marcado localmente. Para salvar no histórico, publique o catálogo no banco.');
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erro ao salvar exercício');
    }
  });

  // Realtime: sincroniza entre abas para usuário logado
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      channel = supabase
        .channel('realtime-progress')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'progresso_usuario' }, () => {
          queryClient.invalidateQueries({ queryKey: ['progressoResumo'] });
          if (selectedByDay?.treino?.id) {
            queryClient.invalidateQueries({ queryKey: ['progressToday', selectedByDay.treino.id] });
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'treinos_realizados' }, () => {
          queryClient.invalidateQueries({ queryKey: ['progressoResumo'] });
        })
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [selectedByDay?.treino?.id, queryClient]);

  return (
    <PageLayout title="Treinos">
      <div className="space-y-4 bg-[#0C0C0C] text-white min-h-screen -mx-4 px-4 pb-24">
        {/* Cabeçalho minimalista com navegação por dia */}
        <Card className="border border-white/10 bg-black/60 backdrop-blur-sm">
          <CardHeader className="relative">
            <div className="absolute right-4 top-4 flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentDay(d => Math.max(1, d - 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentDay(d => Math.min(5, d + 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="w-full text-center">
              <CardTitle className={`text-lg font-bold ${dayDone ? 'text-green-400' : ''}`}>
                Semana 1 — Dia {currentDay}
                {dayDone && (
                  <span className="inline-flex items-center ml-2 align-middle">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  </span>
                )}
              </CardTitle>
              <p className="text-sm text-white/70">{phaseWeek.series} séries por exercício • Fase {phaseWeek.phase}</p>
            </div>
          </CardHeader>
        </Card>

        {/* Card do treino do dia */}
        <div className="space-y-4">
          {selectedByDay && (
            <Card key={selectedByDay.treino.id} className={`bg-black/50 border ${dayDone ? 'border-green-600' : 'border-white/10'} overflow-hidden`}>
              <div className="px-4 pt-3 text-xs text-white/60">Dia {currentDay} • Categoria {selectedByDay.label}</div>
              {/* Somente imagem do treino (sem vídeo) */}
              <div className="relative">
                <img
                  src={selectedByDay.treino.thumbnail_img_url || categoryImages[selectedByDay.label] || '/placeholder.svg'}
                  alt={selectedByDay.treino.titulo}
                  className="w-full h-40 object-cover object-bottom"
                />
                {/* Escurece topo e base para mascarar textos do SVG e dar contraste */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-2 left-3">
                  <p className="text-base font-semibold drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">{selectedByDay.treino.titulo}</p>
                  <p className="text-xs text-white/85">⏱️ {selectedByDay.treino.tempo_estimado_min || 55} min</p>
                </div>
              </div>

              <CardHeader className="pt-2">
                <p className="text-xs text-white/70">{selectedByDay.treino.descricao || (selectedByDay.label === 'Funcional' ? 'Semana 1: circuito • 1 série cada • sem descanso' : 'Semana 1: 3 séries • foco técnico limpo')}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Lista de exercícios do treino */}
                {((exercisesByTreino[selectedByDay.treino.id] || fallbackExercisesByTreino[selectedByDay.treino.id] || []) as any[]).map((ex: any) => {
                  const exKey = String(ex.id || `${selectedByDay.treino.id}-${ex.nome}`);
                  return (
                  <label key={exKey} className={`py-2 border-b border-white/10 flex items-start gap-3 ${dayDone ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-white/30 bg-black/40"
                      checked={Boolean(checked[exKey])}
                      disabled={dayDone}
                      onChange={() => {
                        if (dayDone) return; // guarda: não muta quando concluído
                        toggleExerciseMutation.mutate({ treinoId: selectedByDay.treino.id, exercicioId: exKey, checked: !checked[exKey] });
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{ex.nome}</p>
                      <p className="text-xs text-white/70">{ex.reps_sugeridas || '10–12 reps'} • Semana 1: 3 séries</p>
                      {ex.descricao && (
                        <p className="text-xs text-white/60 mt-1">{ex.descricao}</p>
                      )}
                    </div>
                  </label>
                )})}

                {/* Removido botão duplicado de concluir aqui; ações ficam abaixo do resumo */}

                {/* Especificidades do treino — inline abaixo dos checklists */}
                <div className="pt-4">
                  <Card className="bg-black/40 border border-white/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Especificidades do treino</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Tabs defaultValue="estrategia" className="w-full">
                        <TabsList className="bg-black/40 border border-white/10">
                          <TabsTrigger value="estrategia">Estratégia</TabsTrigger>
                          <TabsTrigger value="intervalos">Intervalos</TabsTrigger>
                          <TabsTrigger value="complementos">Complementos</TabsTrigger>
                          <TabsTrigger value="notas">Notas</TabsTrigger>
                        </TabsList>
                        <TabsContent value="estrategia" className="mt-3 space-y-2">
                          {especificidadesToday.estrategia.map((t, i) => (
                            <p key={i} className="text-sm text-white/80">• {t}</p>
                          ))}
                        </TabsContent>
                        <TabsContent value="intervalos" className="mt-3 space-y-2">
                          {especificidadesToday.intervalos.map((t, i) => (
                            <p key={i} className="text-sm text-white/80">• {t}</p>
                          ))}
                        </TabsContent>
                        <TabsContent value="complementos" className="mt-3 space-y-2">
                          {especificidadesToday.complementos.map((t, i) => (
                            <p key={i} className="text-sm text-white/80">• {t}</p>
                          ))}
                        </TabsContent>
                        <TabsContent value="notas" className="mt-3 space-y-2">
                          {especificidadesToday.notas.map((t, i) => (
                            <p key={i} className="text-sm text-white/80">• {t}</p>
                          ))}
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>

                {/* Painel de resumo da sessão */}
                <div className="pt-4">
                  <Card className="bg-black/60 border border-white/10">
                    <CardHeader>
                      <CardTitle className="text-lg">Resumo do Dia</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <p className="text-sm text-white/70">Exercícios</p>
                          <p className="text-xl font-bold">{resumoToday.completed}/{resumoToday.total}</p>
                        </div>
                        <div>
                          <p className="text-sm text-white/70">Carga média</p>
                          <p className="text-xl font-bold">—</p>
                        </div>
                        <div>
                          <p className="text-sm text-white/70">Duração</p>
                          <p className="text-xl font-bold">{resumoToday.duracao} min</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Ações: voltar, salvar feedback, concluir */}
                <div className="pt-3 flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => navigate('/treinos')}>Voltar</Button>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className={`border-none ${doneTreinos[selectedByDay.treino.id] ? 'bg-green-600 text-white' : 'bg-gradient-to-r from-red-600 to-orange-500 text-white'}`}
                      onClick={() => concluirMutation.mutate(selectedByDay.treino.id)}
                      disabled={doneTreinos[selectedByDay.treino.id]}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" /> {doneTreinos[selectedByDay.treino.id] ? 'Treino concluído' : 'Concluir treino'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Vídeo removido: cards exibem apenas imagem */}

        {/* Removido estado vazio; sempre mostramos pilha de treinos (ou fallback). */}
      </div>
    </PageLayout>
  );
};

export default Treinos;
