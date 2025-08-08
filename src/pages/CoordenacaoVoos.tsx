import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Bell, 
  Plane, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  MapPin,
  AlertTriangle,
  Plus,
  Eye
} from "lucide-react";
import { toast } from "sonner";
import { vooService } from "@/services/vooService";
import { SolicitacaoVoo, PlanoVoo, NotificacaoVoo, STATUS_VOO_CONFIG } from "@/types/voo";

const PILOTOS = [
  "RODRIGO DE MORAES TOSCANO",
  "WENDELL MUNIZ CANEDO", 
  "ROLFFE DE LIMA ERBE"
];

interface DashboardData {
  solicitacoesPendentes: number;
  voosProgramados: number;
  voosHoje: number;
  solicitacoes: SolicitacaoVoo[];
  voos: PlanoVoo[];
}

interface PlanoVooForm {
  solicitacao_id: string;
  data_voo: string;
  hora_partida: string;
  hora_chegada_estimada: string;
  origem: string;
  destino: string;
  piloto_designado: string;
  copiloto_designado: string;
  aeronave_id: string;
  combustivel_estimado: number;
  observacoes_coordenador: string;
}

export default function CoordenacaoVoos() {
  const [dashboard, setDashboard] = useState<DashboardData>({
    solicitacoesPendentes: 0,
    voosProgramados: 0,
    voosHoje: 0,
    solicitacoes: [],
    voos: []
  });
  const [notificacoes, setNotificacoes] = useState<NotificacaoVoo[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoVoo[]>([]);
  const [planosVoo, setPlanosVoo] = useState<PlanoVoo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SolicitacaoVoo | null>(null);
  const [showProgramarModal, setShowProgramarModal] = useState(false);

  const [planoForm, setPlanoForm] = useState<PlanoVooForm>({
    solicitacao_id: "",
    data_voo: "",
    hora_partida: "",
    hora_chegada_estimada: "",
    origem: "",
    destino: "",
    piloto_designado: "",
    copiloto_designado: "",
    aeronave_id: "",
    combustivel_estimado: 0,
    observacoes_coordenador: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [dashboardData, solicitacoesData, planosData, notificacoesData] = await Promise.all([
        vooService.obterDashboardCoordenador(),
        vooService.obterSolicitacoes(),
        vooService.obterPlanosVoo(),
        vooService.obterNotificacoes('coordenador_principal', 'coordenador')
      ]);

      setDashboard(dashboardData);
      setSolicitacoes(solicitacoesData);
      setPlanosVoo(planosData);
      setNotificacoes(notificacoesData);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleAprovarSolicitacao = async (id: string) => {
    try {
      await vooService.atualizarStatusSolicitacao(id, 'aprovado');
      toast.success("Solicitação aprovada!");
      loadData();
    } catch (error) {
      console.error("Erro ao aprovar:", error);
      toast.error("Erro ao aprovar solicitação");
    }
  };

  const handleRejeitarSolicitacao = async (id: string) => {
    try {
      await vooService.atualizarStatusSolicitacao(id, 'cancelado');
      toast.success("Solicitação rejeitada!");
      loadData();
    } catch (error) {
      console.error("Erro ao rejeitar:", error);
      toast.error("Erro ao rejeitar solicitação");
    }
  };

  const handleProgramarVoo = (solicitacao: SolicitacaoVoo) => {
    setSelectedSolicitacao(solicitacao);
    setPlanoForm({
      solicitacao_id: solicitacao.id,
      data_voo: solicitacao.data_voo_desejada,
      hora_partida: solicitacao.hora_partida_desejada,
      hora_chegada_estimada: "",
      origem: solicitacao.origem,
      destino: solicitacao.destino,
      piloto_designado: "",
      copiloto_designado: "",
      aeronave_id: solicitacao.aeronave_id,
      combustivel_estimado: 0,
      observacoes_coordenador: ""
    });
    setShowProgramarModal(true);
  };

  const handleSubmitPlano = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const plano = {
        ...planoForm,
        status: 'programado' as const
      };

      await vooService.criarPlanoVoo(plano);
      toast.success("Voo programado com sucesso!");
      
      setShowProgramarModal(false);
      setSelectedSolicitacao(null);
      loadData();

    } catch (error) {
      console.error("Erro ao programar voo:", error);
      toast.error("Erro ao programar voo");
    }
  };

  const handleAtualizarStatusPlano = async (id: string, status: PlanoVoo['status']) => {
    try {
      await vooService.atualizarStatusPlano(id, status);
      toast.success(`Status atualizado para ${status}`);
      loadData();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_VOO_CONFIG[status];
    if (!config) return null;
    
    return (
      <Badge className={`${config.bgColor} ${config.color}`}>
        {config.icon} {config.label}
      </Badge>
    );
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const colors = {
      baixa: 'bg-gray-100 text-gray-800',
      media: 'bg-blue-100 text-blue-800',
      alta: 'bg-orange-100 text-orange-800',
      urgente: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={colors[prioridade as keyof typeof colors] || colors.media}>
        {prioridade}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Coordenação de Voos</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie solicitações e programe voos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              {notificacoes.filter(n => !n.lida).length} não lidas
            </Button>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Solicitações Pendentes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.solicitacoesPendentes}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando aprovação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voos Programados</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.voosProgramados}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando execução
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voos Hoje</CardTitle>
              <Plane className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.voosHoje}</div>
              <p className="text-xs text-muted-foreground">
                Programados para hoje
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="solicitacoes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="solicitacoes">Solicitações</TabsTrigger>
            <TabsTrigger value="programacao">Programação</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="solicitacoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Solicitações Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cotista</TableHead>
                      <TableHead>Aeronave</TableHead>
                      <TableHead>Rota</TableHead>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {solicitacoes.filter(s => s.status === 'solicitado').map((solicitacao) => (
                      <TableRow key={solicitacao.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {solicitacao.cotista_nome}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {solicitacao.aeronave_matricula}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {solicitacao.origem} → {solicitacao.destino}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {formatDate(solicitacao.data_voo_desejada)} {solicitacao.hora_partida_desejada}
                          </div>
                        </TableCell>
                        <TableCell>{getPrioridadeBadge(solicitacao.prioridade)}</TableCell>
                        <TableCell>{getStatusBadge(solicitacao.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAprovarSolicitacao(solicitacao.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleProgramarVoo(solicitacao)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Programar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejeitarSolicitacao(solicitacao.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="programacao" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Voos Programados</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Rota</TableHead>
                      <TableHead>Piloto</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {planosVoo.filter(p => p.status !== 'concluido').map((plano) => (
                      <TableRow key={plano.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {formatDate(plano.data_voo)} {plano.hora_partida}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {plano.origem} → {plano.destino}
                          </div>
                        </TableCell>
                        <TableCell>{plano.piloto_designado}</TableCell>
                        <TableCell>{getStatusBadge(plano.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {plano.status === 'programado' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAtualizarStatusPlano(plano.id, 'em_andamento')}
                              >
                                Iniciar
                              </Button>
                            )}
                            {plano.status === 'em_andamento' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => navigate(`/diario/adicionar-voo/${plano.aeronave_id}?plano_id=${plano.id}`)}
                                >
                                  Registrar no Diário
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAtualizarStatusPlano(plano.id, 'concluido')}
                                >
                                  Finalizar
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Voos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Rota</TableHead>
                      <TableHead>Piloto</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {planosVoo.filter(p => p.status === 'concluido').map((plano) => (
                      <TableRow key={plano.id}>
                        <TableCell>{formatDate(plano.data_voo)}</TableCell>
                        <TableCell>{plano.origem} → {plano.destino}</TableCell>
                        <TableCell>{plano.piloto_designado}</TableCell>
                        <TableCell>{getStatusBadge(plano.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal Programar Voo */}
        <Dialog open={showProgramarModal} onOpenChange={setShowProgramarModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Programar Voo</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmitPlano} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data do Voo</Label>
                  <Input
                    type="date"
                    value={planoForm.data_voo}
                    onChange={(e) => setPlanoForm(prev => ({ ...prev, data_voo: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hora de Partida</Label>
                  <Input
                    type="time"
                    value={planoForm.hora_partida}
                    onChange={(e) => setPlanoForm(prev => ({ ...prev, hora_partida: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Piloto</Label>
                  <Select
                    value={planoForm.piloto_designado}
                    onValueChange={(value) => setPlanoForm(prev => ({ ...prev, piloto_designado: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o piloto" />
                    </SelectTrigger>
                    <SelectContent>
                      {PILOTOS.map(piloto => (
                        <SelectItem key={piloto} value={piloto}>{piloto}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Copiloto (opcional)</Label>
                  <Select
                    value={planoForm.copiloto_designado}
                    onValueChange={(value) => setPlanoForm(prev => ({ ...prev, copiloto_designado: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o copiloto" />
                    </SelectTrigger>
                    <SelectContent>
                                              <SelectItem value="nenhum">Nenhum</SelectItem>
                      {PILOTOS.map(piloto => (
                        <SelectItem key={piloto} value={piloto}>{piloto}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observações do Coordenador</Label>
                <Textarea
                  value={planoForm.observacoes_coordenador}
                  onChange={(e) => setPlanoForm(prev => ({ ...prev, observacoes_coordenador: e.target.value }))}
                  placeholder="Instruções especiais, observações sobre o voo..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowProgramarModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Confirmar Programação
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}