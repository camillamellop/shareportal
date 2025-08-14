import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plane, Save, X, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { vooServiceSpecific, aeronaveServiceSpecific } from "@/services/firestore";
import { vooService } from "@/services/vooService";

interface VooFormData {
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
}

const PILOTOS = [
  "RODRIGO DE MORAES TOSCANO",
  "WENDELL MUNIZ CANEDO", 
  "ROLFFE DE LIMA ERBE"
];

const COTISTAS = [
  "NOVA ALIANCA AGRO LTDA",
  "NOGUEIRA PARTICIPACOES E EMPREENDIMENTOS LTDA",
  "GRF INCORPORADORA E CONSTRUTORA LTDA",
  "GA SERVICE - GESTAO ADMINISTRATIVA LTDA",
  "AGROCAM AGRICULTURA E PECUARIA CAMPONOVENSE LTDA",
  "ESTANCIA BAHIA EVENTOS LTDA",
  "E. R. DE FIGUEIREDO & CIA LTDA",
  "DUILIO NAVES JUNQUEIRA JUNIOR",
  "COMPLEXO TURISTICO SANTA ROSA PANTANAL HOTEIS LTDA",
  "WATT - DISTRIBUIDORA BRASIL. DE COMBUSTIVEIS E DERIVADOS DE PETROLEO LTDA",
  "SOLUCAO TECNICA COMERCIO E SERVICOS DE EQUIPAMENTOS ELETRONICOS LTDA",
  "RICARDO GOMES DOS SANTOS",
  "R.O.G HOLDING LTDA",
  "EUGENIO ROBERTO BERGAMIM"
];

export default function AdicionarVoo() {
  const { matricula } = useParams();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const planoId = searchParams.get('plano_id'); // Para voos vindos de um plano programado

  console.log("AdicionarVoo renderizado com matrícula:", matricula);
  console.log("Plano ID:", planoId);

  const [formData, setFormData] = useState<VooFormData>({
    data: new Date().toISOString().split('T')[0],
    hora_partida: "",
    hora_chegada: "",
    origem: "",
    destino: "",
    piloto: "",
    copiloto: "",
    cotista: "",
    horas_voo: 0,
    combustivel_inicial: 0,
    combustivel_final: 0,
    observacoes: "",
    pic_anac: "",
    sic_anac: "",
    voo_para: "",
    confere: ""
  });

  const [errors, setErrors] = useState<{[key: string]: string | undefined}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aeronave, setAeronave] = useState<any>(null);

  // Carregar dados da aeronave
  useEffect(() => {
    const loadAeronave = async () => {
      if (!matricula) {
        console.log("Matrícula não fornecida");
        return;
      }

      console.log("Carregando aeronave para matrícula:", matricula);

      try {
        const aeronaveData = await aeronaveServiceSpecific.getByMatricula(matricula);
        console.log("Aeronave encontrada:", aeronaveData);
        
        if (!aeronaveData) {
          console.log("Aeronave não encontrada");
          toast.error("Aeronave não encontrada");
          navigate("/diario");
          return;
        }
        setAeronave(aeronaveData);
      } catch (error) {
        console.error("Erro ao carregar aeronave:", error);
        toast.error("Erro ao carregar dados da aeronave");
      }
    };

    loadAeronave();
  }, [matricula, navigate]);

  // Calcular horas automaticamente quando partida e chegada são preenchidas
  useEffect(() => {
    if (formData.hora_partida && formData.hora_chegada) {
      const partida = new Date(`2000-01-01T${formData.hora_partida}`);
      const chegada = new Date(`2000-01-01T${formData.hora_chegada}`);
      
      // Se a chegada é antes da partida, assumir que é no dia seguinte
      if (chegada < partida) {
        chegada.setDate(chegada.getDate() + 1);
      }
      
      const diffMs = chegada.getTime() - partida.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      setFormData(prev => ({
        ...prev,
        horas_voo: Math.round(diffHours * 10) / 10 // Arredondar para 1 casa decimal
      }));
    }
  }, [formData.hora_partida, formData.hora_chegada]);

  // Extrair PIC ANAC do nome do piloto
  const extractPICAnac = (pilotoName: string): string => {
    // Simular extração do PIC ANAC baseado no nome
    const pilotosPIC: { [key: string]: string } = {
      "RODRIGO DE MORAES TOSCANO": "133796",
      "WENDELL MUNIZ CANEDO": "113374", 
      "ROLFFE DE LIMA ERBE": "771493"
    };
    return pilotosPIC[pilotoName] || "";
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string | undefined} = {};

    if (!formData.data) {
      newErrors.data = "Data é obrigatória";
    }
    if (!formData.hora_partida) {
      newErrors.hora_partida = "Hora de partida é obrigatória";
    }
    if (!formData.hora_chegada) {
      newErrors.hora_chegada = "Hora de chegada é obrigatória";
    }
    if (!formData.origem) {
      newErrors.origem = "Origem é obrigatória";
    }
    if (!formData.destino) {
      newErrors.destino = "Destino é obrigatório";
    }
    if (!formData.piloto) {
      newErrors.piloto = "Piloto é obrigatório";
    }
    if (!formData.cotista) {
      newErrors.cotista = "Cotista é obrigatório";
    }
    if (formData.horas_voo <= 0) {
      newErrors.horas_voo = "Horas de voo devem ser maiores que zero";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === undefined);
  };

  const handleInputChange = (field: keyof VooFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando o usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Atualizar PIC ANAC quando piloto é selecionado
    if (field === 'piloto' && typeof value === 'string') {
      const picAnac = extractPICAnac(value);
      setFormData(prev => ({ 
        ...prev, 
        piloto: value,
        pic_anac: picAnac,
        voo_para: prev.cotista // Usar cotista como destino do voo
      }));
    }

    // Atualizar voo_para quando cotista é selecionado
    if (field === 'cotista' && typeof value === 'string') {
      setFormData(prev => ({ 
        ...prev, 
        cotista: value,
        voo_para: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Por favor, corrija os campos destacados");
      return;
    }

    if (!aeronave) {
      toast.error("Aeronave não encontrada");
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar dados para salvar
      const vooData = {
        ...formData,
        aeronave_id: aeronave.id,
        piloto: `PIC: ${formData.pic_anac}`,
        copiloto: formData.copiloto ? `SIC: ${formData.sic_anac}` : undefined
      };

      // Salvar no Firebase
      await vooServiceSpecific.create(vooData);

      // Atualizar horas totais da aeronave
      const novasHoras = aeronave.horas_totais + formData.horas_voo;
      await aeronaveServiceSpecific.updateHorasTotais(aeronave.id, novasHoras);

      // Se o voo veio de um plano programado, marcar como concluído
      if (planoId) {
        try {
          await vooService.atualizarStatusPlano(planoId, 'concluido');
          console.log("Plano de voo marcado como concluído:", planoId);
        } catch (error) {
          console.error("Erro ao atualizar status do plano:", error);
        }
      }

      toast.success("Voo registrado com sucesso no diário de bordo");
      navigate(`/diario/detalhes/${matricula}`);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar o voo. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/diario/detalhes/${matricula}`);
  };

  if (!aeronave) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-slate-300">Carregando aeronave...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-slate-400 hover:text-white hover:bg-slate-800/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Lançar Hora - {matricula}
                </h1>
                <p className="text-slate-400">
                  Registre um novo voo no diário de bordo
                </p>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <Card className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Plane className="w-5 h-5 mr-2 text-blue-400" />
                  Informações do Voo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data" className="text-slate-300">Data *</Label>
                    <Input
                      id="data"
                      type="date"
                      value={formData.data}
                      onChange={(e) => handleInputChange('data', e.target.value)}
                      className={`bg-slate-700/50 border-slate-600/50 text-white backdrop-blur-sm ${
                        errors.data ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.data && (
                      <p className="text-red-400 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.data}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hora_partida" className="text-slate-300">Hora Partida *</Label>
                    <Input
                      id="hora_partida"
                      type="time"
                      value={formData.hora_partida}
                      onChange={(e) => handleInputChange('hora_partida', e.target.value)}
                      className={`bg-slate-700/50 border-slate-600/50 text-white backdrop-blur-sm ${
                        errors.hora_partida ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.hora_partida && (
                      <p className="text-red-400 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.hora_partida}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hora_chegada" className="text-slate-300">Hora Chegada *</Label>
                    <Input
                      id="hora_chegada"
                      type="time"
                      value={formData.hora_chegada}
                      onChange={(e) => handleInputChange('hora_chegada', e.target.value)}
                      className={`bg-slate-700/50 border-slate-600/50 text-white backdrop-blur-sm ${
                        errors.hora_chegada ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.hora_chegada && (
                      <p className="text-red-400 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.hora_chegada}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origem" className="text-slate-300">Origem *</Label>
                    <Input
                      id="origem"
                      value={formData.origem}
                      onChange={(e) => handleInputChange('origem', e.target.value)}
                      placeholder="Ex: CGR"
                      className={`bg-slate-700/50 border-slate-600/50 text-white backdrop-blur-sm ${
                        errors.origem ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.origem && (
                      <p className="text-red-400 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.origem}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destino" className="text-slate-300">Destino *</Label>
                    <Input
                      id="destino"
                      value={formData.destino}
                      onChange={(e) => handleInputChange('destino', e.target.value)}
                      placeholder="Ex: CWB"
                      className={`bg-slate-700/50 border-slate-600/50 text-white backdrop-blur-sm ${
                        errors.destino ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.destino && (
                      <p className="text-red-400 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.destino}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tripulação */}
            <Card className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white">Tripulação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="piloto" className="text-slate-300">Piloto *</Label>
                    <Select value={formData.piloto} onValueChange={(value) => handleInputChange('piloto', value)}>
                      <SelectTrigger className={`bg-slate-700/50 border-slate-600/50 text-white backdrop-blur-sm ${
                        errors.piloto ? 'border-red-500' : ''
                      }`}>
                        <SelectValue placeholder="Selecione o piloto..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        {PILOTOS.map(piloto => (
                          <SelectItem key={piloto} value={piloto} className="hover:bg-slate-700">
                            {piloto}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.piloto && (
                      <p className="text-red-400 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.piloto}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="copiloto" className="text-slate-300">Copiloto</Label>
                    <Select value={formData.copiloto} onValueChange={(value) => handleInputChange('copiloto', value)}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white backdrop-blur-sm">
                        <SelectValue placeholder="Selecione o copiloto..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="" className="hover:bg-slate-700">Nenhum</SelectItem>
                        {PILOTOS.map(piloto => (
                          <SelectItem key={piloto} value={piloto} className="hover:bg-slate-700">
                            {piloto}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cotista" className="text-slate-300">Cotista *</Label>
                  <Select value={formData.cotista} onValueChange={(value) => handleInputChange('cotista', value)}>
                    <SelectTrigger className={`bg-slate-700/50 border-slate-600/50 text-white backdrop-blur-sm ${
                      errors.cotista ? 'border-red-500' : ''
                    }`}>
                      <SelectValue placeholder="Selecione o cotista..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {COTISTAS.map(cotista => (
                        <SelectItem key={cotista} value={cotista} className="hover:bg-slate-700">
                          {cotista}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.cotista && (
                    <p className="text-red-400 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.cotista}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Dados Técnicos */}
            <Card className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white">Dados Técnicos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="horas_voo" className="text-slate-300 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Horas de Voo *
                    </Label>
                    <Input
                      id="horas_voo"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.horas_voo}
                      onChange={(e) => handleInputChange('horas_voo', parseFloat(e.target.value) || 0)}
                      className={`bg-slate-700/50 border-slate-600/50 text-white backdrop-blur-sm ${
                        errors.horas_voo ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.horas_voo && (
                      <p className="text-red-400 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.horas_voo}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="combustivel_inicial" className="text-slate-300">Combustível Inicial (L)</Label>
                    <Input
                      id="combustivel_inicial"
                      type="number"
                      min="0"
                      value={formData.combustivel_inicial}
                      onChange={(e) => handleInputChange('combustivel_inicial', parseFloat(e.target.value) || 0)}
                      className="bg-slate-700/50 border-slate-600/50 text-white backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="combustivel_final" className="text-slate-300">Combustível Final (L)</Label>
                    <Input
                      id="combustivel_final"
                      type="number"
                      min="0"
                      value={formData.combustivel_final}
                      onChange={(e) => handleInputChange('combustivel_final', parseFloat(e.target.value) || 0)}
                      className="bg-slate-700/50 border-slate-600/50 text-white backdrop-blur-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes" className="text-slate-300">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => handleInputChange('observacoes', e.target.value)}
                    placeholder="Observações sobre o voo..."
                    className="bg-slate-700/50 border-slate-600/50 text-white backdrop-blur-sm min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Botões */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? "Salvando..." : "Lançar Hora"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}