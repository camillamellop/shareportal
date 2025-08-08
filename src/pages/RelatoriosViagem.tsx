import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
<<<<<<< HEAD
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plane, Plus, Search, Filter, Eye, Download, Calendar, User, MapPin, Trash2, Upload, FileText } from "lucide-react";
import { PDFGenerator } from "@/utils/pdfGenerator";
import { relatorioViagemService, RelatorioViagem } from "@/services/firestore";
import { conciliacaoService } from "@/services/conciliacaoService";
import { AERONAVES, CATEGORIAS_DESPESA, PAGADORES } from "@/types/viagem";
import { toast } from "sonner";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/integrations/firebase/config";

interface DespesaViagem {
  id: string;
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  pago_por: 'Tripulante' | 'Cotista' | 'Share Brasil';
  comprovante_url?: string;
  comprovante_nome?: string;
  comprovante_file?: File;
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

const AERONAVES_LIST = [
  'PR-PT-OPC','PR-MDL','PS-AVE','PT-JPK','PT-OJG','PT-RVJ','PT-WSR','PP-JCP'
];

export default function RelatoriosViagem() {
  console.log("RelatoriosViagem component loaded");
  
=======
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plane, Plus, Search, Filter, Eye, Download, Calendar, User, MapPin, Mail } from "lucide-react";
import { relatorioViagemService, RelatorioViagem } from "@/services/firestore";
import { AERONAVES } from "@/types/viagem";
import RelatorioViagemForm from "@/pages/financeiro/RelatorioViagem";
import { toast } from "sonner";

export default function RelatoriosViagem() {
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
  const [relatorios, setRelatorios] = useState<RelatorioViagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAeronave, setFilterAeronave] = useState("todas");
  const [filterStatus, setFilterStatus] = useState("todos");
<<<<<<< HEAD
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
    criado_por: 'Usuario Atual',
    total_tripulante: 0,
    total_cotista: 0,
    total_share_brasil: 0,
    valor_total: 0
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      await loadRelatorios();
      await generateNextNumber();
    };
    
    initializeData();
=======

  useEffect(() => {
    loadRelatorios();
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
  }, []);

  const loadRelatorios = async () => {
    try {
      setLoading(true);
      const data = await relatorioViagemService.getAll();
      setRelatorios(data);
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
      toast.error("Erro ao carregar relatórios");
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const generateNextNumber = async () => {
    try {
      const todosRelatorios = await relatorioViagemService.getAll();
      const numeros = todosRelatorios
        .map(relatorio => {
          const numeroStr = relatorio.numero || relatorio.id || '';
          const match = numeroStr.match(/REL(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
        .filter(num => num > 0);
      
      const maiorNumero = numeros.length > 0 ? Math.max(...numeros) : 0;
      const proximoNumero = maiorNumero + 1;
      const numeroFormatado = `REL${proximoNumero.toString().padStart(3, '0')}`;
      
      const numeroExiste = todosRelatorios.some(relatorio => 
        relatorio.numero === numeroFormatado
      );
      
      if (numeroExiste) {
        const proximoNumeroUnico = proximoNumero + 1;
        const numeroFormatadoUnico = `REL${proximoNumeroUnico.toString().padStart(3, '0')}`;
        setFormData(prev => ({ ...prev, numero: numeroFormatadoUnico }));
      } else {
        setFormData(prev => ({ ...prev, numero: numeroFormatado }));
      }
    } catch (error) {
      console.error('Erro ao gerar número do relatório:', error);
      const timestamp = Date.now();
      const numeroFormatado = `REL${timestamp.toString().slice(-6)}`;
      setFormData(prev => ({ ...prev, numero: numeroFormatado }));
    }
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

  const handleComprovanteUpload = (id: string, file: File) => {
    const novasDespesas = formData.despesas.map(d => 
      d.id === id ? { 
        ...d, 
        comprovante_file: file,
        comprovante_nome: file.name 
      } : d
    );
    setFormData(prev => ({ ...prev, despesas: novasDespesas }));
  };

  const removerComprovante = (id: string) => {
    const novasDespesas = formData.despesas.map(d => 
      d.id === id ? { 
        ...d, 
        comprovante_file: undefined,
        comprovante_nome: undefined 
      } : d
    );
    setFormData(prev => ({ ...prev, despesas: novasDespesas }));
  };

  const calcularTotais = (despesas: DespesaViagem[]) => {
    const totais = {
      tripulante: 0,
      cotista: 0,
      share_brasil: 0,
      total: 0
    };

    despesas.forEach(despesa => {
      totais[despesa.pago_por.toLowerCase() as keyof typeof totais] += despesa.valor;
      totais.total += despesa.valor;
    });

    setFormData(prev => ({
      ...prev,
      total_tripulante: totais.tripulante,
      total_cotista: totais.cotista,
      total_share_brasil: totais.share_brasil,
      valor_total: totais.total
    }));
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

  const uploadComprovantes = async (despesas: DespesaViagem[]) => {
    const despesasComComprovantes = [];
    
    for (const despesa of despesas) {
      if (despesa.comprovante_file) {
        try {
          const storageRef = ref(storage, `comprovantes/${relatorio.numero}/${despesa.id}_${despesa.comprovante_file.name}`);
          const snapshot = await uploadBytes(storageRef, despesa.comprovante_file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          
          despesasComComprovantes.push({
            ...despesa,
            comprovante_url: downloadURL,
            comprovante_nome: despesa.comprovante_file.name
          });
        } catch (error) {
          console.error('Erro ao fazer upload do comprovante:', error);
          toast.error(`Erro ao fazer upload do comprovante: ${despesa.comprovante_file.name}`);
          despesasComComprovantes.push(despesa);
        }
      } else {
        despesasComComprovantes.push(despesa);
      }
    }
    
    return despesasComComprovantes;
  };

  const criarDespesasConciliacao = async (relatorio: RelatorioViagemForm) => {
    if (relatorio.total_cotista > 0) {
      try {
        await conciliacaoService.criarDespesaPendente({
          categoria: 'cliente',
          tipo: 'lancamento_manual',
          origem_id: `relatorio_${relatorio.numero}_cotista`,
          numero_documento: relatorio.numero,
          cliente_nome: relatorio.cotista,
          descricao: `[COBRANÇA] Relatório de viagem ${relatorio.numero} - ${relatorio.destino}`,
          valor: relatorio.total_cotista,
          data_criacao: new Date().toISOString().split('T')[0],
          data_vencimento: new Date().toISOString().split('T')[0],
          status: 'pendente_envio',
          observacoes: `Cobrança do cotista ${relatorio.cotista} - Relatório ${relatorio.numero}`,
          forma_pagamento: 'pix',
          comprovante_envio: '',
          comprovante_pagamento: '',
          data_envio: '',
          data_pagamento: '',
          conta_bancaria: ''
        });
        toast.success(`Despesa a receber criada para ${relatorio.cotista}`);
      } catch (error) {
        console.error('Erro ao criar despesa do cotista:', error);
        toast.error('Erro ao criar despesa do cotista');
      }
    }

    if (relatorio.total_tripulante > 0) {
      try {
        await conciliacaoService.criarDespesaPendente({
          categoria: 'colaborador',
          tipo: 'lancamento_manual',
          origem_id: `relatorio_${relatorio.numero}_tripulante`,
          numero_documento: relatorio.numero,
          colaborador_nome: relatorio.tripulante,
          descricao: `[RESSARCIMENTO] Relatório de viagem ${relatorio.numero} - ${relatorio.destino}`,
          valor: relatorio.total_tripulante,
          data_criacao: new Date().toISOString().split('T')[0],
          data_vencimento: new Date().toISOString().split('T')[0],
          status: 'pendente_envio',
          observacoes: `Ressarcimento do tripulante ${relatorio.tripulante} - Relatório ${relatorio.numero}`,
          forma_pagamento: 'pix',
          comprovante_envio: '',
          comprovante_pagamento: '',
          data_envio: '',
          data_pagamento: '',
          conta_bancaria: ''
        });
        toast.success(`Despesa a pagar criada para ${relatorio.tripulante}`);
      } catch (error) {
        console.error('Erro ao criar despesa do tripulante:', error);
        toast.error('Erro ao criar despesa do tripulante');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cotista || !formData.tripulante || !formData.destino || 
        !formData.data_inicio || !formData.data_fim || formData.despesas.length === 0) {
      toast.error('Preencha todos os campos obrigatórios e adicione pelo menos uma despesa');
      return;
    }

    try {
      const todosRelatorios = await relatorioViagemService.getAll();
      const numeroExiste = todosRelatorios.some(relatorio => 
        relatorio.numero === formData.numero
      );
      
      if (numeroExiste) {
        toast.error('Este número de relatório já existe. Gerando novo número...');
        await generateNextNumber();
        return;
      }
    } catch (error) {
      console.error('Erro ao verificar número único:', error);
      toast.error('Erro ao verificar número único');
      return;
    }

    setSubmitting(true);

    try {
      await gerarPDF(formData);
      await criarDespesasConciliacao(formData);
      
      const relatorioData: Omit<RelatorioViagem, 'id' | 'createdAt' | 'updatedAt'> = {
        numero: formData.numero,
        cotista: formData.cotista,
        aeronave: formData.aeronave,
        tripulante: formData.tripulante,
        destino: formData.destino,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim,
        despesas: formData.despesas,
        total_combustivel: formData.despesas.filter(d => d.categoria === 'Combustível').reduce((sum, d) => sum + d.valor, 0),
        total_hospedagem: formData.despesas.filter(d => d.categoria === 'Hospedagem').reduce((sum, d) => sum + d.valor, 0),
        total_alimentacao: formData.despesas.filter(d => d.categoria === 'Alimentação').reduce((sum, d) => sum + d.valor, 0),
        total_transporte: formData.despesas.filter(d => d.categoria === 'Transporte').reduce((sum, d) => sum + d.valor, 0),
        total_outros: formData.despesas.filter(d => !['Combustível', 'Hospedagem', 'Alimentação', 'Transporte'].includes(d.categoria)).reduce((sum, d) => sum + d.valor, 0),
        total_tripulante: formData.total_tripulante,
        total_cotista: formData.total_cotista,
        total_share_brasil: formData.total_share_brasil,
        valor_total: formData.valor_total,
        observacoes: formData.observacoes,
        status: 'pendente'
      };

      await relatorioViagemService.create(relatorioData);
      
      toast.success('Relatório criado com sucesso!');
      setShowForm(false);
      await loadRelatorios();
      
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
      await generateNextNumber();
      
    } catch (error) {
      console.error('Erro ao criar relatório:', error);
      toast.error('Erro ao criar relatório');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPDF = async (relatorio: RelatorioViagem) => {
    try {
      await PDFGenerator.generateRelatorioViagemPDF({
        numero: relatorio.numero || relatorio.id,
        colaborador_nome: relatorio.tripulante,
        valor_total: relatorio.valor_total,
        descricao: relatorio.observacoes || '',
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
      
      toast.success('PDF do relatório gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF do relatório:', error);
      toast.error('Erro ao gerar PDF do relatório');
=======
  const handleCreateRelatorio = async (data: RelatorioViagem) => {
    try {
      setShowForm(false);
      await loadRelatorios();
      toast.success("Relatório criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar relatório:", error);
      toast.error("Erro ao criar relatório");
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejeitado':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'aprovado':
        return 'Aprovado';
      case 'rejeitado':
        return 'Rejeitado';
      default:
        return 'Pendente';
    }
  };

  const calculateDays = (dataInicio: string, dataFim: string) => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const filteredRelatorios = relatorios.filter(relatorio => {
    const matchesSearch = 
      relatorio.cotista.toLowerCase().includes(searchTerm.toLowerCase()) ||
      relatorio.tripulante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      relatorio.destino.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAeronave = filterAeronave === "todas" || relatorio.aeronave === filterAeronave;
    const matchesStatus = filterStatus === "todos" || relatorio.status === filterStatus;

    return matchesSearch && matchesAeronave && matchesStatus;
  });

  const formatDate = (timestamp: any) => {
    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleDateString('pt-BR');
    }
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString('pt-BR');
    }
    return new Date(timestamp).toLocaleDateString('pt-BR');
  };

<<<<<<< HEAD
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

=======
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
  return (
    <Layout>
      <div className="p-6 space-y-6">
        {!showForm ? (
          <>
<<<<<<< HEAD
=======
            {/* Header */}
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Relatórios de Viagem</h1>
                <p className="text-muted-foreground">Gerencie relatórios de viagem e despesas</p>
              </div>
              
<<<<<<< HEAD
              <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Criar Relatório
              </Button>
            </div>

=======
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => window.open('https://webmail-seguro.com.br/?_task=mail&_mbox=INBOX', '_blank')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar por Email
                </Button>
              </div>
            </div>

            {/* Filtros */}
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Buscar</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="search"
                        placeholder="Cotista, tripulante ou destino..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="aeronave">Aeronave</Label>
                    <Select value={filterAeronave} onValueChange={setFilterAeronave}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as aeronaves" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas as aeronaves</SelectItem>
<<<<<<< HEAD
                        {AERONAVES_LIST.map(aeronave => (
=======
                        {AERONAVES.map(aeronave => (
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
                          <SelectItem key={aeronave} value={aeronave}>{aeronave}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os status</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="aprovado">Aprovado</SelectItem>
                        <SelectItem value="rejeitado">Rejeitado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

<<<<<<< HEAD
=======
            {/* Lista de Relatórios */}
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4">Carregando relatórios...</p>
              </div>
            ) : filteredRelatorios.length > 0 ? (
<<<<<<< HEAD
              <div className="space-y-4">
=======
              <div className="grid gap-4">
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
                {filteredRelatorios.map((relatorio) => (
                  <Card key={relatorio.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            <Plane className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold">
<<<<<<< HEAD
                              {relatorio.numero || relatorio.id} - {relatorio.cotista} - {relatorio.destino}
=======
                              {relatorio.cotista} - {relatorio.destino}
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
                            </h3>
                            <Badge className={getStatusColor(relatorio.status)}>
                              {getStatusText(relatorio.status)}
                            </Badge>
                          </div>
                          
                          <div className="grid md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>{relatorio.tripulante}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Plane className="w-4 h-4" />
                              <span>{relatorio.aeronave}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{relatorio.destino}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{calculateDays(relatorio.data_inicio, relatorio.data_fim)} dias</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm">
<<<<<<< HEAD
                            <span className="font-medium">Total: {formatCurrency(relatorio.valor_total)}</span>
=======
                            <span className="font-medium">Total: R$ {relatorio.valor_total.toFixed(2)}</span>
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
                            <span className="text-muted-foreground">
                              {formatDate(relatorio.createdAt)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </Button>
<<<<<<< HEAD
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadPDF(relatorio)}
                          >
=======
                          <Button variant="outline" size="sm">
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
                            <Download className="w-4 h-4 mr-2" />
                            Exportar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Plane className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum relatório encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || filterAeronave !== "todas" || filterStatus !== "todos"
                      ? "Tente ajustar os filtros de busca"
                      : "Crie seu primeiro relatório de viagem"
                    }
                  </p>
                  {!searchTerm && filterAeronave === "todas" && filterStatus === "todos" && (
                    <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Relatório
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <>
<<<<<<< HEAD
=======
            {/* Header do Formulário */}
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Novo Relatório de Viagem</h1>
                <p className="text-muted-foreground">Preencha os dados do relatório</p>
              </div>
              
              <Button 
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Voltar para Lista
              </Button>
            </div>

<<<<<<< HEAD
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
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
                      <div className="relative">
                        <Input 
                          id="numero"
                          value={formData.numero}
                          onChange={(e) => handleInputChange('numero', e.target.value)}
                          placeholder="Ex: REL001"
                          className="pr-20"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Badge variant="secondary" className="text-xs">
                            Auto
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Número gerado automaticamente
                      </p>
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
                          {AERONAVES_LIST.map(aeronave => (
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
                        placeholder="Destino da viagem"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea 
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => handleInputChange('observacoes', e.target.value)}
                      placeholder="Observações sobre a viagem..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Despesas da Viagem
                    </CardTitle>
                    <Button type="button" onClick={adicionarDespesa} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Despesa
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.despesas.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma despesa adicionada. Clique em "Adicionar Despesa" para começar.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {formData.despesas.map((despesa, index) => (
                        <div key={despesa.id} className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Despesa #{index + 1}</h4>
                            <Button 
                              type="button"
                              variant="outline" 
                              size="sm"
                              onClick={() => removerDespesa(despesa.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="grid md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label>Categoria</Label>
                              <Select 
                                value={despesa.categoria} 
                                onValueChange={(value) => atualizarDespesa(despesa.id, 'categoria', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {CATEGORIAS_DESPESA.map(categoria => (
                                    <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                              <Label>Valor</Label>
                              <Input 
                                type="number"
                                step="0.01"
                                value={despesa.valor}
                                onChange={(e) => atualizarDespesa(despesa.id, 'valor', parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Pago por</Label>
                              <Select 
                                value={despesa.pago_por} 
                                onValueChange={(value) => atualizarDespesa(despesa.id, 'pago_por', value as any)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {PAGADORES.map(pagador => (
                                    <SelectItem key={pagador} value={pagador}>{pagador}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Input 
                              value={despesa.descricao}
                              onChange={(e) => atualizarDespesa(despesa.id, 'descricao', e.target.value)}
                              placeholder="Descrição da despesa..."
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Comprovante</Label>
                            <div className="flex items-center gap-2">
                              <Input 
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleComprovanteUpload(despesa.id, file);
                                  }
                                }}
                                className="flex-1"
                              />
                              {despesa.comprovante_nome && (
                                <Button 
                                  type="button"
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => removerComprovante(despesa.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                            {despesa.comprovante_nome && (
                              <p className="text-xs text-muted-foreground">
                                Comprovante: {despesa.comprovante_nome}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Formatos aceitos: PDF, JPG, JPEG, PNG, DOC, DOCX
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo dos Totais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Tripulante</p>
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(formData.total_tripulante)}</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Cotista</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(formData.total_cotista)}</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Share Brasil</p>
                      <p className="text-2xl font-bold text-purple-600">{formatCurrency(formData.total_share_brasil)}</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Geral</p>
                      <p className="text-2xl font-bold text-orange-600">{formatCurrency(formData.valor_total)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitting ? 'Salvando...' : 'Salvar Relatório'}
                </Button>
              </div>
            </form>
=======
            {/* Formulário */}
            <RelatorioViagemForm />
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
          </>
        )}
      </div>
    </Layout>
  );
} 