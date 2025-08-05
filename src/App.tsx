import { Toast } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ValeAlimentacao from "./pages/ValeAlimentacao";
import ValeCombustivel from "./pages/ValeCombustivel";
import ConciliacaoBancaria from "./pages/ConciliacaoBancaria";
import AgendaPage from "./pages/AgendaPage";
import Contatos from "./pages/agenda/Contatos";
import Aniversarios from "./pages/Aniversarios";
import ConfigEmpresa from "./pages/financeiro/ConfigEmpresa";
import EmissaoRecibo from "./pages/financeiro/EmissaoRecibo";
import RelatoriosViagem from "./pages/RelatoriosViagem";

import Cobranca from "./pages/financeiro/Cobranca";
import SolicitacaoCompras from "./pages/financeiro/SolicitacaoCompras";
import Recados from "./pages/Recados";
import Tarefas from "./pages/Tarefas";
import Perfil from "./pages/Perfil";
import GestaoTripulacao from "./pages/GestaoTripulacao";
import NotFound from "./pages/NotFound";
import DiarioAeronaves from "./pages/DiarioAeronaves";
import NovaAeronave from "./pages/NovaAeronave";
import DiarioDetalhes from "./pages/DiarioDetalhes";
import AdicionarVoo from "./pages/AdicionarVoo";
import AgendamentoVoo from "./pages/AgendamentoVoo";
import CoordenacaoVoos from "./pages/CoordenacaoVoos";

const queryClient = new QueryClient();

// Componente para proteger rotas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  console.log("App component is rendering"); // Debug log
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* <Toast /> removido: use apenas <Sonner /> para notificações globais */}
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Rota pública de login */}
            <Route path="/login" element={<Login />} />
            
            {/* Rotas protegidas */}
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/agenda" element={
              <ProtectedRoute>
                <AgendaPage />
              </ProtectedRoute>
            } />
            <Route path="/agenda/contatos" element={
              <ProtectedRoute>
                <Contatos />
              </ProtectedRoute>
            } />
            <Route path="/agenda/aniversarios" element={
              <ProtectedRoute>
                <Aniversarios />
              </ProtectedRoute>
            } />
            <Route path="/financeiro/conciliacao" element={
              <ProtectedRoute>
                <ConciliacaoBancaria />
              </ProtectedRoute>
            } />
            <Route path="/financeiro/config" element={
              <ProtectedRoute>
                <ConfigEmpresa />
              </ProtectedRoute>
            } />
            <Route path="/financeiro/recibo" element={
              <ProtectedRoute>
                <EmissaoRecibo />
              </ProtectedRoute>
            } />
            <Route path="/financeiro/relatorios-viagem" element={
              <ProtectedRoute>
                <RelatoriosViagem />
              </ProtectedRoute>
            } />
            <Route path="/financeiro/cobranca" element={
              <ProtectedRoute>
                <Cobranca />
              </ProtectedRoute>
            } />
            <Route path="/financeiro/compras" element={
              <ProtectedRoute>
                <SolicitacaoCompras />
              </ProtectedRoute>
            } />
            <Route path="/cartao/alimentacao" element={
              <ProtectedRoute>
                <ValeAlimentacao />
              </ProtectedRoute>
            } />
            <Route path="/cartao/combustivel" element={
              <ProtectedRoute>
                <ValeCombustivel />
              </ProtectedRoute>
            } />
            <Route path="/recados" element={
              <ProtectedRoute>
                <Recados />
              </ProtectedRoute>
            } />
            <Route path="/tarefas" element={
              <ProtectedRoute>
                <Tarefas />
              </ProtectedRoute>
            } />
            <Route path="/perfil" element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            } />
            <Route path="/tripulacao" element={
              <ProtectedRoute>
                <GestaoTripulacao />
              </ProtectedRoute>
            } />
            <Route path="/diario" element={
              <ProtectedRoute>
                <DiarioAeronaves />
              </ProtectedRoute>
            } />
            <Route path="/diario/nova-aeronave" element={
              <ProtectedRoute>
                <NovaAeronave />
              </ProtectedRoute>
            } />
            <Route path="/diario/detalhes/:matricula" element={
              <ProtectedRoute>
                <DiarioDetalhes />
              </ProtectedRoute>
            } />
            <Route path="/diario/adicionar-voo/:matricula" element={
              <ProtectedRoute>
                <AdicionarVoo />
              </ProtectedRoute>
            } />
            <Route path="/agendamento" element={
              <ProtectedRoute>
                <AgendamentoVoo />
              </ProtectedRoute>
            } />
            <Route path="/coordenacao" element={
              <ProtectedRoute>
                <CoordenacaoVoos />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
