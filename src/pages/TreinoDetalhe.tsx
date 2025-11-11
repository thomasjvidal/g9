import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, CheckCircle2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const TreinoDetalhe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showGaleria, setShowGaleria] = useState(false);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loadMap, setLoadMap] = useState<Record<string, number>>({});
  const [showVideoMap, setShowVideoMap] = useState<Record<string, boolean>>({});
  const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s));

  // especificidades será calculado após carregar treino/exercícios

  const { data: treino } = useQuery({
    queryKey: ['treino', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('treinos_catalogo')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      return data;
    },
    enabled: Boolean(id),
  });

  const { data: exercicios } = useQuery({
    queryKey: ['exercicios', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('exercicios')
        .select('*')
        .eq('treino_id', id)
        .order('ordem');
      return data || [];
    },
    enabled: Boolean(id),
  });

  // Agregar especificidades com base no treino e exercícios (ficha da Monique)
  const especificidades = (() => {
    const estrategia: string[] = [];
    const intervalos: string[] = [];
    const complementos: string[] = [];
    const notas: string[] = [];

    if (treino?.descricao) {
      notas.push(treino.descricao);
      if (/Semana\s*1/i.test(treino.descricao)) {
        estrategia.push('Semana 1: 3 séries, foco técnico limpo.');
      }
      if (/intervalo.*30s.*40s/i.test(treino.descricao)) {
        intervalos.push('Intervalos: 30s nas 2 primeiras séries e 40s nas seguintes.');
      }
    }

    (exercicios || []).forEach((ex: any) => {
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
  })();

  // Histórico de cargas por exercício (para micro gráfico)
  const { data: historico } = useQuery({
    queryKey: ['historicoTreino', id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !id) return {} as Record<string, any[]>;
      const { data } = await supabase
        .from('progresso_usuario')
        .select('exercicio_id, carga_kg, data')
        .eq('usuario_id', user.id)
        .eq('treino_id', id);
      const grouped: Record<string, any[]> = {};
      (data || []).forEach((row: any) => {
        if (!grouped[row.exercicio_id]) grouped[row.exercicio_id] = [];
        grouped[row.exercicio_id].push(row);
      });
      return grouped;
    },
    enabled: Boolean(id),
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: { exercicio_id: string, carga_kg?: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      const today = new Date().toISOString().split('T')[0];
      // fase/semana simples (frontend)
      const diffDays = 0;
      const week = 1; // início simples; pode evoluir conforme histórico
      const phase = 1;
      const series = 3;
      if (!isUuid(String(id)) || !isUuid(payload.exercicio_id)) {
        return; // resolve sem persistir; onSuccess atualiza estado local e informa
      }
      const { error } = await supabase
        .from('progresso_usuario')
        .insert({
          usuario_id: user.id,
          treino_id: id,
          exercicio_id: payload.exercicio_id,
          data: today,
          fase: phase,
          semana: week,
          series_previstas: series,
          carga_kg: payload.carga_kg,
          concluido: true,
        });
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      if (isUuid(String(id)) && isUuid(String(variables?.exercicio_id))) {
        if (variables?.exercicio_id) {
          setCompletedIds(prev => new Set([...prev, variables.exercicio_id]));
        }
        if (variables?.carga_kg !== undefined) {
          setLoadMap(prev => ({ ...prev, [variables.exercicio_id]: Number(variables.carga_kg) || 0 }));
        }
      }
      queryClient.invalidateQueries({ queryKey: ['progressoResumo'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyStats'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyStats'] });
      queryClient.invalidateQueries({ queryKey: ['historicoTreino', id] });
      if (isUuid(String(id)) && isUuid(String(variables?.exercicio_id))) {
        toast.success('Exercício marcado como concluído!');
      } else {
        toast.info('Marcado localmente. Publique catálogo/exercícios no banco para persistir.');
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erro ao salvar progresso');
    }
  });

  // Concluir treino no detalhe: grava em treinos_realizados e progresso_usuario
  const concluirMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !id) throw new Error('Usuário não autenticado');
      const today = new Date().toISOString().split('T')[0];
      const phase = 1; // Semana 1
      const week = 1;
      const series = 3;
      if (isUuid(String(id))) {
        const { error: errTreino } = await supabase
          .from('treinos_realizados')
          .insert({ usuario_id: user.id, treino_id: id, data: today, semana: week, fase: phase, concluido: true });
        const { error } = await supabase
          .from('progresso_usuario')
          .insert({
            usuario_id: user.id,
            treino_id: id,
            exercicio_id: null,
            data: today,
            fase: phase,
            semana: week,
            series_previstas: series,
            concluido: true,
          });
        if (errTreino) console.warn('Falha em treinos_realizados:', errTreino.message);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progressoResumo'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyStats'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyStats'] });
      if (isUuid(String(id))) {
        toast.success('Treino concluído no detalhe!');
      } else {
        toast.info('Concluído localmente. Publique o catálogo antes para persistir no banco.');
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erro ao concluir treino');
    }
  });

  // Realtime: sincroniza dados do treino detalhado
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !id) return;
      channel = supabase
        .channel('realtime-treino-detalhe')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'progresso_usuario' }, () => {
          queryClient.invalidateQueries({ queryKey: ['historicoTreino', id] });
          queryClient.invalidateQueries({ queryKey: ['exercicios', id] });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'treinos_realizados' }, () => {
          queryClient.invalidateQueries({ queryKey: ['progressoResumo'] });
        })
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

  return (
    <PageLayout title={treino?.titulo || 'Treino'}>
      <div className="space-y-6 bg-[#0C0C0C] text-white min-h-screen -mx-4 px-4 pb-24">
        {/* Banner de imagem do treino */}
        <Card className="bg-black/60 border border-white/10">
          <CardContent className="pt-4">
            <img
              src={treino?.thumbnail_img_url || '/images/treino-c.svg'}
              alt={treino?.titulo || 'Treino'}
              className="w-full h-40 object-cover rounded-md"
            />
          </CardContent>
        </Card>
        {/* Vídeo de introdução */}
        {/* Vídeo de introdução removido: manter apenas imagem/banner */}

        {/* Abas de Especificidades do Treino (ficha da Monique) */}
        <Card className="bg-black/50 border border-white/10">
          <CardHeader>
            <CardTitle>Especificidades do treino</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="estrategia" className="w-full">
              <TabsList className="bg-black/40 border border-white/10">
                <TabsTrigger value="estrategia">Estratégia</TabsTrigger>
                <TabsTrigger value="intervalos">Intervalos</TabsTrigger>
                <TabsTrigger value="complementos">Complementos</TabsTrigger>
                <TabsTrigger value="notas">Notas</TabsTrigger>
              </TabsList>
              <TabsContent value="estrategia" className="mt-3 space-y-2">
                {especificidades.estrategia.map((t, i) => (
                  <p key={i} className="text-sm text-white/80">• {t}</p>
                ))}
              </TabsContent>
              <TabsContent value="intervalos" className="mt-3 space-y-2">
                {especificidades.intervalos.map((t, i) => (
                  <p key={i} className="text-sm text-white/80">• {t}</p>
                ))}
              </TabsContent>
              <TabsContent value="complementos" className="mt-3 space-y-2">
                {especificidades.complementos.map((t, i) => (
                  <p key={i} className="text-sm text-white/80">• {t}</p>
                ))}
              </TabsContent>
              <TabsContent value="notas" className="mt-3 space-y-2">
                {especificidades.notas.map((t, i) => (
                  <p key={i} className="text-sm text-white/80">• {t}</p>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Lista de exercícios */}
        <Card className="bg-black/60 border border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Exercícios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {exercicios?.map((ex: any) => (
              <div key={ex.id} className="p-3 border border-white/10 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{ex.nome}</p>
                    <p className="text-sm text-white/70">{ex.reps_sugeridas || '10–12 reps'} • [{treino?.series || 3} séries]</p>
                  </div>
                  {ex.video_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-orange-400 hover:bg-orange-400/10"
                      onClick={() => setShowVideoMap(prev => ({ ...prev, [ex.id]: !prev[ex.id] }))}
                    >
                      <Play className="mr-1 h-4 w-4" /> Ver técnica
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Input type="number" placeholder="Carga (kg)" className="w-32 bg-black/40 border-white/20 text-white" onChange={(e) => {
                    (ex as any).inputCarga = Number(e.target.value);
                  }} />
                  <Button size="sm" className="bg-gradient-to-r from-red-600 to-orange-500 text-white border-none" onClick={() => saveMutation.mutate({ exercicio_id: ex.id, carga_kg: (ex as any).inputCarga })}>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Concluído
                  </Button>
                </div>
                {showVideoMap[ex.id] && ex.video_url && (
                  <div className="mt-2">
                    <video src={ex.video_url} controls className="w-full rounded-md" />
                  </div>
                )}
                {/* Micro gráfico simples: últimas 5 cargas */}
                <div className="mt-2">
                  <div className="flex items-end gap-1 h-16">
                    {(historico?.[ex.id] || []).slice(-5).map((h: any, idx: number) => {
                      const val = Number(h.carga_kg) || 0;
                      const max = Math.max(...(historico?.[ex.id] || []).map((x: any) => Number(x.carga_kg) || 0), 1);
                      const height = Math.max(8, Math.round((val / max) * 64));
                      return (
                        <div key={idx} className="w-6 bg-gradient-to-t from-red-600 to-orange-500" style={{ height }} title={`${val} kg`} />
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Painel de resumo da sessão */}
        <Card className="bg-black/60 border border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Resumo do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-sm text-white/70">Exercícios</p>
                <p className="text-xl font-bold">{completedIds.size}/{exercicios?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-white/70">Carga média</p>
                <p className="text-xl font-bold">{(() => {
                  const vals = Object.values(loadMap);
                  if (vals.length === 0) return '—';
                  const avg = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
                  return `${avg} kg`;
                })()}</p>
              </div>
              <div>
                <p className="text-sm text-white/70">Duração</p>
                <p className="text-xl font-bold">{treino?.tempo_estimado_min || 55} min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => navigate('/treinos')}>Voltar</Button>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="border-none bg-white/10"
              onClick={async () => {
                try {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (!user) throw new Error('Usuário não autenticado');
                  await supabase.from('feedbacks').insert({
                    usuario_id: user.id,
                    treino_id: id,
                    tipo: 'auto',
                    texto: 'Sessão salva: bom desempenho hoje. Próxima fase, +10% volume.',
                  });
                  toast.success('Feedback salvo!');
                } catch (err: any) {
                  toast.error(err.message || 'Erro ao salvar feedback');
                }
              }}
            >
              Salvar feedback
            </Button>
            <Button
              className="bg-gradient-to-r from-red-600 to-orange-500 text-white border-none"
              onClick={() => concluirMutation.mutate()}
            >
              Concluir treino
            </Button>
          </div>
        </div>

        {/* Galeria de vídeos dos exercícios */}
        {showGaleria && (
          <Card className="fixed inset-0 m-4 z-50 bg-black/90 text-white border border-white/10 overflow-auto">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Galeria de movimentos</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowGaleria(false)}>Fechar</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {exercicios?.map((ex: any) => (
                <div key={ex.id} className="space-y-2">
                  <p className="font-medium">{ex.nome}</p>
                  {ex.video_url && (
                    <video src={ex.video_url} controls className="w-full rounded-lg" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default TreinoDetalhe;