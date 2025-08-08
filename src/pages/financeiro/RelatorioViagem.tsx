import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PDFGenerator } from '@/utils/pdfGenerator';
import { 
  Plane, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Plus, 
  FileText, 
  Save, 
  CheckCircle, 
  X, 
  Download,
  User,
  Receipt,
  Building,
  Upload,
  File,
  Eye
} from 'lucide-react';

// Interfaces
interface DespesaViagem {
  id: string;
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  pago_por: 'Tripulante' | 'Cotista' | 'Share Brasil';
  comprovante_url?: string;
  comprovante_nome?: string;
}

interface RelatorioViagemForm {
  numero: string;
  cotista: string;
  aeronave: string;
  tripulante: string;
  destino: string;
  data_inicio: string;
  data_fim: string;
  despesas: DespesaViagem[];
  observacoes: string;
  criado_por: string;
  total_tripulante: number;
  total_cotista: number;
  total_share_brasil: number;
  valor_total: number;
}

interface RelatorioSalvo {
  id: string;
  numero: string;
  cotista: string;
  tripulante: string;
  destino: string;
  valor_total: number;
  data_inicio: string;
  data_fim: string;
  criado_por: string;
  criado_em: Date;
  despesa_tripulante_id?: string;
  despesa_cotista_id?: string;
  pdf_url?: string;
}

// Constantes
const AERONAVES = [
  'PR-PT-OPC','PR-MDL','PS-AVE','PT-JPK','PT-OJG','PT-RVJ','PT-WSR','PP-JCP'
];

const CATEGORIAS_DESPESA = [
  'Combustível',
  'Hospedagem', 
  'Alimentação',
  'Transporte',
  'Pedágio',
  'Estacionamento',
  'Material/Equipamento',
  'Outros'
];

export default function RelatorioViagemCompleto() {
  const [formData, setFormData] = useState<RelatorioViagemForm>({
    numero: '',
    cotista: '',
    aeronave: '',
    tripulante: '',
    destino: '',
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: new Date().toISOString().split('T')[0],
    despesas: [],
    observacoes: '',
    criado_por: 'Usuario Atual', // Em produção, pegar do contexto de autenticação
    total_tripulante: 0,
    total_cotista: 0,
    total_share_brasil: 0,
    valor_total: 0
  });

  const [relatoriosSalvos, setRelatoriosSalvos] = useState<RelatorioSalvo[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    generateNextNumber();
    loadRelatorios();
  }, []);

  const generateNextNumber = () => {
    const proximoNumero = relatoriosSalvos.length + 1;
    const numeroFormatado = `REL${proximoNumero.toString().padStart(3, '0')}`;
    setFormData(prev => ({ ...prev, numero: numeroFormatado }));
  };

  const loadRelatorios = () => {
    // Simulação - em produção, carregar do Firebase/backend
    const relatoriosExemplo: RelatorioSalvo[] = [
      {
        id: '1',
        numero: 'REL001',
        cotista: 'João Silva',
        tripulante: 'Pedro Santos',
        destino: 'São Paulo',
        valor_total: 2500.00,
        data_inicio: '2024-01-15',
        data_fim: '2024-01-17',
        criado_por: 'Admin',
        criado_em: new Date('2024-01-10'),
        despesa_tripulante_id: 'desp_001',
        despesa_cotista_id: 'desp_002'
      }
    ];
    setRelatoriosSalvos(relatoriosExemplo);
  };

  const handleInputChange = (field: keyof RelatorioViagemForm, value: string | number | DespesaViagem[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const adicionarDespesa = () => {
    const novaDespesa: DespesaViagem = {
      id: `despesa_${Date.now()}`,
      categoria: 'Combustível',
      descricao: '',
      valor: 0,
      data: formData.data_inicio || new Date().toISOString().split('T')[0],
      pago_por: 'Tripulante'
    };
    
    setFormData(prev => ({
      ...prev,
      despesas: [...prev.despesas, novaDespesa]
    }));
  };

  const removerDespesa = (id: string) => {
    const novasDespesas = formData.despesas.filter(d => d.id !== id);
    setFormData(prev => ({ ...prev, despesas: novasDespesas }));
    calcularTotais(novasDespesas);
  };

  const atualizarDespesa = (id: string, field: keyof DespesaViagem, value: string | number) => {
    const novasDespesas = formData.despesas.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    );
    setFormData(prev => ({ ...prev, despesas: novasDespesas }));
    calcularTotais(novasDespesas);
  };

  const handleFileUpload = async (id: string, file: File) => {
    try {
      // Simulação do upload - em produção, enviar para servidor/Firebase Storage
      const fileName = file.name;
      const fileUrl = URL.createObjectURL(file); // Simulação da URL
      
      const novasDespesas = formData.despesas.map(d => 
        d.id === id ? { 
          ...d, 
          comprovante_url: fileUrl,
          comprovante_nome: fileName
        } : d
      );
      
      setFormData(prev => ({ ...prev, despesas: novasDespesas }));
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
    }
  };

  const removerComprovante = (id: string) => {
    const novasDespesas = formData.despesas.map(d => 
      d.id === id ? { 
        ...d, 
        comprovante_url: undefined,
        comprovante_nome: undefined
      } : d
    );
    setFormData(prev => ({ ...prev, despesas: novasDespesas }));
  };

  const calcularTotais = (despesas: DespesaViagem[]) => {
    const totalTripulante = despesas
      .filter(d => d.pago_por === 'Tripulante')
      .reduce((sum, d) => sum + d.valor, 0);
    
    const totalCotista = despesas
      .filter(d => d.pago_por === 'Cotista')
      .reduce((sum, d) => sum + d.valor, 0);
    
    const totalShareBrasil = despesas
      .filter(d => d.pago_por === 'Share Brasil')
      .reduce((sum, d) => sum + d.valor, 0);
    
    const valorTotal = totalTripulante + totalCotista + totalShareBrasil;

    setFormData(prev => ({
      ...prev,
      total_tripulante: totalTripulante,
      total_cotista: totalCotista,
      total_share_brasil: totalShareBrasil,
      valor_total: valorTotal
    }));
  };

  const calcularDias = () => {
    if (!formData.data_inicio || !formData.data_fim) return 0;
    const inicio = new Date(formData.data_inicio);
    const fim = new Date(formData.data_fim);
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const gerarPDF = async (relatorio: RelatorioViagemForm) => {
    try {
      await PDFGenerator.generateRelatorioViagemPDF({
        numero: relatorio.numero,
        colaborador_nome: relatorio.tripulante,
        valor_total: relatorio.valor_total,
        descricao: relatorio.observacoes,
        data: relatorio.data_inicio,
        destino: relatorio.destino,
        despesas: relatorio.despesas.map(d => ({
          categoria: d.categoria,
          descricao: d.descricao,
          valor: d.valor,
          data: d.data,
          pago_por: d.pago_por
        }))
      });
      
      return `pdf_${relatorio.numero}_${Date.now()}.pdf`;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF do relatório');
      throw error;
    }
  };

  const criarDespesasConciliacao = async (relatorio: RelatorioViagemForm) => {
    const despesas = [];

    // Criar despesa para ressarcir tripulante (se houver)
    if (relatorio.total_tripulante > 0) {
      const despesaTripulante = {
        id: `desp_trip_${Date.now()}`,
        tipo: 'RESSARCIMENTO',
        beneficiario: relatorio.tripulante,
        valor: relatorio.total_tripulante,
        descricao: `Ressarcimento viagem ${relatorio.destino} - ${relatorio.numero}`,
        status: 'PENDENTE',
        relatorio_origem: relatorio.numero
      };
      despesas.push(despesaTripulante);
    }

    // Criar despesa para cobrar do cotista (se houver)
    if (relatorio.total_cotista > 0) {
      const despesaCotista = {
        id: `desp_cot_${Date.now()}`,
        tipo: 'COBRANCA',
        beneficiario: relatorio.cotista,
        valor: relatorio.total_cotista,
        descricao: `Cobrança viagem ${relatorio.destino} - ${relatorio.numero}`,
        status: 'PENDENTE',
        relatorio_origem: relatorio.numero
      };
      despesas.push(despesaCotista);
    }

    return despesas;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cotista || !formData.tripulante || !formData.destino || 
        !formData.data_inicio || !formData.data_fim || formData.despesas.length === 0) {
      alert('Preencha todos os campos obrigatórios e adicione pelo menos uma despesa');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Gerar PDF
      const pdfUrl = await gerarPDF(formData);
      
      // 2. Criar despesas para conciliação
      const despesasCriadas = await criarDespesasConciliacao(formData);
      
      // 3. Salvar relatório
      const novoRelatorio: RelatorioSalvo = {
        id: `rel_${Date.now()}`,
        numero: formData.numero,
        cotista: formData.cotista,
        tripulante: formData.tripulante,
        destino: formData.destino,
        valor_total: formData.valor_total,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim,
        criado_por: formData.criado_por,
        criado_em: new Date(),
        despesa_tripulante_id: despesasCriadas.find(d => d.tipo === 'RESSARCIMENTO')?.id,
        despesa_cotista_id: despesasCriadas.find(d => d.tipo === 'COBRANCA')?.id,
        pdf_url: pdfUrl
      };

      setRelatoriosSalvos(prev => [novoRelatorio, ...prev]);
      
      alert(`Relatório ${formData.numero} criado com sucesso!\n\n` +
            `PDF gerado e salvo\n` +
            `${despesasCriadas.length} despesa(s) criada(s) para conciliação\n` +
            `Registrado no histórico`);

      // Limpar formulário e gerar próximo número
      setFormData({
        numero: '',
        cotista: '',
        aeronave: '',
        tripulante: '',
        destino: '',
        data_inicio: new Date().toISOString().split('T')[0],
        data_fim: new Date().toISOString().split('T')[0],
        despesas: [],
        observacoes: '',
        criado_por: 'Usuario Atual',
        total_tripulante: 0,
        total_cotista: 0,
        total_share_brasil: 0,
        valor_total: 0
      });
      
      generateNextNumber();

    } catch (error) {
      console.error('Erro ao criar relatório:', error);
      alert('Erro ao criar relatório de viagem');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const downloadPDF = async (relatorio: RelatorioSalvo) => {
    try {
      // Buscar dados completos do relatório (aqui você pode implementar a busca no Firebase)
      const relatorioCompleto = {
        numero: relatorio.numero,
        colaborador_nome: relatorio.tripulante,
        valor_total: relatorio.valor_total,
        descricao: '', // Pode ser implementado conforme necessário
        data: relatorio.data_inicio,
        destino: relatorio.destino,
        despesas: [] // Pode ser implementado conforme necessário
      };
      
      await PDFGenerator.generateRelatorioViagemPDF(relatorioCompleto);
      toast.success('PDF do relatório gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF do relatório:', error);
      toast.error('Erro ao gerar PDF do relatório');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header com logo */}
      <div className="bg-card rounded-lg shadow-lg p-6 mb-6 border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">SHARE Brasil</h1>
              </div>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold text-foreground">Relatório de Despesa de Viagem</h2>
            <p className="text-sm text-muted-foreground">Gestão Automatizada</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="formulario" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="formulario">Novo Relatório</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="formulario" className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Card de Informações Básicas */}
            <Card className="shadow-lg bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Informações da Viagem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número do Relatório</Label>
                    <Input 
                      id="numero"
                      value={formData.numero}
                      onChange={(e) => handleInputChange('numero', e.target.value)}
                      placeholder="Ex: RV-2024-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cotista">Cotista</Label>
                    <Input 
                      id="cotista"
                      value={formData.cotista}
                      onChange={(e) => handleInputChange('cotista', e.target.value)}
                      placeholder="Nome do cotista"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="aeronave">Aeronave</Label>
                    <Select 
                      value={formData.aeronave} 
                      onValueChange={(value) => handleInputChange('aeronave', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a aeronave" />
                      </SelectTrigger>
                      <SelectContent>
                        {AERONAVES.map(aeronave => (
                          <SelectItem key={aeronave} value={aeronave}>{aeronave}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tripulante">Tripulante</Label>
                    <Input 
                      id="tripulante"
                      value={formData.tripulante}
                      onChange={(e) => handleInputChange('tripulante', e.target.value)}
                      placeholder="Nome do tripulante"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destino">Destino</Label>
                    <Input 
                      id="destino"
                      value={formData.destino}
                      onChange={(e) => handleInputChange('destino', e.target.value)}
                      placeholder="Cidade/destino"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data_inicio">Data de Início</Label>
                    <Input 
                      id="data_inicio"
                      type="date"
                      value={formData.data_inicio}
                      onChange={(e) => handleInputChange('data_inicio', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data_fim">Data de Fim</Label>
                    <Input 
                      id="data_fim"
                      type="date"
                      value={formData.data_fim}
                      onChange={(e) => handleInputChange('data_fim', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Período (dias)</Label>
                    <div className="flex items-center h-10 px-3 rounded-md border border-input bg-background text-sm">
                      {calcularDias()} dias
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card de Despesas */}
            <Card className="shadow-lg bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Despesas da Viagem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Adicione todas as despesas relacionadas à viagem
                  </p>
                  <Button 
                    type="button" 
                    onClick={adicionarDespesa}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Despesa
                  </Button>
                </div>

                {formData.despesas.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma despesa adicionada</p>
                    <p className="text-sm">Clique em "Adicionar Despesa" para começar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.despesas.map((despesa, index) => (
                      <div key={despesa.id} className="p-4 border border-border rounded-lg bg-card">
                        <div className="grid md:grid-cols-6 gap-3">
                          <div className="space-y-2">
                            <Label>Categoria</Label>
                            <Select 
                              value={despesa.categoria} 
                              onValueChange={(value) => atualizarDespesa(despesa.id, 'categoria', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Categoria" />
                              </SelectTrigger>
                              <SelectContent>
                                {CATEGORIAS_DESPESA.map(categoria => (
                                  <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Input 
                              value={despesa.descricao}
                              onChange={(e) => atualizarDespesa(despesa.id, 'descricao', e.target.value)}
                              placeholder="Descrição da despesa"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Valor (R$)</Label>
                            <Input 
                              type="number"
                              step="0.01"
                              value={despesa.valor}
                              onChange={(e) => atualizarDespesa(despesa.id, 'valor', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Data</Label>
                            <Input 
                              type="date"
                              value={despesa.data}
                              onChange={(e) => atualizarDespesa(despesa.id, 'data', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Pago por</Label>
                            <Select 
                              value={despesa.pago_por} 
                              onValueChange={(value) => atualizarDespesa(despesa.id, 'pago_por', value as 'Tripulante' | 'Cotista' | 'Share Brasil')}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Quem pagou?" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Tripulante">Tripulante</SelectItem>
                                <SelectItem value="Cotista">Cotista</SelectItem>
                                <SelectItem value="Share Brasil">Share Brasil</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Comprovante</Label>
                            <div className="space-y-2">
                              {despesa.comprovante_url ? (
                                <div className="flex items-center gap-2 p-2 border border-border rounded-md bg-card">
                                  <File className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground truncate flex-1">
                                    {despesa.comprovante_nome}
                                  </span>
                                  <div className="flex gap-1">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => window.open(despesa.comprovante_url, '_blank')}
                                      title="Visualizar"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removerComprovante(despesa.id)}
                                      title="Remover"
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="relative">
                                  <input
                                    type="file"
                                    id={`comprovante-${despesa.id}`}
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        handleFileUpload(despesa.id, file);
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={`comprovante-${despesa.id}`}
                                    className="flex items-center justify-center gap-2 w-full h-10 px-3 border border-border rounded-md bg-card hover:bg-accent hover:border-primary transition-colors cursor-pointer text-sm text-muted-foreground"
                                  >
                                    <Upload className="h-4 w-4" />
                                    Anexar
                                  </label>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end mt-3">
                          <Button 
                            type="button" 
                            onClick={() => removerDespesa(despesa.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Remover
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Resumo de Totais */}
                    <div className="border-t pt-4 space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span>Tripulante:</span>
                          <span className="font-semibold">{formatCurrency(formData.total_tripulante)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cotista:</span>
                          <span className="font-semibold">{formatCurrency(formData.total_cotista)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-medium">Total Geral:</span>
                        <span className="text-xl font-bold text-green-600">
                          {formatCurrency(formData.valor_total)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card de Observações e Finalização */}
            <Card className="mt-6 shadow-lg bg-card border-border">
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

                <div className="flex gap-4">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    {submitting ? 'Processando...' : 'Criar Relatório'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="historico" className="space-y-4">
          <Card className="shadow-lg bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Relatórios Emitidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {relatoriosSalvos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum relatório emitido ainda</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Cotista</TableHead>
                      <TableHead>Tripulante</TableHead>
                      <TableHead>Destino</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Criado por</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relatoriosSalvos.map((relatorio) => (
                      <TableRow key={relatorio.id}>
                        <TableCell className="font-medium">{relatorio.numero}</TableCell>
                        <TableCell>{relatorio.cotista}</TableCell>
                        <TableCell>{relatorio.tripulante}</TableCell>
                        <TableCell>{relatorio.destino}</TableCell>
                        <TableCell>
                          {formatDate(relatorio.data_inicio)} - {formatDate(relatorio.data_fim)}
                        </TableCell>
                        <TableCell className="font-semibold">{formatCurrency(relatorio.valor_total)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {relatorio.criado_por}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {relatorio.despesa_tripulante_id && (
                              <Badge className="bg-orange-100 text-orange-800 text-xs">
                                Ressarcimento Criado
                              </Badge>
                            )}
                            {relatorio.despesa_cotista_id && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                Cobrança Criada
                              </Badge>
                            )}
                            {relatorio.pdf_url && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                PDF Disponível
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => downloadPDF(relatorio)}
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              title="Visualizar Detalhes"
                            >
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
  );
}