import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, 
  Plane, 
  Users, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  TrendingUp,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { horasVooService, HorasVoo, ResumoHorasVoo } from "@/services/horasVooService";
import { tripulacaoService, Tripulante } from "@/services/tripulacaoService";

export function GestaoHorasVoo() {
  const [resumos, setResumos] = useState<ResumoHorasVoo[]>([]);
  const [horasDetalhadas, setHorasDetalhadas] = useState<HorasVoo[]>([]);
  const [tripulantes, setTripulantes] = useState<Tripulante[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTripulante, setSelectedTripulante] = useState<string>("");
  const [showRegistroModal, setShowRegistroModal] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [selectedHoras, setSelectedHoras] = useState<HorasVoo | null>(null);

  // Formulário para novo registro
  const [registroForm, setRegistroForm] = useState({
    tripulante_id: "",
    data_voo: "",
    hora_partida: "",
    hora_chegada: "",
    origem: "",
    destino: "",
    aeronave_matricula: "",
    tipo_voo: "comercial" as const,
    observacoes: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resumosData, horasData, tripulantesData] = await Promise.all([
        horasVooService.obterResumoHorasVoo(),
        horasVooService.obterHorasVoo(),
        tripulacaoService.buscarTripulantes()
      ]);
      
      setResumos(resumosData);
      setHorasDetalhadas(horasData);
      setTripulantes(tripulantesData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados de horas de voo");
    } finally {
      setLoading(false);
    }
  };

  const handleRegistroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registroForm.tripulante_id || !registroForm.data_voo || !registroForm.hora_partida || !registroForm.hora_chegada) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const tripulante = tripulantes.find(t => t.id === registroForm.tripulante_id);
      if (!tripulante) {
        toast.error("Tripulante não encontrado");
        return;
      }

      // Calcular horas voadas
      const partida = new Date(`2000-01-01T${registroForm.hora_partida}`);
      const chegada = new Date(`2000-01-01T${registroForm.hora_chegada}`);
      const horasVoadas = (chegada.getTime() - partida.getTime()) / (1000 * 60 * 60);

      if (horasVoadas <= 0) {
        toast.error("Hora de chegada deve ser posterior à hora de partida");
        return;
      }

      await horasVooService.criarRegistroHoras({
        tripulante_id: registroForm.tripulante_id,
        tripulante_nome: tripulante.nome,
        cargo: tripulante.cargo,
        data_voo: registroForm.data_voo,
        hora_partida: registroForm.hora_partida,
        hora_chegada: registroForm.hora_chegada,
        horas_voadas: horasVoadas,
        origem: registroForm.origem,
        destino: registroForm.destino,
        aeronave_matricula: registroForm.aeronave_matricula,
        tipo_voo: registroForm.tipo_voo,
        observacoes: registroForm.observacoes,
        status: 'pendente'
      });

      toast.success("Registro de horas criado com sucesso!");
      setShowRegistroModal(false);
      setRegistroForm({
        tripulante_id: "",
        data_voo: "",
        hora_partida: "",
        hora_chegada: "",
        origem: "",
        destino: "",
        aeronave_matricula: "",
        tipo_voo: "comercial",
        observacoes: ""
      });
      loadData();
    } catch (error) {
      console.error("Erro ao criar registro:", error);
      toast.error("Erro ao criar registro de horas");
    }
  };

  const handleAprovarHoras = async (id: string) => {
    try {
      await horasVooService.aprovarHoras(id, "Sistema");
      toast.success("Horas aprovadas com sucesso!");
      loadData();
    } catch (error) {
      console.error("Erro ao aprovar horas:", error);
      toast.error("Erro ao aprovar horas");
    }
  };

  const handleRejeitarHoras = async (id: string, motivo: string) => {
    try {
      await horasVooService.rejeitarHoras(id, motivo);
      toast.success("Horas rejeitadas");
      loadData();
    } catch (error) {
      console.error("Erro ao rejeitar horas:", error);
      toast.error("Erro ao rejeitar horas");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'rejeitado':
        return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const filteredResumos = resumos.filter(resumo =>
    resumo.tripulante_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resumo.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHoras = horasDetalhadas.filter(hora =>
    (selectedTripulante === "todos" || !selectedTripulante || hora.tripulante_id === selectedTripulante) &&
    (hora.tripulante_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
     hora.origem.toLowerCase().includes(searchTerm.toLowerCase()) ||
     hora.destino.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground font-medium">Carregando horas de voo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestão de Horas de Voo</h2>
          <p className="text-muted-foreground mt-1">
            Controle e acompanhe as horas de voo dos tripulantes
          </p>
        </div>
        <Button onClick={() => setShowRegistroModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Registro
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {resumos.reduce((sum, r) => sum + r.total_horas, 0).toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">Total de Horas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{resumos.length}</p>
                <p className="text-sm text-muted-foreground">Tripulantes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {resumos.reduce((sum, r) => sum + r.horas_mes_atual, 0).toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">Horas do Mês</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Plane className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {horasDetalhadas.filter(h => h.status === 'pendente').length}
                </p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="resumo" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="resumo">Resumo por Tripulante</TabsTrigger>
          <TabsTrigger value="detalhado">Registros Detalhados</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Resumo de Horas por Tripulante</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar tripulante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tripulante</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Total Horas</TableHead>
                      <TableHead>Mês Atual</TableHead>
                      <TableHead>Ano Atual</TableHead>
                      <TableHead>Último Voo</TableHead>
                      <TableHead>Voos</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResumos.map((resumo) => (
                      <TableRow key={resumo.tripulante_id}>
                        <TableCell className="font-medium">{resumo.tripulante_nome}</TableCell>
                        <TableCell>{resumo.cargo}</TableCell>
                        <TableCell className="font-semibold">{resumo.total_horas.toFixed(1)}h</TableCell>
                        <TableCell>{resumo.horas_mes_atual.toFixed(1)}h</TableCell>
                        <TableCell>{resumo.horas_ano_atual.toFixed(1)}h</TableCell>
                        <TableCell>{resumo.ultimo_voo ? formatDate(resumo.ultimo_voo) : '-'}</TableCell>
                        <TableCell>{resumo.voos_realizados}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTripulante(resumo.tripulante_id);
                              setShowDetalhesModal(true);
                            }}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detalhado" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Registros Detalhados</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={selectedTripulante} onValueChange={setSelectedTripulante}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filtrar por tripulante" />
                    </SelectTrigger>
                                         <SelectContent>
                       <SelectItem value="todos">Todos os tripulantes</SelectItem>
                       {tripulantes.map(tripulante => (
                         <SelectItem key={tripulante.id} value={tripulante.id}>
                           {tripulante.nome}
                         </SelectItem>
                       ))}
                     </SelectContent>
                  </Select>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tripulante</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead>Destino</TableHead>
                      <TableHead>Horas</TableHead>
                      <TableHead>Aeronave</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHoras.map((hora) => (
                      <TableRow key={hora.id}>
                        <TableCell>{formatDate(hora.data_voo)}</TableCell>
                        <TableCell className="font-medium">{hora.tripulante_nome}</TableCell>
                        <TableCell>{hora.origem}</TableCell>
                        <TableCell>{hora.destino}</TableCell>
                        <TableCell className="font-semibold">{hora.horas_voadas.toFixed(1)}h</TableCell>
                        <TableCell>{hora.aeronave_matricula}</TableCell>
                        <TableCell>{getStatusBadge(hora.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {hora.status === 'pendente' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAprovarHoras(hora.id)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRejeitarHoras(hora.id, 'Rejeitado pelo sistema')}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedHoras(hora)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Novo Registro */}
      <Dialog open={showRegistroModal} onOpenChange={setShowRegistroModal}>
        <DialogContent className="max-w-md sm:max-w-lg md:max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Registro de Horas</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRegistroSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tripulante_id">Tripulante *</Label>
                <Select 
                  value={registroForm.tripulante_id} 
                  onValueChange={(value) => setRegistroForm(prev => ({ ...prev, tripulante_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tripulante" />
                  </SelectTrigger>
                  <SelectContent>
                    {tripulantes.map(tripulante => (
                      <SelectItem key={tripulante.id} value={tripulante.id}>
                        {tripulante.nome} - {tripulante.cargo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_voo">Data do Voo *</Label>
                <Input
                  id="data_voo"
                  type="date"
                  value={registroForm.data_voo}
                  onChange={(e) => setRegistroForm(prev => ({ ...prev, data_voo: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hora_partida">Hora de Partida *</Label>
                <Input
                  id="hora_partida"
                  type="time"
                  value={registroForm.hora_partida}
                  onChange={(e) => setRegistroForm(prev => ({ ...prev, hora_partida: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hora_chegada">Hora de Chegada *</Label>
                <Input
                  id="hora_chegada"
                  type="time"
                  value={registroForm.hora_chegada}
                  onChange={(e) => setRegistroForm(prev => ({ ...prev, hora_chegada: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origem">Origem</Label>
                <Input
                  id="origem"
                  value={registroForm.origem}
                  onChange={(e) => setRegistroForm(prev => ({ ...prev, origem: e.target.value }))}
                  placeholder="Aeroporto de origem"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destino">Destino</Label>
                <Input
                  id="destino"
                  value={registroForm.destino}
                  onChange={(e) => setRegistroForm(prev => ({ ...prev, destino: e.target.value }))}
                  placeholder="Aeroporto de destino"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aeronave_matricula">Matrícula da Aeronave</Label>
                <Input
                  id="aeronave_matricula"
                  value={registroForm.aeronave_matricula}
                  onChange={(e) => setRegistroForm(prev => ({ ...prev, aeronave_matricula: e.target.value }))}
                  placeholder="Ex: PR-MDL"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo_voo">Tipo de Voo</Label>
                <Select 
                  value={registroForm.tipo_voo} 
                  onValueChange={(value: any) => setRegistroForm(prev => ({ ...prev, tipo_voo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comercial">Comercial</SelectItem>
                    <SelectItem value="treinamento">Treinamento</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={registroForm.observacoes}
                onChange={(e) => setRegistroForm(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações adicionais..."
                rows={3}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowRegistroModal(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="w-full sm:w-auto"
              >
                Criar Registro
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes */}
      <Dialog open={showDetalhesModal} onOpenChange={setShowDetalhesModal}>
        <DialogContent className="max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes de Horas de Voo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTripulante && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Partida</TableHead>
                      <TableHead>Chegada</TableHead>
                      <TableHead>Horas</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead>Destino</TableHead>
                      <TableHead>Aeronave</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {horasDetalhadas
                      .filter(h => h.tripulante_id === selectedTripulante)
                      .map((hora) => (
                        <TableRow key={hora.id}>
                          <TableCell>{formatDate(hora.data_voo)}</TableCell>
                          <TableCell>{formatTime(hora.hora_partida)}</TableCell>
                          <TableCell>{formatTime(hora.hora_chegada)}</TableCell>
                          <TableCell className="font-semibold">{hora.horas_voadas.toFixed(1)}h</TableCell>
                          <TableCell>{hora.origem}</TableCell>
                          <TableCell>{hora.destino}</TableCell>
                          <TableCell>{hora.aeronave_matricula}</TableCell>
                          <TableCell>{getStatusBadge(hora.status)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
