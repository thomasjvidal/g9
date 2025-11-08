import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Evolucao from "./pages/Evolucao";
import Treinos from "./pages/Treinos";
import CheckIn from "./pages/CheckIn";
import Desafios from "./pages/Desafios";
import Mentor from "./pages/Mentor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/evolucao" element={<Evolucao />} />
          <Route path="/treinos" element={<Treinos />} />
          <Route path="/checkin" element={<CheckIn />} />
          <Route path="/desafios" element={<Desafios />} />
          <Route path="/mentor" element={<Mentor />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
