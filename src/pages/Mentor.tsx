import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Activity, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Mentor = () => {
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

  useEffect(() => {
    if (profile && !profile.coach) {
      navigate('/');
    }
  }, [profile, navigate]);

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nome, email')
        .eq('coach', false);

      if (!profiles) return [];

      const studentsWithStats = await Promise.all(
        profiles.map(async (student) => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);

          const { data: trainings } = await supabase
            .from('treinos_realizados')
            .select('*')
            .eq('usuario_id', student.id)
            .gte('data', weekAgo.toISOString().split('T')[0])
            .eq('concluido', true);

          const { data: checkins } = await supabase
            .from('checkins_diarios')
            .select('*')
            .eq('usuario_id', student.id)
            .order('data', { ascending: false })
            .limit(1);

          const lastCheckin = checkins?.[0];
          const avgEnergy = lastCheckin?.energia || 'N/A';

          return {
            ...student,
            frequencia: trainings?.length || 0,
            energiaMedia: avgEnergy,
            ultimoCheckin: lastCheckin?.data ? new Date(lastCheckin.data).toLocaleDateString('pt-BR') : 'Nunca',
          };
        })
      );

      return studentsWithStats;
    },
    enabled: profile?.coach === true,
  });

  if (!profile?.coach) {
    return null;
  }

  return (
    <PageLayout title="Mentor G9">
      <div className="space-y-6">
        <Card className="border-primary/30 bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Painel do Coach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-3xl font-bold text-primary">{students?.length || 0}</div>
                <p className="text-sm text-muted-foreground">Alunos Total</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-success">
                  {students?.filter(s => s.frequencia >= 3).length || 0}
                </div>
                <p className="text-sm text-muted-foreground">Ativos (7d)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Alunos</h2>
          
          {students && students.length > 0 ? (
            students.map(student => (
              <Card key={student.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{student.nome}</CardTitle>
                    <Badge variant={student.frequencia >= 3 ? "default" : "secondary"}>
                      {student.frequencia >= 3 ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{student.email}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
                      <Activity className="h-4 w-4 mb-1 text-primary" />
                      <span className="font-semibold">{student.frequencia}</span>
                      <span className="text-xs text-muted-foreground">Treinos/sem</span>
                    </div>
                    
                    <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
                      <Badge variant="outline" className="text-xs">
                        {student.energiaMedia}
                      </Badge>
                      <span className="text-xs text-muted-foreground mt-1">Energia</span>
                    </div>
                    
                    <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
                      <Calendar className="h-4 w-4 mb-1 text-muted-foreground" />
                      <span className="text-xs text-center">{student.ultimoCheckin}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Nenhum aluno cadastrado ainda.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Mentor;
