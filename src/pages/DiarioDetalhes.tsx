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
import { aeronaveService, vooServiceSpecific as vooService } from "@/services/firestore";

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

interface DiarioDetalhesProps {
  matricula?: string;
  onVoltar?: () => void;
}

export default function DiarioDetalhes({ matricula: matriculaProp, onVoltar }: DiarioDetalhesProps) {
  const params = useParams();
  const navigate = useNavigate();
  const matricula = matriculaProp || params.matricula;
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
        
        const todasAeronaves = await aeronaveService.getAll();
        const aeronaveData = todasAeronaves.find(a => a.matricula === matricula);
        
        if (!aeronaveData) {
          toast.error("Aeronave não encontrada");
          if (onVoltar) {
            onVoltar();
          } else {
            navigate("/diario");
          }
          return;
        }
        setAeronave(aeronaveData);

        // Carregar voos da aeronave
        const voosData = await vooService.getByAeronave(aeronaveData.id);
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
  const pilotosUnicos = new Set(voos.map(voo => voo.pic_anac).filter(Boolean)).size;

  // Função para criar dados de exemplo da PT-TOR
  const criarDadosPTTOR = async () => {
    if (!aeronave || aeronave.matricula !== "PT-TOR") return;

    const voosExemplo: Omit<Voo, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        data: "2025-01-03",
        hora_partida: "15:17",
        hora_chegada: "17:12",
        origem: "SBCY",
        destino: "SWJN",
        piloto: "EUGENIO B.",
        copiloto: "",
        cotista: "BOMBASSARO",
        horas_voo: 1.92,
        combustivel_inicial: 190.0,
        combustivel_final: 71.9,
        observacoes: "PV - 133796",
        pic_anac: "133796",
        sic_anac: "",
        voo_para: "BOMBASSARO",
        confere: "",
        aeronave_id: aeronave.id
      },
      {
        data: "2025-01-16",
        hora_partida: "16:41",
        hora_chegada: "18:52",
        origem: "SWJN",
        destino: "SBCY",
        piloto: "EUGENIO B.",
        copiloto: "",
        cotista: "BETÃO",
        horas_voo: 2.15,
        combustivel_inicial: 203.2,
        combustivel_final: 78.6,
        observacoes: "PV - 771493",
        pic_anac: "771493",
        sic_anac: "",
        voo_para: "BETÃO",
        confere: "",
        aeronave_id: aeronave.id
      },
      {
        data: "2025-01-21",
        hora_partida: "13:38",
        hora_chegada: "15:43",
        origem: "SBCY",
        destino: "SWJN",
        piloto: "EUGENIO B.",
        copiloto: "",
        cotista: "BETÃO",
        horas_voo: 2.08,
        combustivel_inicial: 196.0,
        combustivel_final: 83.7,
        observacoes: "PV - 771493",
        pic_anac: "771493",
        sic_anac: "",
        voo_para: "BETÃO",
        confere: "",
        aeronave_id: aeronave.id
      }
    ];

    try {
      for (const vooData of voosExemplo) {
        await vooService.create(vooData);
      }
      
      const voosAtualizados = await vooService.getByAeronave(aeronave.id);
      setVoos(voosAtualizados);
      
      toast.success(`${voosExemplo.length} voos adicionados com sucesso para PT-TOR!`);
    } catch (error) {
      console.error("Erro ao criar dados da PT-TOR:", error);
      toast.error("Erro ao adicionar voos da PT-TOR");
    }
  };

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
                onClick={onVoltar ? onVoltar : () => navigate("/diario")}
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-2 sm:p-4 lg:p-6">
        <div className="max-w-full mx-auto space-y-4">
          {/* Header responsivo */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onVoltar ? onVoltar : () => navigate("/diario")}
              className="text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              {aeronave.matricula === "PT-TOR" && voos.length === 0 && (
                <Button
                  onClick={criarDadosPTTOR}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm w-full sm:w-auto"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Carregar Dados PT-TOR
                </Button>
              )}
              <Button
                onClick={handleAddVoo}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Voo
              </Button>
            </div>
          </div>

          {/* Logo e Título responsivo */}
          <div className="text-center mb-6">
            <div className="bg-green-600 text-white px-4 py-2 rounded inline-block font-bold mb-4">
              SHARE Brasil
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white break-words">
              DIÁRIO {getNomeMes(mesAtual.mes)} {mesAtual.ano} {aeronave.matricula}
            </h1>
          </div>

          {/* Navegação Mensal responsiva */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 p-3 bg-slate-800/40 border border-slate-600 rounded">
            <Button
              variant="outline"
              onClick={mesAnterior}
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white w-full sm:w-auto"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>
            
            <div className="flex items-center gap-2">
              <Select 
                value={`${mesAtual.mes}`} 
                onValueChange={(value) => irParaMes(parseInt(value), mesAtual.ano)}
              >
                <SelectTrigger className="w-32 h-8 text-sm bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={`${i + 1}`} className="text-white hover:bg-slate-700">
                      {getNomeMes(i + 1).substring(0, 3)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={`${mesAtual.ano}`} 
                onValueChange={(value) => irParaMes(mesAtual.mes, parseInt(value))}
              >
                <SelectTrigger className="w-20 h-8 text-sm bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {Array.from({ length: 5 }, (_, i) => {
                    const ano = 2023 + i;
                    return (
                      <SelectItem key={ano} value={`${ano}`} className="text-white hover:bg-slate-700">
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
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white w-full sm:w-auto"
            >
              Próximo
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Informações da Aeronave */}
          <Card className="bg-slate-800/40 border-slate-600">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <Plane className="w-5 h-5 mr-2 text-blue-400" />
                  {aeronave.matricula} - {aeronave.modelo}
                </CardTitle>
                <Badge className={getStatusColor(aeronave.status)}>
                  {aeronave.status === "ativa" ? "Ativa" : 
                   aeronave.status === "inativa" ? "Inativa" : "Em Manutenção"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Horas Anteriores:</p>
                  <p className="text-white font-semibold">{aeronave.horas_totais.toFixed(1)}H</p>
                </div>
                <div>
                  <p className="text-slate-400">Horas do Mês:</p>
                  <p className="text-white font-semibold">{totalHorasMes.toFixed(1)}H</p>
                </div>
                <div>
                  <p className="text-slate-400">Horas Atuais:</p>
                  <p className="text-white font-semibold">{(aeronave.horas_totais + totalHoras).toFixed(1)}H</p>
                </div>
                <div>
                  <p className="text-slate-400">Consumo Médio:</p>
                  <p className="text-white font-semibold">{aeronave.consumo_medio || "83 L/H"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas do Mês */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-slate-800/40 border-slate-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Horas do Mês</p>
                    <p className="text-2xl font-bold text-white">{totalHorasMes.toFixed(2)}H</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/40 border-slate-600">
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
            <Card className="bg-slate-800/40 border-slate-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Combustível (L)</p>
                    <p className="text-2xl font-bold text-white">{totalCombustivelMes.toFixed(1)}</p>
                  </div>
                  <Fuel className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Voos do Mês */}
          <Card className="bg-slate-800/40 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white text-center">
                Voos de {getNomeMes(mesAtual.mes)} {mesAtual.ano}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {voosDoMes.length > 0 ? (
                <div className="space-y-2">
                  {voosDoMes.map((voo, index) => (
                    <div key={voo.id} className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400">Data:</p>
                          <p className="text-white font-semibold">
                            {new Date(voo.data).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Rota:</p>
                          <p className="text-white font-mono">{voo.origem} → {voo.destino}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Horário:</p>
                          <p className="text-white">{voo.hora_partida} - {voo.hora_chegada}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Tempo Voo:</p>
                          <p className="text-white font-semibold">{voo.horas_voo.toFixed(2)}h</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Piloto:</p>
                          <p className="text-white">{voo.piloto}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">PIC ANAC:</p>
                          <p className="text-white font-mono">{voo.pic_anac || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Voo Para:</p>
                          <p className="text-white">{voo.voo_para}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Combustível:</p>
                          <p className="text-white">{voo.combustivel_inicial}L → {voo.combustivel_final}L</p>
                        </div>
                      </div>
                      {voo.observacoes && (
                        <div className="mt-3 pt-3 border-t border-slate-600">
                          <p className="text-slate-400 text-sm">Observações:</p>
                          <p className="text-white text-sm">{voo.observacoes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Plane className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">
                    Nenhum voo registrado em {getNomeMes(mesAtual.mes)} {mesAtual.ano}
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    Use as setas para navegar entre os meses ou clique em "Adicionar Voo"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}