<<<<<<< HEAD
import { useState, useEffect, useCallback } from "react";
=======
import { useState, useEffect } from "react";
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, X, CheckCircle } from "lucide-react";
import { vooService } from "@/services/vooService";
import { NotificacaoVoo } from "@/types/voo";
import { toast } from "sonner";

interface NotificacaoVoosProps {
  userId: string;
  userType: 'coordenador' | 'cotista' | 'piloto';
}

export function NotificacaoVoos({ userId, userType }: NotificacaoVoosProps) {
  const [notificacoes, setNotificacoes] = useState<NotificacaoVoo[]>([]);
  const [showNotificacoes, setShowNotificacoes] = useState(false);
  const [loading, setLoading] = useState(false);

<<<<<<< HEAD
  const loadNotificacoes = useCallback(async () => {
=======
  const loadNotificacoes = async () => {
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
    try {
      setLoading(true);
      // Temporariamente desabilitado devido a erro de índice
      // const notifs = await vooService.obterNotificacoes(userId, userType);
      // setNotificacoes(notifs);
      setNotificacoes([]); // Lista vazia temporariamente
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    } finally {
      setLoading(false);
    }
<<<<<<< HEAD
  }, [userId, userType]);
=======
  };
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524

  useEffect(() => {
    loadNotificacoes();
    
    // Polling para novas notificações a cada 30 segundos
    const interval = setInterval(loadNotificacoes, 30000);
    
    return () => clearInterval(interval);
<<<<<<< HEAD
  }, [loadNotificacoes]);
=======
  }, [userId, userType, loadNotificacoes]);
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524

  const handleMarcarComoLida = async (id: string) => {
    try {
      await vooService.marcarNotificacaoComoLida(id);
      setNotificacoes(prev => 
        prev.map(n => n.id === id ? { ...n, lida: true } : n)
      );
      toast.success("Notificação marcada como lida");
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
      toast.error("Erro ao marcar notificação como lida");
    }
  };

  const notificacaoNaoLidas = notificacoes.filter(n => !n.lida);
  
  const getNotificacaoIcon = (tipo: string) => {
    switch (tipo) {
      case 'solicitacao_nova':
        return '📝';
      case 'voo_programado':
        return '📅';
      case 'voo_cancelado':
        return '❌';
      case 'voo_concluido':
        return '✅';
      default:
        return '📢';
    }
  };

  const formatTimeAgo = (timestamp: Date | string | { toDate: () => Date }) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const notifTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now.getTime() - notifTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return `${diffDays}d atrás`;
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowNotificacoes(!showNotificacoes)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {notificacaoNaoLidas.length > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs"
          >
            {notificacaoNaoLidas.length}
          </Badge>
        )}
      </Button>

      {showNotificacoes && (
        <Card className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Notificações</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotificacoes(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : notificacoes.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Nenhuma notificação
              </div>
            ) : (
              notificacoes.slice(0, 10).map((notificacao) => (
                <div
                  key={notificacao.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    notificacao.lida 
                      ? 'bg-muted/50 border-muted' 
                      : 'bg-primary/5 border-primary/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {getNotificacaoIcon(notificacao.tipo)}
                        </span>
                        <h4 className="font-medium text-sm">
                          {notificacao.titulo}
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {notificacao.mensagem}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(notificacao.createdAt)}
                        </span>
                        {!notificacao.lida && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarcarComoLida(notificacao.id)}
                            className="h-6 px-2 text-xs"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Marcar como lida
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}