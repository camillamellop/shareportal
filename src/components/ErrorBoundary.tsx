import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Bug, Home } from 'lucide-react';
import { toast } from 'sonner';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false);
  
  React.useEffect(() => {
    // Log error para serviços de monitoramento
    console.error('Application Error:', error);
    
    // Você pode integrar com Sentry aqui
    // Sentry.captureException(error);
    
    toast.error('Ocorreu um erro inesperado');
  }, [error]);
  
  const reloadPage = () => {
    window.location.reload();
  };
  
  const goHome = () => {
    window.location.href = '/';
  };
  
  const copyErrorToClipboard = () => {
    const errorInfo = `
Error: ${error.message}
Stack: ${error.stack}
Time: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
URL: ${window.location.href}
    `.trim();
    
    navigator.clipboard.writeText(errorInfo).then(() => {
      toast.success('Informações do erro copiadas para a área de transferência');
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Oops! Algo deu errado</CardTitle>
          <CardDescription>
            Ocorreu um erro inesperado na aplicação. Nossa equipe foi notificada automaticamente.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Error Message */}
          <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
            <h4 className="font-semibold text-destructive mb-2">Detalhes do Erro:</h4>
            <p className="text-sm text-muted-foreground font-mono">
              {error.message || 'Erro desconhecido'}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={resetErrorBoundary} 
              className="flex-1"
              variant="default"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
            
            <Button 
              onClick={reloadPage} 
              variant="outline" 
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recarregar Página
            </Button>
            
            <Button 
              onClick={goHome} 
              variant="outline" 
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Ir para Início
            </Button>
          </div>
          
          {/* Technical Details */}
          <div className="border-t pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="mb-2"
            >
              <Bug className="w-4 h-4 mr-2" />
              {showDetails ? 'Ocultar' : 'Mostrar'} Detalhes Técnicos
            </Button>
            
            {showDetails && (
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <h5 className="font-semibold mb-2">Stack Trace:</h5>
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap overflow-auto max-h-40">
                    {error.stack}
                  </pre>
                </div>
                
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <h5 className="font-semibold mb-2">Informações do Contexto:</h5>
                  <dl className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Timestamp:</dt>
                      <dd className="font-mono">{new Date().toISOString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">URL:</dt>
                      <dd className="font-mono truncate ml-4">{window.location.href}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">User Agent:</dt>
                      <dd className="font-mono text-xs truncate ml-4">{navigator.userAgent}</dd>
                    </div>
                  </dl>
                </div>
                
                <Button 
                  onClick={copyErrorToClipboard}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Copiar Informações para Suporte
                </Button>
              </div>
            )}
          </div>
          
          {/* Help Text */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Se o problema persistir, entre em contato com o suporte técnico 
              incluindo as informações técnicas acima.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export function ErrorBoundary({ 
  children, 
  fallback: Fallback = ErrorFallback,
  onError 
}: ErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log personalizado
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Callback personalizado
    onError?.(error, errorInfo);
    
    // Integração com serviços de monitoramento
    // Exemplo: Sentry.captureException(error, { contexts: { errorInfo } });
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={Fallback}
      onError={handleError}
      onReset={() => {
        // Limpar estado da aplicação se necessário
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

// Hook para uso programático
export function useErrorHandler() {
  return (error: Error) => {
    console.error('Manual error caught:', error);
    toast.error(`Erro: ${error.message}`);
    
    // Integração com serviços de monitoramento
    // Sentry.captureException(error);
  };
} 