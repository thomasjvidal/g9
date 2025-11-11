import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const TreinoDetalhe = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: exercicios, isLoading, error } = useQuery({
    queryKey: ["exerciciosPorTreino", id],
    queryFn: async () => {
      if (!id) return [];
      const { data } = await supabase
        .from("exercicios")
        .select("id, nome, descricao, reps_sugeridas, video_url, ordem")
        .eq("treino_id", id)
        .order("ordem");
      return data || [];
    },
  });

  return (
    <PageLayout title="Treino">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/treinos")}>Voltar</Button>
        <div className="text-sm text-muted-foreground">ID: {id}</div>
      </div>

      {isLoading && <div>Carregando exercícios...</div>}
      {error && <div>Erro ao carregar exercícios.</div>}

      {(!isLoading && !error) && (
        <div className="space-y-4">
          {exercicios && exercicios.length > 0 ? (
            exercicios.map((ex: any) => (
              <Card key={ex.id}>
                <CardHeader>
                  <CardTitle className="text-base">{ex.nome}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-2">{ex.descricao}</div>
                  <div className="text-sm">Reps sugeridas: {ex.reps_sugeridas || "—"}</div>
                  {ex.video_url && (
                    <a className="text-primary text-sm" href={ex.video_url} target="_blank" rel="noreferrer">
                      Ver vídeo
                    </a>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sem exercícios cadastrados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Não encontramos exercícios para este treino.
                  {id?.startsWith("fake-") && " Você pode usar os treinos de exemplo da Semana 1."}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </PageLayout>
  );
};

export default TreinoDetalhe;