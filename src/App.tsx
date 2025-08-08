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
const ValeAlimentacao = React.lazy(() => import("./pages/ValeAlimentacao"));
const ValeCombustivel = React.lazy(() => import("./pages/ValeCombustivel"));
const ConciliacaoBancaria = React.lazy(() => import("./pages/ConciliacaoBancaria"));
const AgendaPage = React.lazy(() => import("./pages/AgendaPage"));
const Contatos = React.lazy(() => import("./pages/agenda/Contatos"));
const Aniversarios = React.lazy(() => import("./pages/Aniversarios"));
const ConfigEmpresa = React.lazy(() => import("./pages/financeiro/ConfigEmpresa"));
const EmissaoRecibo = React.lazy(() => import("./pages/financeiro/EmissaoRecibo"));
const RelatoriosViagem = React.lazy(() => import("./pages/RelatoriosViagem"));
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
const Documentos = React.lazy(() => import("./pages/Documentos"));

// Conditional import of ReactQueryDevtools
const ReactQueryDevtools = process.env.NODE_ENV === 'development' 
  ? React.lazy(() => import('@tanstack/react-query-devtools').then(module => ({ default: module.ReactQueryDevtools })))
  : () => null;

// Configuração otimizada do QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      ...queryConfig,
      retry: (failureCount, error) => {
        // Não tentar novamente em caso de erro 404 ou de autenticação
        if (error instanceof Error && 
           (error.message.includes('404') || error.message.includes('auth'))) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

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

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Protected route error:', error, errorInfo);
      }}
    >
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
});

const App = () => {
  const clearAll = useAppStore(state => state.clearAll);
  
  // Cleanup do store quando o app desmonta
  React.useEffect(() => {
    return () => {
      // Cleanup apenas em desenvolvimento para não atrapalhar HMR
      if (process.env.NODE_ENV === 'development') {
        return;
      }
      clearAll();
    };
  }, [clearAll]);
  
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Application Error:', error, errorInfo);
        // Integração com Sentry ou outro serviço de monitoramento
        // Sentry.captureException(error, { contexts: { errorInfo } });
      }}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Sonner 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--foreground))',
              },
            }}
          />
          <BrowserRouter>
            <Routes>
              {/* Rota pública de login */}
              <Route 
                path="/login" 
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Login />
                  </Suspense>
                } 
              />
              
              {/* Rotas protegidas */}
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/agenda" element={<ProtectedRoute><AgendaPage /></ProtectedRoute>} />
              <Route path="/agenda/contatos" element={<ProtectedRoute><Contatos /></ProtectedRoute>} />
              <Route path="/agenda/aniversarios" element={<ProtectedRoute><Aniversarios /></ProtectedRoute>} />
              <Route path="/financeiro/conciliacao" element={<ProtectedRoute><ConciliacaoBancaria /></ProtectedRoute>} />
              <Route path="/financeiro/config" element={<ProtectedRoute><ConfigEmpresa /></ProtectedRoute>} />
              <Route path="/financeiro/recibo" element={<ProtectedRoute><EmissaoRecibo /></ProtectedRoute>} />
              <Route path="/financeiro/relatorios-viagem" element={<ProtectedRoute><RelatoriosViagem /></ProtectedRoute>} />
              <Route path="/financeiro/cobranca" element={<ProtectedRoute><Cobranca /></ProtectedRoute>} />
              <Route path="/financeiro/compras" element={<ProtectedRoute><SolicitacaoCompras /></ProtectedRoute>} />
              <Route path="/cartao/alimentacao" element={<ProtectedRoute><ValeAlimentacao /></ProtectedRoute>} />
              <Route path="/cartao/combustivel" element={<ProtectedRoute><ValeCombustivel /></ProtectedRoute>} />
              <Route path="/recados" element={<ProtectedRoute><Recados /></ProtectedRoute>} />
              <Route path="/tarefas" element={<ProtectedRoute><Tarefas /></ProtectedRoute>} />
              <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
              <Route path="/tripulacao" element={<ProtectedRoute><GestaoTripulacao /></ProtectedRoute>} />
              <Route path="/diario" element={<ProtectedRoute><DiarioAeronaves /></ProtectedRoute>} />
              <Route path="/diario/nova-aeronave" element={<ProtectedRoute><NovaAeronave /></ProtectedRoute>} />
              <Route path="/diario/detalhes/:matricula" element={<ProtectedRoute><DiarioDetalhes /></ProtectedRoute>} />
              <Route path="/diario/adicionar-voo/:matricula" element={<ProtectedRoute><AdicionarVoo /></ProtectedRoute>} />
              <Route path="/agendamento" element={<ProtectedRoute><AgendamentoVoo /></ProtectedRoute>} />
              <Route path="/coordenacao" element={<ProtectedRoute><CoordenacaoVoos /></ProtectedRoute>} />
              <Route path="/abastecimento" element={<ProtectedRoute><ControleAbastecimento /></ProtectedRoute>} />
<Route path="/documentos" element={<ProtectedRoute><Documentos /></ProtectedRoute>} />
<Route path="*" element={
                <Suspense fallback={<PageLoader />}>
                  <NotFound />
                </Suspense>
              } />
            </Routes>
          </BrowserRouter>
          
          {/* React Query DevTools apenas em desenvolvimento */}
          {process.env.NODE_ENV === 'development' && (
            <Suspense fallback={null}>
              <ReactQueryDevtools initialIsOpen={false} />
            </Suspense>
          )}
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
