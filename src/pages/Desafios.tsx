import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Trophy } from "lucide-react";

const Desafios = () => {
  const { data: challenges } = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from('desafios_usuario')
        .select('*')
        .eq('usuario_id', user.id)
        .order('criado_em', { ascending: false });

      return data || [];
    },
  });

  const activeChallenges = challenges?.filter(c => c.ativo);
  const completedChallenges = challenges?.filter(c => !c.ativo && Number(c.porcentagem) >= 100);

  return (
    <PageLayout title="Desafios">
      <div className="space-y-6">
        {activeChallenges && activeChallenges.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Desafios Ativos
            </h2>

            {activeChallenges.map(challenge => {
              const percentage = Number(challenge.porcentagem);
              const isCompleted = percentage >= 100;

              return (
                <Card
                  key={challenge.id}
                  className={isCompleted ? "border-success/50 bg-success/5" : "border-primary/30"}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{challenge.nome}</CardTitle>
                      <Badge variant={isCompleted ? "default" : "outline"} className={isCompleted ? "bg-success" : ""}>
                        {percentage.toFixed(0)}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{challenge.progresso} de {challenge.meta} treinos</span>
                        <span>
                          {challenge.data_inicio && new Date(challenge.data_inicio).toLocaleDateString('pt-BR')}
                          {challenge.data_fim && ` - ${new Date(challenge.data_fim).toLocaleDateString('pt-BR')}`}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>

                    {isCompleted ? (
                      <p className="text-success font-medium">
                        🎉 Parabéns! Você completou este desafio!
                      </p>
                    ) : percentage >= 70 ? (
                      <p className="text-primary font-medium">
                        Você está quase lá! Falta pouco para concluir sua meta. 💪
                      </p>
                    ) : (
                      <p className="text-muted-foreground">
                        Continue firme! Cada treino te aproxima do objetivo.
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {completedChallenges && completedChallenges.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-warning" />
              Desafios Concluídos
            </h2>

            {completedChallenges.map(challenge => (
              <Card key={challenge.id} className="border-success/30 bg-success/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{challenge.nome}</CardTitle>
                    <Badge className="bg-success">
                      <Trophy className="mr-1 h-3 w-3" />
                      Completo
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Concluído em {challenge.data_fim && new Date(challenge.data_fim).toLocaleDateString('pt-BR')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {(!challenges || challenges.length === 0) && (
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <Target className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="font-medium mb-2">Nenhum desafio ainda</p>
                <p className="text-sm text-muted-foreground">
                  Em breve seu coach criará desafios personalizados para você! 🎯
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default Desafios;
