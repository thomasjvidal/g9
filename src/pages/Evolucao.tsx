import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Activity, Moon } from "lucide-react";

const Evolucao = () => {
  const { data: evolutionData } = useQuery({
    queryKey: ['evolution'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: checkins } = await supabase
        .from('checkins_diarios')
        .select('*')
        .eq('usuario_id', user.id)
        .gte('data', thirtyDaysAgo.toISOString().split('T')[0])
        .order('data', { ascending: true });

      return checkins?.map(c => ({
        data: new Date(c.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        peso: Number(c.peso) || 0,
        sono: Number(c.sono) || 0,
        energia: c.energia === 'alta' ? 5 : c.energia === 'média' ? 3 : 2,
      })) || [];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['monthlyStats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: trainings } = await supabase
        .from('treinos_realizados')
        .select('*')
        .eq('usuario_id', user.id)
        .gte('data', thirtyDaysAgo.toISOString().split('T')[0])
        .eq('concluido', true);

      const { data: checkins } = await supabase
        .from('checkins_diarios')
        .select('*')
        .eq('usuario_id', user.id)
        .gte('data', thirtyDaysAgo.toISOString().split('T')[0])
        .order('data', { ascending: false });

      const avgSleep = checkins?.reduce((acc, c) => acc + (Number(c.sono) || 0), 0) / (checkins?.length || 1);
      const firstWeight = checkins?.[checkins.length - 1]?.peso || 0;
      const lastWeight = checkins?.[0]?.peso || 0;
      const weightChange = Number(lastWeight) - Number(firstWeight);

      return {
        trainingsCount: trainings?.length || 0,
        avgSleep: avgSleep.toFixed(1),
        weightChange: weightChange.toFixed(1),
        constancyWeeks: Math.floor((trainings?.length || 0) / 3),
      };
    },
  });

  return (
    <PageLayout title="Minha Evolução">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <TrendingUp className="h-5 w-5 text-primary mb-2" />
                <div className="text-2xl font-bold">{stats?.trainingsCount || 0}</div>
                <p className="text-sm text-muted-foreground">Treinos (30d)</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Moon className="h-5 w-5 text-primary mb-2" />
                <div className="text-2xl font-bold">{stats?.avgSleep}h</div>
                <p className="text-sm text-muted-foreground">Sono Médio</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Activity className="h-5 w-5 text-primary mb-2" />
                <div className="text-2xl font-bold">
                  {Number(stats?.weightChange) > 0 ? '+' : ''}{stats?.weightChange} kg
                </div>
                <p className="text-sm text-muted-foreground">Variação Peso</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <TrendingUp className="h-5 w-5 text-success mb-2" />
                <div className="text-2xl font-bold">{stats?.constancyWeeks}</div>
                <p className="text-sm text-muted-foreground">Semanas Ativo</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {stats && stats.constancyWeeks >= 4 && (
          <Card className="border-success/30 bg-success/5">
            <CardContent className="pt-6">
              <p className="text-success font-medium">
                🎉 Você manteve constância {stats.constancyWeeks} semanas seguidas!
              </p>
            </CardContent>
          </Card>
        )}

        {evolutionData && evolutionData.length > 0 && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Evolução do Peso</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="data" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="peso"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Qualidade do Sono</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="data" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sono"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}

        {(!evolutionData || evolutionData.length === 0) && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Comece a fazer check-ins diários para ver seus gráficos de evolução aqui! 📊
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default Evolucao;
