import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState("");
  const [username, setUsername] = useState("");
  const [identifier, setIdentifier] = useState(""); // email ou usuário
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecoveryMode(true);
        setIsLogin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRecoveryMode) {
        if (!password || password.length < 6) {
          throw new Error("A nova senha deve ter pelo menos 6 caracteres");
        }
        if (password !== confirmPassword) {
          throw new Error("As senhas não coincidem");
        }
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        toast.success("Senha atualizada com sucesso. Faça login novamente.");
        setIsRecoveryMode(false);
        setIsLogin(true);
        return;
      }

      if (isLogin) {
        let loginEmail = identifier;
        if (!identifier.includes("@")) {
          try {
            const { data: profile, error: profileErr } = await supabase
              .from("profiles")
              .select("email")
              .eq("username", identifier)
              .maybeSingle();
            if (profileErr) {
              const msg = String(profileErr.message || "").toLowerCase();
              if (msg.includes("column") && msg.includes("username")) {
                toast.error("Login por usuário indisponível. Use seu email.");
              } else {
                throw profileErr;
              }
            } else {
              if (!profile?.email) throw new Error("Usuário não encontrado");
              loginEmail = profile.email;
            }
          } catch (err: any) {
            const msg = String(err?.message || "").toLowerCase();
            if (!(msg.includes("column") && msg.includes("username"))) {
              throw err;
            }
          }
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password,
        });

        if (error) throw error;
        
        toast.success("Login realizado com sucesso!");
        localStorage.setItem("rememberMe", rememberMe ? "true" : "false");
        navigate("/");
      } else {
        if (!email.includes("@")) {
          throw new Error("Informe um email válido");
        }
        if (!username || username.length < 3) {
          throw new Error("Nome de usuário deve ter pelo menos 3 caracteres");
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
          throw new Error("Usuário deve conter apenas letras, números e _");
        }
        if (password !== confirmPassword) {
          throw new Error("As senhas não coincidem");
        }

        try {
          const { data: existing, error: checkErr } = await supabase
            .from("profiles")
            .select("id")
            .eq("username", username)
            .maybeSingle();
          if (checkErr) {
            const msg = String(checkErr.message || "").toLowerCase();
            if (msg.includes("column") && msg.includes("username")) {
              throw new Error("Funcionalidade de usuário não habilitada. Aplique a migração de username no Supabase.");
            }
            throw checkErr;
          }
          if (existing?.id) {
            throw new Error("Usuário já está em uso");
          }
        } catch (err: any) {
          const msg = String(err?.message || "").toLowerCase();
          if (msg.includes("funcionalidade de usuário não habilitada")) {
            throw err;
          }
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: {
              nome: nome,
              username: username,
            },
          },
        });

        if (error) throw error;
        
        toast.success("Cadastro realizado! Você já pode fazer login.");
        setIsLogin(true);
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar sua solicitação");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      if (!identifier || !identifier.includes("@")) {
        toast.error("Informe seu email para recuperar a senha");
        return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(identifier, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
      toast.success("Link de recuperação enviado para seu email");
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar recuperação de senha");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card opacity-50" />
      
      <Card className="w-full max-w-md relative z-10 border-border/50 shadow-card">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-center mb-4">
            <div className="text-5xl font-bold text-primary">G9</div>
          </div>
          <CardTitle className="text-2xl text-center">
            {isRecoveryMode ? "Redefinir Senha" : isLogin ? "Entrar" : "Criar Conta"}
          </CardTitle>
          <CardDescription className="text-center">
            {isRecoveryMode
              ? "Defina uma nova senha para sua conta"
              : isLogin
                ? "Entre para acessar seu progresso"
                : "Cadastre-se para começar sua jornada"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && !isRecoveryMode && (
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required={!isLogin}
                  disabled={loading}
                />
              </div>
            )}

            {isLogin && !isRecoveryMode && (
              <div className="space-y-2">
                <Label htmlFor="identifier">Email ou Usuário</Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="seu@email.com ou seu_usuario"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            )}

            {!isLogin && !isRecoveryMode && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">Usuário</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="seu_usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            {(!isLogin || isRecoveryMode) && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
            )}

            {isLogin && !isRecoveryMode && (
              <div className="flex items-center gap-2">
                <Input
                  id="rememberMe"
                  type="checkbox"
                  className="w-4 h-4"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <Label htmlFor="rememberMe">Manter conectado</Label>
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isRecoveryMode ? "Redefinir Senha" : isLogin ? "Entrar" : "Criar Conta"}
            </Button>
            
            {!isRecoveryMode && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setIsLogin(!isLogin)}
                disabled={loading}
              >
                {isLogin
                  ? "Não tem conta? Cadastre-se"
                  : "Já tem conta? Entre"}
              </Button>
            )}

            {isLogin && !isRecoveryMode && (
              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={handleResetPassword}
                disabled={loading}
              >
                Esqueceu a senha?
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
