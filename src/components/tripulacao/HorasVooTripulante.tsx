import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Clock, 
  Plus, 
  Search,
  Calendar,
  Calculator
} from "lucide-react";
import { toast } from "sonner";
import { horasVooTripulanteService, HorasVooTripulante as HorasVooTripulanteType, ResumoHorasTripulante } from "@/services/horasVooTripulanteService";
import { tripulacaoService, Tripulante } from "@/services/tripulacaoService";
import "@/utils/seedHorasVooTripulante";

interface HorasVooTripulanteProps {
  tripulanteFiltrado?: string;
}

export function HorasVooTripulante({ tripulanteFiltrado }: HorasVooTripulanteProps) {
  const [resumos, setResumos] = useState<ResumoHorasTripulante[]>([]);
  const [tripulantes, setTripulantes] = useState<Tripulante[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMes, setSelectedMes] = useState<string>("");
  const [showModal, setShowModal] = useState(false);

  // Formulário simplificado
  const [form, setForm] = useState({
    tripulante_nome: tripulanteFiltrado || "",
    aeronave_matricula: "",
    horas_formatadas: "",
    observacoes: ""
  });

  const mesesDisponiveis = horasVooTripulanteService.obterMesesDisponiveis();
  const isModalMode = !!tripulanteFiltrado;

  useEffect(() => {
    loadData();
  }, [selectedMes]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tripulantesData] = await Promise.all([
        tripulacaoService.buscarTripulantes()
      ]);
      
      setTripulantes(tripulantesData);
      
      if (selectedMes) {
        const resumosData = await horasVooTripulanteService.obterResumoPorMes(selectedMes);
        // Se há um tripulante filtrado, filtrar apenas ele
        const filteredData = tripulanteFiltrado 
          ? resumosData.filter(resumo => resumo.tripulante_nome === tripulanteFiltrado)
          : resumosData;
        setResumos(filteredData);
      } else {
        setResumos([]);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados de horas de voo");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.tripulante_nome || !form.aeronave_matricula || !form.horas_formatadas || !selectedMes) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const horasDecimais = horasVooTripulanteService.converterParaHorasDecimais(form.horas_formatadas);
      
      // Extrair ano e mês do nome do mês selecionado
      const match = selectedMes.match(/(\w+)\s+(\d{4})/);
      if (!match) {
        toast.error("Mês inválido");
        return;
      }
      
      const mesNomeStr = match[1];
      const ano = parseInt(match[2]);
      const meses = [
        'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
        'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
      ];
      const mesIndex = meses.indexOf(mesNomeStr);
      const mes = (mesIndex + 1).toString().padStart(2, '0');
      
      await horasVooTripulanteService.criarRegistro({
        tripulante_nome: form.tripulante_nome,
        aeronave_matricula: form.aeronave_matricula,
        mes: `${ano}-${mes}`,
        ano,
        mes_nome: selectedMes,
        horas_voadas: horasDecimais,
        horas_formatadas: form.horas_formatadas,
        observacoes: form.observacoes
      });
      
      toast.success("Registro criado com sucesso!");
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Erro ao salvar registro:", error);
      toast.error("Erro ao salvar registro");
    }
  };

  const resetForm = () => {
    setForm({
      tripulante_nome: tripulanteFiltrado || "",
      aeronave_matricula: "",
      horas_formatadas: "",
      observacoes: ""
    });
  };

  const openNewModal = () => {
    if (!selectedMes) {
      toast.error("Selecione um mês primeiro");
      return;
    }
    resetForm();
    setShowModal(true);
  };

  const handleMesChange = (mesNome: string) => {
    setSelectedMes(mesNome);
  };

  const filteredResumos = resumos.filter(resumo =>
    resumo.tripulante_nome.toLowerCase().includes(searchTerm.toLowerCase())
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
      {/* Header - apenas se não for modal */}
      {!isModalMode && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Controle de Horas por Tripulante</h2>
            <p className="text-muted-foreground mt-1">
              Insira as horas voadas e visualize os totais por mês
            </p>
          </div>
          <Button onClick={openNewModal} disabled={!selectedMes}>
            <Plus className="h-4 w-4 mr-2" />
            Inserir Horas
          </Button>
        </div>
      )}

      {/* Seleção de Mês */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Selecionar Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedMes} onValueChange={handleMesChange}>
              <SelectTrigger className="w-full sm:w-80">
                <SelectValue placeholder="Escolha o mês para inserir/visualizar horas" />
              </SelectTrigger>
              <SelectContent>
                {mesesDisponiveis.map(mes => (
                  <SelectItem key={mes} value={mes}>
                    {mes}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isModalMode && (
              <Button onClick={openNewModal} disabled={!selectedMes}>
                <Plus className="h-4 w-4 mr-2" />
                Inserir Horas
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Conferência */}
      {selectedMes && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                {isModalMode 
                  ? `Horas de ${tripulanteFiltrado} - ${selectedMes}`
                  : `Conferência - ${selectedMes}`
                }
              </CardTitle>
              {!isModalMode && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar tripulante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {filteredResumos.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {!isModalMode && <TableHead className="font-bold">Tripulante</TableHead>}
                      <TableHead className="font-bold text-center">Total Horas</TableHead>
                      <TableHead className="font-bold">Detalhamento por Aeronave</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResumos.map((resumo) => (
                      <TableRow key={resumo.tripulante_nome}>
                        {!isModalMode && (
                          <TableCell className="font-medium text-lg">
                            {resumo.tripulante_nome}
                          </TableCell>
                        )}
                        <TableCell className="font-bold text-green-600 text-center text-lg">
                          {resumo.total_horas_formatadas}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {resumo.aeronaves.map((aeronave, index) => (
                              <div key={index} className="text-sm flex justify-between">
                                <span className="font-medium">{aeronave.matricula}</span>
                                <span className="text-green-600 font-semibold">{aeronave.horas_formatadas}</span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Nenhum registro encontrado</p>
                <p className="text-sm">Clique em "Inserir Horas" para adicionar o primeiro registro</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal de Inserção */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md sm:max-w-lg w-full mx-4">
          <DialogHeader>
            <DialogTitle>
              Inserir Horas Voadas - {selectedMes}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tripulante_nome">Tripulante *</Label>
                {isModalMode ? (
                  <Input
                    id="tripulante_nome"
                    value={form.tripulante_nome}
                    disabled
                    className="bg-muted"
                  />
                ) : (
                  <Select 
                    value={form.tripulante_nome} 
                    onValueChange={(value) => setForm(prev => ({ ...prev, tripulante_nome: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tripulante" />
                    </SelectTrigger>
                    <SelectContent>
                      {tripulantes.map(tripulante => (
                        <SelectItem key={tripulante.id} value={tripulante.nome}>
                          {tripulante.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="aeronave_matricula">Aeronave *</Label>
                <Input
                  id="aeronave_matricula"
                  value={form.aeronave_matricula}
                  onChange={(e) => setForm(prev => ({ ...prev, aeronave_matricula: e.target.value }))}
                  placeholder="Ex: MDL"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="horas_formatadas">Horas Voadas *</Label>
              <Input
                id="horas_formatadas"
                value={form.horas_formatadas}
                onChange={(e) => setForm(prev => ({ ...prev, horas_formatadas: e.target.value }))}
                placeholder="Ex: 02:47h"
                required
              />
              <p className="text-xs text-muted-foreground">
                Formato: HH:MMh (ex: 02:47h para 2 horas e 47 minutos)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                value={form.observacoes}
                onChange={(e) => setForm(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações adicionais..."
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="w-full sm:w-auto"
              >
                Salvar Horas
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
