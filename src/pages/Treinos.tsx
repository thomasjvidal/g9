import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Play } from "lucide-react";
import { toast } from "sonner";

const Treinos = () => {
  const queryClient = useQueryClient();

  const { data: videos } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const { data } = await supabase
        .from('videos_treino')
        .select('*')
        .order('categoria');
      
      return data || [];
    },
  });

  const { data: completedToday } = useQuery({
    queryKey: ['completedToday'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const today = new Date().toISOString().split('T')[0];

      const { data } = await supabase
        .from('treinos_realizados')
        .select('treino_id')
        .eq('usuario_id', user.id)
        .eq('data', today)
        .eq('concluido', true);

      return data?.map(t => t.treino_id) || [];
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (videoId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase
        .from('treinos_realizados')
        .insert({
          usuario_id: user.id,
          treino_id: videoId,
          data: today,
          concluido: true,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completedToday'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyStats'] });
      queryClient.invalidateQueries({ queryKey: ['activeChallenge'] });
      toast.success("Treino concluído! 💪");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao marcar treino como concluído");
    },
  });

  const categorias = [...new Set(videos?.map(v => v.categoria))];

  return (
    <PageLayout title="Treinos">
      <div className="space-y-6">
        {categorias.map(categoria => (
          <div key={categoria} className="space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Badge variant="outline" className="border-primary text-primary">
                {categoria}
              </Badge>
            </h2>

            <div className="space-y-3">
              {videos
                ?.filter(v => v.categoria === categoria)
                .map(video => {
                  const isCompleted = completedToday?.includes(video.id);

                  return (
                    <Card key={video.id} className={isCompleted ? "border-success/50 bg-success/5" : ""}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center justify-between">
                          <span>{video.titulo}</span>
                          {isCompleted && (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {video.descricao && (
                          <p className="text-sm text-muted-foreground">{video.descricao}</p>
                        )}
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="flex-1"
                          >
                            <a href={video.link_video} target="_blank" rel="noopener noreferrer">
                              <Play className="mr-2 h-4 w-4" />
                              Assistir
                            </a>
                          </Button>
                          
                          {!isCompleted && (
                            <Button
                              size="sm"
                              onClick={() => completeMutation.mutate(video.id)}
                              disabled={completeMutation.isPending}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Concluir
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        ))}

        {(!videos || videos.length === 0) && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Nenhum treino disponível ainda. Em breve seu coach adicionará os treinos! 🎯
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default Treinos;
