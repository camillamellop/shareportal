import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Plane, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  AlertTriangle,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { vooService } from "@/services/vooService";
import { SolicitacaoVoo, PlanoVoo, STATUS_VOO_CONFIG } from "@/types/voo";

interface StatusVoosProps {
  userType?: 'cotista' | 'coordenador' | 'piloto';
}

export function StatusVoos({ userType = 'cotista' }: StatusVoosProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoVoo[]>([]);
  const [planosVoo, setPlanosVoo] = useState<PlanoVoo[]>([]);
  const [stats, setStats] = useState({
    pendentes: 0,
    programados: 0,
    hoje: 0,
    concluidos: 0
  });

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (userType === 'coordenador') {
        const dashboard = await vooService.obterDashboardCoordenador();
        setSolicitacoes(dashboard.solicitacoes);
        setPlanosVoo(dashboard.voos);
        setStats({
          pendentes: dashboard.solicitacoesPendentes,
          programados: dashboard.voosProgramados,
          hoje: dashboard.voosHoje,
          concluidos: 0
        });
      } else {
        // Para cotistas, mostrar apenas suas solicitações
        const minhasSolicitacoes = await vooService.obterSolicitacoes({
          cotista: 'demo_user' // TODO: usar ID real do usuário
        });
        setSolicitacoes(minhasSolicitacoes.slice(0, 5));
        
        setStats({
          pendentes: minhasSolicitacoes.filter(s => s.status === 'solicitado').length,
          programados: minhasSolicitacoes.filter(s => s.status === 'programado').length,
          hoje: 0,
          concluidos: minhasSolicitacoes.filter(s => s.status === 'concluido').length
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userType, loadData]);

  const getStatusBadge = (status: string) => {
    const config = STATUS_VOO_CONFIG[status];
    if (!config) return null;
    
    return (
      <Badge className={`${config.bgColor} ${config.color} text-xs`}>
        {config.icon} {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendentes}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Programados</p>
                <p className="text-2xl font-bold text-blue-600">{stats.programados}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hoje</p>
                <p className="text-2xl font-bold text-purple-600">{stats.hoje}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold text-green-600">{stats.concluidos}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Solicitações/Voos Recentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5" />
              {userType === 'coordenador' ? 'Solicitações Recentes' : 'Meus Voos'}
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(userType === 'coordenador' ? '/coordenacao' : '/agendamento')}
            >
              Ver Todos
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {solicitacoes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma solicitação encontrada</p>
              <Button 
                className="mt-4" 
                onClick={() => navigate('/agendamento')}
              >
                Solicitar Primeiro Voo
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {solicitacoes.map((solicitacao) => (
                <div 
                  key={solicitacao.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Plane className="h-4 w-4 text-primary" />
                        {solicitacao.aeronave_matricula}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {solicitacao.origem} → {solicitacao.destino}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(solicitacao.data_voo_desejada)}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {solicitacao.hora_partida_desejada}
                      </div>
                    </div>
                    
                    {getStatusBadge(solicitacao.status)}
                  </div>
                </div>
              ))}
              
              {planosVoo.length > 0 && (
                <>
                  <div className="border-t pt-3 mt-3">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Voos Programados
                    </h4>
                  </div>
                  {planosVoo.map((plano) => (
                    <div 
                      key={plano.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <User className="h-4 w-4 text-primary" />
                            {plano.piloto_designado}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {plano.origem} → {plano.destino}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDate(plano.data_voo)}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {plano.hora_partida}
                          </div>
                        </div>
                        
                        {getStatusBadge(plano.status)}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}