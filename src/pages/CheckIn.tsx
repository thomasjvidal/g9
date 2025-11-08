import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const CheckIn = () => {
  const [sono, setSono] = useState("");
  const [energia, setEnergia] = useState("média");
  const [humor, setHumor] = useState("😐");
  const [peso, setPeso] = useState("");
  const [treinoFeito, setTreinoFeito] = useState(false);
  
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase
        .from('checkins_diarios')
        .upsert({
          usuario_id: user.id,
          sono: parseFloat(sono),
          energia,
          humor,
          peso: peso ? parseFloat(peso) : null,
          treino_feito: treinoFeito,
          data: today,
        }, {
          onConflict: 'usuario_id,data'
        });

      if (error) throw error;

      if (treinoFeito) {
        await supabase
          .from('treinos_realizados')
          .insert({
            usuario_id: user.id,
            treino_nome: "Check-in rápido",
            data: today,
            concluido: true,
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklyStats'] });
      queryClient.invalidateQueries({ queryKey: ['activeChallenge'] });
      toast.success("Check-in salvo! Continue firme! 💪");
      setSono("");
      setPeso("");
      setTreinoFeito(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao salvar check-in");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sono) {
      toast.error("Por favor, informe quantas horas dormiu");
      return;
    }
    mutation.mutate();
  };

  return (
    <PageLayout title="Check-in Diário">
      <Card>
        <CardHeader>
          <CardTitle>Como você está hoje?</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="sono">Quantas horas dormiu? *</Label>
              <Input
                id="sono"
                type="number"
                step="0.5"
                min="0"
                max="24"
                placeholder="Ex: 7.5"
                value={sono}
                onChange={(e) => setSono(e.target.value)}
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Energia do dia</Label>
              <RadioGroup value={energia} onValueChange={setEnergia}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="baixa" id="baixa" />
                  <Label htmlFor="baixa" className="cursor-pointer">Baixa</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="média" id="media" />
                  <Label htmlFor="media" className="cursor-pointer">Média</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="alta" id="alta" />
                  <Label htmlFor="alta" className="cursor-pointer">Alta</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Como está seu humor?</Label>
              <div className="flex gap-4 justify-around">
                {["😞", "😐", "🙂", "💪"].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setHumor(emoji)}
                    className={`text-4xl p-3 rounded-lg transition-all ${
                      humor === emoji
                        ? "bg-primary/20 ring-2 ring-primary scale-110"
                        : "bg-muted/50 hover:bg-muted"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="peso">Peso corporal (kg) - opcional</Label>
              <Input
                id="peso"
                type="number"
                step="0.1"
                min="0"
                placeholder="Ex: 75.5"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="treino"
                checked={treinoFeito}
                onChange={(e) => setTreinoFeito(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <Label htmlFor="treino" className="cursor-pointer">
                Treino feito hoje? ✅
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-12"
              disabled={mutation.isPending}
            >
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Check-in
            </Button>
          </form>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default CheckIn;
