import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plane, Plus, Calendar, Clock, Award, ArrowLeft, FileText, Users, Settings, PlusCircle, ChevronLeft, ChevronRight, Filter, Fuel } from "lucide-react";
import { toast } from "sonner";
import { aeronaveService, aeronaveServiceSpecific, vooServiceSpecific } from "@/services/firestore";

interface Voo {
  id: string;
  data: string;
  hora_partida: string;
  hora_chegada: string;
  origem: string;
  destino: string;
  piloto: string;
  copiloto?: string;
  cotista: string;
  horas_voo: number;
  combustivel_inicial: number;
  combustivel_final: number;
  observacoes?: string;
  pic_anac?: string;
  sic_anac?: string;
  voo_para?: string;
  confere?: string;
  aeronave_id: string;
  createdAt: any;
  updatedAt: any;
}

interface Aeronave {
  id: string;
  matricula: string;
  modelo: string;
  ano_diario: number;
  horas_totais: number;
  status: "ativa" | "inativa" | "manutencao";
  consumo_medio?: string;
  createdAt: any;
  updatedAt: any;
}

interface MesAno {
  mes: number;
  ano: number;
}

export default function DiarioDetalhes() {
  const { matricula } = useParams();
  const navigate = useNavigate();
  const [aeronave, setAeronave] = useState<Aeronave | null>(null);
  const [voos, setVoos] = useState<Voo[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado para navegação mensal
  const [mesAtual, setMesAtual] = useState<MesAno>({
    mes: new Date().getMonth() + 1, // Janeiro = 1
    ano: new Date().getFullYear()
  });

  // Carregar dados da aeronave e voos
  useEffect(() => {
    const loadData = async () => {
      if (!matricula) return;

      try {
        setLoading(true);
        console.log("Buscando aeronave com matrícula:", matricula);
        
        // Primeiro, buscar todas as aeronaves
        const todasAeronaves = await aeronaveService.getAll();
        console.log("Todas as aeronaves:", todasAeronaves);
        
        // Encontrar a aeronave pela matrícula
        const aeronaveData = todasAeronaves.find(a => a.matricula === matricula);
        console.log("Aeronave encontrada:", aeronaveData);
        
        if (!aeronaveData) {
          console.log("Aeronave não encontrada na lista");
          toast.error("Aeronave não encontrada");
          navigate("/diario");
          return;
        }
        setAeronave(aeronaveData);

        // Carregar voos da aeronave
        console.log("Buscando voos para aeronave ID:", aeronaveData.id);
        const voosData = await vooServiceSpecific.getByAeronave(aeronaveData.id);
        console.log("Voos encontrados:", voosData);
        
        // Se não há voos, tentar buscar todos os voos para debug
        if (voosData.length === 0) {
          console.log("Nenhum voo encontrado, buscando todos os voos...");
          const todosVoos = await vooService.getAll();
          console.log("Todos os voos:", todosVoos);
        }
        
        setVoos(voosData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados do diário");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [matricula, navigate]);

  // Função para obter nome do mês
  const getNomeMes = (mes: number) => {
    const meses = [
      "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
      "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
    ];
    return meses[mes - 1];
  };

  // Função para navegar para o mês anterior
  const mesAnterior = () => {
    setMesAtual(prev => {
      if (prev.mes === 1) {
        return { mes: 12, ano: prev.ano - 1 };
      } else {
        return { mes: prev.mes - 1, ano: prev.ano };
      }
    });
  };

  // Função para navegar para o próximo mês
  const proximoMes = () => {
    setMesAtual(prev => {
      if (prev.mes === 12) {
        return { mes: 1, ano: prev.ano + 1 };
      } else {
        return { mes: prev.mes + 1, ano: prev.ano };
      }
    });
  };

  // Função para ir para mês específico
  const irParaMes = (mes: number, ano: number) => {
    setMesAtual({ mes, ano });
  };

  // Filtrar voos do mês atual
  const voosDoMes = voos.filter(voo => {
    const dataVoo = new Date(voo.data);
    return dataVoo.getMonth() + 1 === mesAtual.mes && dataVoo.getFullYear() === mesAtual.ano;
  });

  // Calcular estatísticas do mês
  const totalHorasMes = voosDoMes.reduce((sum, voo) => sum + voo.horas_voo, 0);
  const totalPousosMes = voosDoMes.length;
  const totalCombustivelMes = voosDoMes.reduce((sum, voo) => sum + voo.combustivel_inicial, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativa": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "inativa": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "manutencao": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const handleAddVoo = () => {
    navigate(`/diario/adicionar-voo/${matricula}`);
  };

  // Calcular estatísticas gerais
  const totalHoras = voos.reduce((sum, voo) => sum + voo.horas_voo, 0);
  const pilotosUnicos = new Set(voos.map(voo => voo.pic_anac)).size;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-slate-300">Carregando diário de bordo...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!aeronave) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <Plane className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">Aeronave não encontrada</p>
              <Button 
                onClick={() => navigate("/diario")}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Voltar ao Diário
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/diario")}
                className="text-slate-400 hover:text-white hover:bg-slate-800/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Diário de Bordo - {aeronave.matricula}
                </h1>
                <p className="text-slate-400">
                  {aeronave.modelo} • Ano {aeronave.ano_diario}
                </p>
              </div>
            </div>
            <Button
              onClick={handleAddVoo}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Voo
            </Button>
          </div>

          {/* Navegação Mensal */}
          <Card className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                DIÁRIO {getNomeMes(mesAtual.mes)} {mesAtual.ano} {aeronave.matricula}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={mesAnterior}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Mês Anterior
                </Button>
                
                <div className="flex items-center space-x-4">
                  <Select 
                    value={`${mesAtual.mes}`} 
                    onValueChange={(value) => irParaMes(parseInt(value), mesAtual.ano)}
                  >
                    <SelectTrigger className="w-32 bg-slate-700/50 border-slate-600/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={`${i + 1}`} className="hover:bg-slate-700">
                          {getNomeMes(i + 1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={`${mesAtual.ano}`} 
                    onValueChange={(value) => irParaMes(mesAtual.mes, parseInt(value))}
                  >
                    <SelectTrigger className="w-24 bg-slate-700/50 border-slate-600/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {Array.from({ length: 5 }, (_, i) => {
                        const ano = 2023 + i;
                        return (
                          <SelectItem key={ano} value={`${ano}`} className="hover:bg-slate-700">
                            {ano}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  onClick={proximoMes}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                >
                  Próximo Mês
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Informações da Aeronave */}
          <Card className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <Plane className="w-5 h-5 mr-2 text-blue-400" />
                  Informações da Aeronave
                </CardTitle>
                <Badge className={getStatusColor(aeronave.status)}>
                  {aeronave.status === "ativa" ? "Ativa" : 
                   aeronave.status === "inativa" ? "Inativa" : "Em Manutenção"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <p className="text-slate-400 text-sm">Matrícula</p>
                  <p className="text-white font-semibold">{aeronave.matricula}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-slate-400 text-sm">Horas Totais</p>
                  <p className="text-white font-semibold">{aeronave.horas_totais.toFixed(1)}h</p>
                </div>
                <div className="space-y-2">
                  <p className="text-slate-400 text-sm">Ano do Diário</p>
                  <p className="text-white font-semibold">{aeronave.ano_diario}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-slate-400 text-sm">Consumo Médio</p>
                  <p className="text-white font-semibold">{aeronave.consumo_medio || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas do Mês */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Horas do Mês</p>
                    <p className="text-2xl font-bold text-white">{totalHorasMes.toFixed(1)}h</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Voos do Mês</p>
                    <p className="text-2xl font-bold text-white">{totalPousosMes}</p>
                  </div>
                  <Plane className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Combustível (L)</p>
                    <p className="text-2xl font-bold text-white">{totalCombustivelMes}</p>
                  </div>
                  <Fuel className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="voos" className="space-y-4">
            <TabsList className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50">
              <TabsTrigger value="voos" className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-blue-600">
                <FileText className="w-4 h-4 mr-2" />
                Voos
              </TabsTrigger>
              <TabsTrigger value="estatisticas" className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-blue-600">
                <Award className="w-4 h-4 mr-2" />
                Estatísticas
              </TabsTrigger>
              <TabsTrigger value="configuracoes" className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-blue-600">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="voos" className="space-y-4">
              <Card className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white">
                    Voos de {getNomeMes(mesAtual.mes)} {mesAtual.ano}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {voosDoMes.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700">
                          <TableHead className="text-slate-300">Data</TableHead>
                          <TableHead className="text-slate-300">De</TableHead>
                          <TableHead className="text-slate-300">Para</TableHead>
                          <TableHead className="text-slate-300">Partida</TableHead>
                          <TableHead className="text-slate-300">Chegada</TableHead>
                          <TableHead className="text-slate-300">Tempo</TableHead>
                          <TableHead className="text-slate-300">Combustível</TableHead>
                          <TableHead className="text-slate-300">PIC</TableHead>
                          <TableHead className="text-slate-300">Destino</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {voosDoMes.map((voo) => (
                          <TableRow key={voo.id} className="border-slate-700 hover:bg-slate-700/30">
                            <TableCell className="text-white">
                              {new Date(voo.data).toLocaleDateString("pt-BR")}
                            </TableCell>
                            <TableCell className="text-white font-mono">{voo.origem}</TableCell>
                            <TableCell className="text-white font-mono">{voo.destino}</TableCell>
                            <TableCell className="text-white">{voo.hora_partida}</TableCell>
                            <TableCell className="text-white">{voo.hora_chegada}</TableCell>
                            <TableCell className="text-white">{voo.horas_voo.toFixed(2)}h</TableCell>
                            <TableCell className="text-white">{voo.combustivel_inicial}L</TableCell>
                            <TableCell className="text-white font-mono">{voo.pic_anac}</TableCell>
                            <TableCell className="text-white">{voo.voo_para}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Plane className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-400 text-lg">
                        Nenhum voo registrado em {getNomeMes(mesAtual.mes)} {mesAtual.ano}
                      </p>
                      <p className="text-slate-500 text-sm mt-2">
                        Use as setas para navegar entre os meses ou adicione um novo voo
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="estatisticas" className="space-y-4">
              <Card className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Estatísticas Gerais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                      <p className="text-slate-400 text-sm">Total de Horas</p>
                      <p className="text-2xl font-bold text-white">{totalHoras.toFixed(1)}h</p>
                    </div>
                    <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                      <p className="text-slate-400 text-sm">Total de Voos</p>
                      <p className="text-2xl font-bold text-white">{voos.length}</p>
                    </div>
                    <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                      <p className="text-slate-400 text-sm">Pilotos Únicos</p>
                      <p className="text-2xl font-bold text-white">{pilotosUnicos}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="configuracoes" className="space-y-4">
              <Card className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Configurações do Diário</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400">
                    Configurações do diário de bordo estarão disponíveis em breve.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
} 