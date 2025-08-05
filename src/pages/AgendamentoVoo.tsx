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
import { Plane, Send, Clock, MapPin, User, AlertCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { aeronaveService } from "@/services/firestore";
import { vooService } from "@/services/vooService";
import { SolicitacaoVoo, STATUS_VOO_CONFIG } from "@/types/voo";
import { useAuth } from "@/hooks/useAuth";

interface Aeronave {
  id: string;
  matricula: string;
  modelo: string;
  status: 'ativa' | 'manutencao' | 'inativa';
}

interface SolicitacaoForm {
  aeronave_id: string;
  data_voo_desejada: string;
  hora_partida_desejada: string;
  origem: string;
  destino: string;
  passageiros: number;
  observacoes: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
}

const COTISTAS = [
  "NOVA ALIANCA AGRO LTDA",
  "NOGUEIRA PARTICIPACOES E EMPREENDIMENTOS LTDA", 
  "GRF INCORPORADORA E CONSTRUTORA LTDA",
  "GA SERVICE - GESTAO ADMINISTRATIVA LTDA",
  "AGROCAM AGRICULTURA E PECUARIA CAMPONOVENSE LTDA"
];

export default function AgendamentoVoo() {
  const { user } = useAuth();
  const [aeronaves, setAeronaves] = useState<Aeronave[]>([]);
  const [minhasSolicitacoes, setMinhasSolicitacoes] = useState<SolicitacaoVoo[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<SolicitacaoForm>({
    aeronave_id: "",
    data_voo_desejada: "",
    hora_partida_desejada: "",
    origem: "",
    destino: "",
    passageiros: 1,
    observacoes: "",
    prioridade: "media"
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log("Carregando dados do agendamento...");
      
      // Carregar aeronaves
      const aeronavesData = await aeronaveService.getAll();
      console.log("Aeronaves carregadas:", aeronavesData.length);
      setAeronaves(aeronavesData.filter(a => a.status === 'ativa'));

      // Carregar minhas solicitações (simulando com cotista fixo por enquanto)
      const solicitacoes = await vooService.obterSolicitacoes({ 
        cotista: user?.email || 'cotista_demo' 
      });
      console.log("Solicitações carregadas:", solicitacoes.length);
      setMinhasSolicitacoes(solicitacoes);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.aeronave_id) newErrors.aeronave_id = "Selecione uma aeronave";
    if (!formData.data_voo_desejada) newErrors.data_voo_desejada = "Selecione a data do voo";
    if (!formData.hora_partida_desejada) newErrors.hora_partida_desejada = "Informe o horário de partida";
    if (!formData.origem) newErrors.origem = "Informe a origem";
    if (!formData.destino) newErrors.destino = "Informe o destino";
    if (formData.passageiros < 1) newErrors.passageiros = "Número de passageiros deve ser maior que 0";

    // Validar se a data é futura
    const dataVoo = new Date(formData.data_voo_desejada);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (dataVoo < hoje) {
      newErrors.data_voo_desejada = "A data do voo deve ser futura";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Por favor, corrija os campos destacados");
      return;
    }

    setSubmitting(true);

    try {
      const aeronave = aeronaves.find(a => a.id === formData.aeronave_id);
      const cotistaNome = COTISTAS[0]; // Por enquanto usar o primeiro cotista

      const solicitacao = {
        cotista_id: user?.email || 'cotista_demo',
        cotista_nome: cotistaNome,
        aeronave_id: formData.aeronave_id,
        aeronave_matricula: aeronave?.matricula || '',
        data_solicitacao: new Date().toISOString().split('T')[0],
        data_voo_desejada: formData.data_voo_desejada,
        hora_partida_desejada: formData.hora_partida_desejada,
        origem: formData.origem.toUpperCase(),
        destino: formData.destino.toUpperCase(),
        passageiros: formData.passageiros,
        observacoes: formData.observacoes,
        status: 'solicitado' as const,
        prioridade: formData.prioridade
      };

      await vooService.criarSolicitacao(solicitacao);
      
      toast.success("Solicitação de voo enviada com sucesso!");
      
      // Limpar formulário
      setFormData({
        aeronave_id: "",
        data_voo_desejada: "",
        hora_partida_desejada: "",
        origem: "",
        destino: "",
        passageiros: 1,
        observacoes: "",
        prioridade: "media"
      });

      // Recarregar solicitações
      loadData();

    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      toast.error("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setSubmitting(false);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Solicitação de Voos</h1>
            <p className="text-muted-foreground mt-2">
              Solicite seus voos e acompanhe o status das solicitações
            </p>
          </div>
        </div>

        <Tabs defaultValue="solicitar" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="solicitar">Nova Solicitação</TabsTrigger>
            <TabsTrigger value="historico">Minhas Solicitações</TabsTrigger>
          </TabsList>

          <TabsContent value="solicitar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Solicitar Novo Voo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="aeronave">Aeronave *</Label>
                      <Select 
                        value={formData.aeronave_id} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, aeronave_id: value }))}
                      >
                        <SelectTrigger className={errors.aeronave_id ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Selecione a aeronave" />
                        </SelectTrigger>
                        <SelectContent>
                          {aeronaves.map(aeronave => (
                            <SelectItem key={aeronave.id} value={aeronave.id}>
                              {aeronave.matricula} - {aeronave.modelo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.aeronave_id && (
                        <p className="text-red-500 text-sm flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.aeronave_id}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prioridade">Prioridade</Label>
                      <Select 
                        value={formData.prioridade} 
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, prioridade: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="urgente">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="data_voo">Data do Voo *</Label>
                      <Input
                        id="data_voo"
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.data_voo_desejada}
                        onChange={(e) => setFormData(prev => ({ ...prev, data_voo_desejada: e.target.value }))}
                        className={errors.data_voo_desejada ? 'border-red-500' : ''}
                      />
                      {errors.data_voo_desejada && (
                        <p className="text-red-500 text-sm flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.data_voo_desejada}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hora_partida">Horário de Partida *</Label>
                      <Input
                        id="hora_partida"
                        type="time"
                        value={formData.hora_partida_desejada}
                        onChange={(e) => setFormData(prev => ({ ...prev, hora_partida_desejada: e.target.value }))}
                        className={errors.hora_partida_desejada ? 'border-red-500' : ''}
                      />
                      {errors.hora_partida_desejada && (
                        <p className="text-red-500 text-sm flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.hora_partida_desejada}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="origem">Origem *</Label>
                      <Input
                        id="origem"
                        placeholder="Ex: CGR"
                        value={formData.origem}
                        onChange={(e) => setFormData(prev => ({ ...prev, origem: e.target.value }))}
                        className={errors.origem ? 'border-red-500' : ''}
                      />
                      {errors.origem && (
                        <p className="text-red-500 text-sm flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.origem}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="destino">Destino *</Label>
                      <Input
                        id="destino"
                        placeholder="Ex: CWB"
                        value={formData.destino}
                        onChange={(e) => setFormData(prev => ({ ...prev, destino: e.target.value }))}
                        className={errors.destino ? 'border-red-500' : ''}
                      />
                      {errors.destino && (
                        <p className="text-red-500 text-sm flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.destino}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="passageiros">Passageiros *</Label>
                      <Input
                        id="passageiros"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.passageiros}
                        onChange={(e) => setFormData(prev => ({ ...prev, passageiros: parseInt(e.target.value) || 1 }))}
                        className={errors.passageiros ? 'border-red-500' : ''}
                      />
                      {errors.passageiros && (
                        <p className="text-red-500 text-sm flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.passageiros}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      placeholder="Informações adicionais sobre o voo..."
                      value={formData.observacoes}
                      onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    <Send className="w-4 h-4 mr-2" />
                    {submitting ? "Enviando..." : "Solicitar Voo"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Minhas Solicitações</CardTitle>
              </CardHeader>
              <CardContent>
                {minhasSolicitacoes.length === 0 ? (
                  <div className="text-center py-8">
                    <Plane className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Nenhuma solicitação encontrada</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data Solicitação</TableHead>
                        <TableHead>Aeronave</TableHead>
                        <TableHead>Rota</TableHead>
                        <TableHead>Data Voo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Prioridade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {minhasSolicitacoes.map((solicitacao) => (
                        <TableRow key={solicitacao.id}>
                          <TableCell>{formatDate(solicitacao.data_solicitacao)}</TableCell>
                          <TableCell className="font-medium">{solicitacao.aeronave_matricula}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              {solicitacao.origem} → {solicitacao.destino}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {formatDate(solicitacao.data_voo_desejada)} às {solicitacao.hora_partida_desejada}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(solicitacao.status)}</TableCell>
                          <TableCell>
                            <Badge variant={solicitacao.prioridade === 'urgente' ? 'destructive' : 'secondary'}>
                              {solicitacao.prioridade}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}