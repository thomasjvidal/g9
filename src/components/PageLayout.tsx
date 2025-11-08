import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "./BottomNav";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
}

const PageLayout = ({ children, title }: PageLayoutProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado com sucesso!");
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      {title && (
        <header className="sticky top-0 z-40 border-b border-border/50 bg-card/95 backdrop-blur-lg">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">{title}</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>
      )}
      
      <main className="max-w-lg mx-auto px-4 py-6">
        {children}
      </main>
      
      <BottomNav />
    </div>
  );
};

export default PageLayout;
