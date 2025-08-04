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
import { Plane, MapPin, Calendar, DollarSign, Plus, FileText, Save, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";
import { conciliacaoService } from "@/services/conciliacaoService";

interface RelatorioViagemForm {
  numero: string;
  colaborador_nome: string;
  colaborador_cargo: string;
  data_inicio: string;
  data_fim: string;
  destino: string;
  proposito: string;
  despesas: DespesaViagem[];
  observacoes: string;
}

interface DespesaViagem {
  id: string;
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  comprovante?: string;
}

interface RelatorioEmitido {
  id: string;
  numero: string;
  colaborador_nome: string;
  destino: string;
  valor_total: number;
  data_inicio: string;
  data_fim: string;
  despesa_criada: boolean;
  despesa_id?: string;
  createdAt: any;
}

const CATEGORIAS_DESPESA = [
  'Hospedagem',
  'Alimentação',
  'Transporte',
  'Combustível',
  'Pedágio',
  'Estacionamento',
  'Material/Equipamento',
  'Outros'
];

export default function RelatorioViagem() {
  const [formData, setFormData] = useState<RelatorioViagemForm>({
    numero: '',
    colaborador_nome: '',
    colaborador_cargo: '',
    data_inicio: '',
    data_fim: '',
    destino: '',
    proposito: '',
    despesas: [],
    observacoes: ''
  });

  const [relatoriosEmitidos, setRelatoriosEmitidos] = useState<RelatorioEmitido[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRelatorios();
    generateNextNumber();
  }, []);

  const loadRelatorios = async () => {
    // Simular carregamento de relatórios (integrar com Firebase depois)
    setRelatoriosEmitidos([]);
  };

  const generateNextNumber = () => {
    const year = new Date().getFullYear();
    const nextNumber = String(relatoriosEmitidos.length + 1).padStart(3, '0');
    setFormData(prev => ({ ...prev, numero: `RV${nextNumber}/${year}` }));
  };

  const handleInputChange = (field: keyof RelatorioViagemForm, value: string | DespesaViagem[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const adicionarDespesa = () => {
    const novaDespesa: DespesaViagem = {
      id: `despesa_${Date.now()}`,
      categoria: '',
      descricao: '',
      valor: 0,
      data: new Date().toISOString().split('T')[0]
    };
    
    setFormData(prev => ({
      ...prev,
      despesas: [...prev.despesas, novaDespesa]
    }));
  };

  const removerDespesa = (id: string) => {
    setFormData(prev => ({
      ...prev,
      despesas: prev.despesas.filter(d => d.id !== id)
    }));
  };

  const atualizarDespesa = (id: string, field: keyof DespesaViagem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      despesas: prev.despesas.map(d => 
        d.id === id ? { ...d, [field]: value } : d
      )
    }));
  };

  const calcularTotal = () => {
    return formData.despesas.reduce((total, despesa) => total + despesa.valor, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.colaborador_nome || !formData.destino || !formData.data_inicio || !formData.data_fim) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.despesas.length === 0) {
      toast.error('Adicione pelo menos uma despesa');
      return;
    }

    setSubmitting(true);

    try {
      // Simular criação do relatório (integrar com Firebase depois)
      const relatorioId = `relatorio_${Date.now()}`;
      const valorTotal = calcularTotal();
      
      // Criar despesa pendente automaticamente
      const despesaId = await conciliacaoService.criarDespesaDeRelatorioViagem(relatorioId, {
        numero: formData.numero,
        colaborador_nome: formData.colaborador_nome,
        valor_total: valorTotal,
        descricao: `Viagem para ${formData.destino} - ${formData.proposito}`,
        data: formData.data_inicio
      });

      toast.success('Relatório de viagem criado e despesa pendente gerada!');
      
      // Limpar formulário
      setFormData({
        numero: '',
        colaborador_nome: '',
        colaborador_cargo: '',
        data_inicio: '',
        data_fim: '',
        destino: '',
        proposito: '',
        despesas: [],
        observacoes: ''
      });

      generateNextNumber();
      loadRelatorios();

    } catch (error) {
      console.error('Erro ao criar relatório:', error);
      toast.error('Erro ao criar relatório de viagem');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Concluída":
        return <Badge className="bg-green-100 text-green-800">Concluída</Badge>;
      case "Em andamento":
        return <Badge className="bg-blue-100 text-blue-800">Em andamento</Badge>;
      case "Planejada":
        return <Badge className="bg-yellow-100 text-yellow-800">Planejada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatório de Viagem</h1>
            <p className="text-muted-foreground mt-2">
              Crie relatórios de viagem e gere automaticamente despesas para reembolso
            </p>
          </div>
        </div>

        <Tabs defaultValue="novo" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="novo">Novo Relatório</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="novo" className="space-y-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Dados da Viagem
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="numero">Número do Relatório *</Label>
                        <Input 
                          id="numero" 
                          value={formData.numero}
                          onChange={(e) => handleInputChange('numero', e.target.value)}
                          placeholder="RV001/2024" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="colaborador_cargo">Cargo</Label>
                        <Input 
                          id="colaborador_cargo"
                          value={formData.colaborador_cargo}
                          onChange={(e) => handleInputChange('colaborador_cargo', e.target.value)}
                          placeholder="Piloto, Coordenador, etc."
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="colaborador_nome">Nome do Colaborador *</Label>
                      <Input 
                        id="colaborador_nome"
                        value={formData.colaborador_nome}
                        onChange={(e) => handleInputChange('colaborador_nome', e.target.value)}
                        placeholder="Nome completo do colaborador"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="data_inicio">Data de Início *</Label>
                        <Input 
                          id="data_inicio" 
                          type="date"
                          value={formData.data_inicio}
                          onChange={(e) => handleInputChange('data_inicio', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="data_fim">Data de Fim *</Label>
                        <Input 
                          id="data_fim" 
                          type="date"
                          value={formData.data_fim}
                          onChange={(e) => handleInputChange('data_fim', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="destino">Destino *</Label>
                      <Input 
                        id="destino"
                        value={formData.destino}
                        onChange={(e) => handleInputChange('destino', e.target.value)}
                        placeholder="Cidade/Estado de destino"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="proposito">Propósito da Viagem</Label>
                      <Textarea 
                        id="proposito"
                        value={formData.proposito}
                        onChange={(e) => handleInputChange('proposito', e.target.value)}
                        placeholder="Motivo da viagem..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Despesas da Viagem
                      </CardTitle>
                      <Button type="button" onClick={adicionarDespesa} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formData.despesas.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma despesa adicionada</p>
                        <Button type="button" onClick={adicionarDespesa} className="mt-2">
                          Adicionar Primeira Despesa
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.despesas.map((despesa, index) => (
                          <div key={despesa.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Despesa {index + 1}</span>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm"
                                onClick={() => removerDespesa(despesa.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <Select 
                                value={despesa.categoria}
                                onValueChange={(value) => atualizarDespesa(despesa.id, 'categoria', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                  {CATEGORIAS_DESPESA.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              <Input 
                                type="date"
                                value={despesa.data}
                                onChange={(e) => atualizarDespesa(despesa.id, 'data', e.target.value)}
                              />
                            </div>

                            <Input 
                              placeholder="Descrição da despesa"
                              value={despesa.descricao}
                              onChange={(e) => atualizarDespesa(despesa.id, 'descricao', e.target.value)}
                            />

                            <Input 
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Valor"
                              value={despesa.valor}
                              onChange={(e) => atualizarDespesa(despesa.id, 'valor', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        ))}

                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Total das Despesas:</span>
                            <span className="text-xl font-bold text-primary">
                              {formatCurrency(calcularTotal())}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Observações e Finalização</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações Gerais</Label>
                    <Textarea 
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => handleInputChange('observacoes', e.target.value)}
                      placeholder="Observações adicionais sobre a viagem..."
                      rows={4}
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Processo Automático</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Ao salvar este relatório, será criada automaticamente uma <strong>despesa pendente</strong> para o colaborador 
                      no valor total de <strong>{formatCurrency(calcularTotal())}</strong>, iniciando o processo de reembolso.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={submitting} className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      {submitting ? 'Salvando...' : 'Criar Relatório'}
                    </Button>
                    <Button type="button" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="historico" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Emitidos</CardTitle>
              </CardHeader>
              <CardContent>
                {relatoriosEmitidos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum relatório emitido ainda</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número</TableHead>
                        <TableHead>Colaborador</TableHead>
                        <TableHead>Destino</TableHead>
                        <TableHead>Período</TableHead>
                        <TableHead>Valor Total</TableHead>
                        <TableHead>Status Despesa</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatoriosEmitidos.map((relatorio) => (
                        <TableRow key={relatorio.id}>
                          <TableCell className="font-medium">{relatorio.numero}</TableCell>
                          <TableCell>{relatorio.colaborador_nome}</TableCell>
                          <TableCell>{relatorio.destino}</TableCell>
                          <TableCell>
                            {formatDate(relatorio.data_inicio)} - {formatDate(relatorio.data_fim)}
                          </TableCell>
                          <TableCell className="font-semibold">{formatCurrency(relatorio.valor_total)}</TableCell>
                          <TableCell>
                            {relatorio.despesa_criada ? (
                              <Badge className="bg-green-100 text-green-800">
                                Despesa Criada
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Sem Despesa</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4" />
                              </Button>
                            </div>
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