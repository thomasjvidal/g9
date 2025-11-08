import { Home, TrendingUp, Dumbbell, CheckSquare, Target, Users } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const BottomNav = () => {
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

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/evolucao", icon: TrendingUp, label: "Evolução" },
    { to: "/treinos", icon: Dumbbell, label: "Treinos" },
    { to: "/checkin", icon: CheckSquare, label: "Check-in" },
    { to: "/desafios", icon: Target, label: "Desafios" },
  ];

  if (profile?.coach) {
    navItems.push({ to: "/mentor", icon: Users, label: "Mentor" });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/95 backdrop-blur-lg">
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center justify-center p-2 rounded-lg transition-all hover:bg-muted/50"
            activeClassName="text-primary bg-primary/10"
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
