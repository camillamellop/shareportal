// ...existing code...
// Lazy load das páginas para melhor performance
import React, { Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/stores/appStore";
import { queryConfig } from "@/hooks/useEnhancedFirestore";
import { Loader2 } from "lucide-react";
// Lazy load das páginas para melhor performance
const Index = React.lazy(() => import("./pages/Index"));
const Login = React.lazy(() => import("./pages/Login"));
const ConciliacaoBancaria = React.lazy(() => import("./pages/ConciliacaoBancaria"));
const AgendaPage = React.lazy(() => import("./pages/AgendaPage"));
const Contatos = React.lazy(() => import("./pages/Contatos"));
const Aniversarios = React.lazy(() => import("./pages/Aniversarios"));
const ConfigEmpresa = React.lazy(() => import("./pages/financeiro/ConfigEmpresa"));
const EmissaoRecibo = React.lazy(() => import("./pages/financeiro/EmissaoRecibo"));
const RelatorioViagem = React.lazy(() => import("./pages/financeiro/RelatorioViagem"));
const Cobranca = React.lazy(() => import("./pages/financeiro/Cobranca"));
const SolicitacaoCompras = React.lazy(() => import("./pages/financeiro/SolicitacaoCompras"));
const Recados = React.lazy(() => import("./pages/Recados"));
const Tarefas = React.lazy(() => import("./pages/Tarefas"));
const Perfil = React.lazy(() => import("./pages/Perfil"));
const GestaoTripulacao = React.lazy(() => import("./pages/GestaoTripulacao"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const DiarioAeronaves = React.lazy(() => import("./pages/DiarioAeronaves"));
const NovaAeronave = React.lazy(() => import("./pages/NovaAeronave"));
const DiarioDetalhes = React.lazy(() => import("./pages/DiarioDetalhes"));
const AdicionarVoo = React.lazy(() => import("./pages/AdicionarVoo"));
const AgendamentoVoo = React.lazy(() => import("./pages/AgendamentoVoo"));    
const CoordenacaoVoos = React.lazy(() => import("./pages/CoordenacaoVoos"));
const ControleAbastecimento = React.lazy(() => import("./pages/ControleAbastecimento"));
<<<<<<< HEAD
const CartaoAlimentacao = React.lazy(() => import("./pages/CartaoAlimentacao.tsx"));
const CartaoCombustivel = React.lazy(() => import("./pages/CartaoCombustivel.tsx"));
const Documentos = React.lazy(() => import("./pages/Documentos"));
=======
const CartaoAlimentacao = React.lazy(() => import("./pages/CartaoAlimentacao"));
const CartaoCombustivel = React.lazy(() => import("./pages/CartaoCombustivel"));

>>>>>>> 34cea0240ca3ba598c03146761b4feac6cb3d355


// Configuração otimizada do QueryClient
const queryClient = new QueryClient({ defaultOptions: { queries: queryConfig } });

// Componente de loading global
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

// Componente para proteger rotas
const ProtectedRoute = React.memo(({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const setUser = useAppStore(state => state.setUser);

  React.useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
});

ProtectedRoute.displayName = 'ProtectedRoute';

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/financeiro/conciliacao-bancaria" element={
                  <ProtectedRoute>
                    <ConciliacaoBancaria />
                  </ProtectedRoute>
                } />
                  <Route path="/agenda" element={
                  <ProtectedRoute>
                    <AgendaPage />
                  </ProtectedRoute>
                } />
                <Route path="/contatos" element={
                  <ProtectedRoute>
                    <Contatos />
                  </ProtectedRoute>
                } />
                <Route path="/aniversarios" element={
                  <ProtectedRoute>
                    <Aniversarios />
                  </ProtectedRoute>
                } />
                <Route path="/financeiro/config-empresa" element={
                  <ProtectedRoute>
                    <ConfigEmpresa />
                  </ProtectedRoute>
                } />
                <Route path="/financeiro/recibo" element={
                  <ProtectedRoute>
                    <EmissaoRecibo />
                  </ProtectedRoute>
                } />
                <Route path="/financeiro/cobranca" element={
                  <ProtectedRoute>
                    <Cobranca />
                  </ProtectedRoute>
                } />
                <Route path="/financeiro/solicitacao-compras" element={
                  <ProtectedRoute>
                    <SolicitacaoCompras />
                  </ProtectedRoute>
                } />
                <Route path="/financeiro/relatorio-viagem" element={
                  <ProtectedRoute>
                    <RelatorioViagem />
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
                <Route path="/gestao-tripulacao" element={
                  <ProtectedRoute>
                    <GestaoTripulacao />
                  </ProtectedRoute>
                } />
                <Route path="/diario-aeronaves" element={
                  <ProtectedRoute>
                    <DiarioAeronaves />
                  </ProtectedRoute>
                } />
                <Route path="/nova-aeronave" element={
                  <ProtectedRoute>
                    <NovaAeronave />
                  </ProtectedRoute>
                } />
                <Route path="/diario-detalhes/:id" element={
                  <ProtectedRoute>
                    <DiarioDetalhes />
                  </ProtectedRoute>
                } />
                <Route path="/adicionar-voo" element={
                  <ProtectedRoute>
                    <AdicionarVoo />
                  </ProtectedRoute>
                } />
                <Route path="/diario/adicionar-voo/:matricula" element={
                  <ProtectedRoute>
                    <AdicionarVoo />
                  </ProtectedRoute>
                } />
                <Route path="/agendamento-voo" element={
                  <ProtectedRoute>
                    <AgendamentoVoo />
                  </ProtectedRoute>
                } />
                <Route path="/coordenacao-voos" element={
                  <ProtectedRoute>
                    <CoordenacaoVoos />
                  </ProtectedRoute>
                } />
                <Route path="/controle-abastecimento" element={
                  <ProtectedRoute>
                    <ControleAbastecimento />
                  </ProtectedRoute>
                } />
                <Route path="/cartao/alimentacao" element={
                  <ProtectedRoute>
                    <CartaoAlimentacao />
                  </ProtectedRoute>
                } />
                <Route path="/cartao/combustivel" element={
                  <ProtectedRoute>
                    <CartaoCombustivel />
                  </ProtectedRoute>
                } />
                         <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <Sonner />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
