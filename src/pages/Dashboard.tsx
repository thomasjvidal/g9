import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, TrendingUp, Moon, Zap, Weight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      return data;
    },
  });

  const { data: weeklyStats } = useQuery({
    queryKey: ['weeklyStats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);

      const { data: trainings } = await supabase
        .from('treinos_realizados')
        .select('*')
        .eq('usuario_id', user.id)
        .gte('data', weekAgo.toISOString().split('T')[0])
        .eq('concluido', true);

      const { data: checkins } = await supabase
        .from('checkins_diarios')
        .select('*')
        .eq('usuario_id', user.id)
        .gte('data', weekAgo.toISOString().split('T')[0])
        .order('data', { ascending: false });

      const avgEnergy = checkins?.reduce((acc, c) => {
        const energyMap = { 'baixa': 2, 'média': 3, 'alta': 5 };
        return acc + (energyMap[c.energia as keyof typeof energyMap] || 3);
      }, 0) / (checkins?.length || 1);

      const avgSleep = checkins?.reduce((acc, c) => acc + (Number(c.sono) || 0), 0) / (checkins?.length || 1);
      const latestWeight = checkins?.[0]?.peso || 0;

      return {
        trainingsCount: trainings?.length || 0,
        constancy: ((trainings?.length || 0) / 7) * 100,
        avgEnergy: avgEnergy.toFixed(1),
        avgSleep: avgSleep.toFixed(1),
        latestWeight: latestWeight ? Number(latestWeight).toFixed(1) : '0',
      };
    },
  });

  const { data: activeChallenge } = useQuery({
    queryKey: ['activeChallenge'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('desafios_usuario')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('ativo', true)
        .order('criado_em', { ascending: false })
        .limit(1)
        .maybeSingle();

      return data;
    },
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            {getGreeting()}, {profile?.nome?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground">
            Vamos continuar sua jornada hoje
          </p>
        </div>

        <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Constância Semanal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{weeklyStats?.trainingsCount || 0} de 7 treinos</span>
                <span className="font-semibold text-primary">
                  {weeklyStats?.constancy?.toFixed(0) || 0}%
                </span>
              </div>
              <Progress value={weeklyStats?.constancy || 0} className="h-2" />
            </div>
            {(weeklyStats?.constancy || 0) >= 70 && (
              <p className="text-sm text-success">
                Você evoluiu {weeklyStats?.constancy?.toFixed(0)}% em constância esta semana! 🔥
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="border-border/50">
            <CardContent className="pt-6 space-y-2">
              <div className="flex items-center justify-between">
                <Weight className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{weeklyStats?.latestWeight} kg</span>
              </div>
              <p className="text-sm text-muted-foreground">Peso Atual</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="pt-6 space-y-2">
              <div className="flex items-center justify-between">
                <Zap className="h-5 w-5 text-warning" />
                <span className="text-2xl font-bold">{weeklyStats?.avgEnergy}</span>
              </div>
              <p className="text-sm text-muted-foreground">Energia Média</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="pt-6 space-y-2">
              <div className="flex items-center justify-between">
                <Moon className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{weeklyStats?.avgSleep}h</span>
              </div>
              <p className="text-sm text-muted-foreground">Sono Médio</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="pt-6 space-y-2">
              <div className="flex items-center justify-between">
                <TrendingUp className="h-5 w-5 text-success" />
                <span className="text-2xl font-bold">{weeklyStats?.trainingsCount}</span>
              </div>
              <p className="text-sm text-muted-foreground">Treinos Semana</p>
            </CardContent>
          </Card>
        </div>

        {activeChallenge && (
          <Card className="border-primary/30 bg-gradient-to-br from-card to-primary/10">
            <CardHeader>
              <CardTitle className="text-lg">{activeChallenge.nome}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{activeChallenge.progresso} de {activeChallenge.meta} treinos</span>
                  <span className="font-semibold text-primary">
                    {Number(activeChallenge.porcentagem).toFixed(0)}%
                  </span>
                </div>
                <Progress value={Number(activeChallenge.porcentagem)} className="h-2" />
              </div>
              <p className="text-sm text-muted-foreground">
                Continue assim! Falta pouco para concluir seu desafio. 💪
              </p>
            </CardContent>
          </Card>
        )}

        <Button 
          className="w-full h-14 text-lg font-semibold"
          onClick={() => navigate('/checkin')}
        >
          <CheckCircle2 className="mr-2 h-5 w-5" />
          Fazer Check-in Diário
        </Button>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
