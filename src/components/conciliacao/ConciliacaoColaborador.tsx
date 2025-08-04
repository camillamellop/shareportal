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
import { CheckCircle, AlertCircle, Clock, DollarSign, User, Edit, Plus } from "lucide-react";
import { toast } from "sonner";
import { conciliacaoService } from "@/services/conciliacaoService";
import { DespesaPendente, STATUS_DESPESA_CONFIG, FORMAS_PAGAMENTO } from "@/types/conciliacao";

export function ConciliacaoColaborador() {
  const [despesasColaboradores, setDespesasColaboradores] = useState<DespesaPendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDespesa, setSelectedDespesa] = useState<DespesaPendente | null>(null);
  const [showLancamentoModal, setShowLancamentoModal] = useState(false);
  const [showAtualizarModal, setShowAtualizarModal] = useState(false);

  // Formulário para lançamento manual
  const [lancamentoForm, setLancamentoForm] = useState({
    colaborador_nome: '',
    descricao: '',
    valor: 0,
    data_ocorrencia: new Date().toISOString().split('T')[0],
    observacoes: ''
  });

  // Formulário para atualizar status
  const [statusForm, setStatusForm] = useState({
    status: 'pendente_envio' as DespesaPendente['status'],
    data_envio: '',
    data_pagamento: '',
    forma_pagamento: '',
    observacoes: ''
  });

  useEffect(() => {
    loadDespesasColaboradores();
  }, []);

  const loadDespesasColaboradores = async () => {
    try {
      setLoading(true);
      const despesas = await conciliacaoService.obterDespesasPendentes({ categoria: 'colaborador' });
      setDespesasColaboradores(despesas);
    } catch (error) {
      console.error('Erro ao carregar despesas de colaboradores:', error);
      toast.error('Erro ao carregar despesas de colaboradores');
    } finally {
      setLoading(false);
    }
  };

  const handleCriarLancamento = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lancamentoForm.colaborador_nome || !lancamentoForm.descricao || !lancamentoForm.valor) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await conciliacaoService.criarLancamentoManual({
        categoria: 'colaborador',
        tipo: 'reembolso',
        pessoa_nome: lancamentoForm.colaborador_nome,
        descricao: lancamentoForm.descricao,
        valor: lancamentoForm.valor,
        data_ocorrencia: lancamentoForm.data_ocorrencia,
        observacoes: lancamentoForm.observacoes,
        gerar_despesa: true
      });

      toast.success('Lançamento criado e despesa pendente gerada!');
      
      setLancamentoForm({
        colaborador_nome: '',
        descricao: '',
        valor: 0,
        data_ocorrencia: new Date().toISOString().split('T')[0],
        observacoes: ''
      });
      
      setShowLancamentoModal(false);
      loadDespesasColaboradores();

    } catch (error) {
      console.error('Erro ao criar lançamento:', error);
      toast.error('Erro ao criar lançamento');
    }
  };

  const handleAtualizarStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDespesa) return;

    try {
      const dados: any = {
        observacoes: statusForm.observacoes
      };

      if (statusForm.status === 'enviado' && statusForm.data_envio) {
        dados.data_envio = statusForm.data_envio;
      }

      if (statusForm.status === 'pago' && statusForm.data_pagamento) {
        dados.data_pagamento = statusForm.data_pagamento;
        dados.forma_pagamento = statusForm.forma_pagamento;
      }

      await conciliacaoService.atualizarStatusDespesa(selectedDespesa.id, statusForm.status, dados);

      toast.success('Status atualizado com sucesso!');
      
      setShowAtualizarModal(false);
      setSelectedDespesa(null);
      loadDespesasColaboradores();

    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const abrirModalAtualizar = (despesa: DespesaPendente) => {
    setSelectedDespesa(despesa);
    setStatusForm({
      status: despesa.status,
      data_envio: despesa.data_envio || '',
      data_pagamento: despesa.data_pagamento || '',
      forma_pagamento: despesa.forma_pagamento || '',
      observacoes: despesa.observacoes || ''
    });
    setShowAtualizarModal(true);
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_DESPESA_CONFIG[status as keyof typeof STATUS_DESPESA_CONFIG];
    if (!config) return null;
    
    return (
      <Badge className={`${config.bgColor} ${config.color}`}>
        {config.icon} {config.label}
      </Badge>
    );
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

  const calcularResumo = () => {
    const totalPago = despesasColaboradores
      .filter(d => d.status === 'pago')
      .reduce((sum, d) => sum + d.valor, 0);
    
    const totalPendente = despesasColaboradores
      .filter(d => ['pendente_envio', 'enviado', 'pendente_pagamento'].includes(d.status))
      .reduce((sum, d) => sum + d.valor, 0);

    return { totalPago, totalPendente };
  };

  const { totalPago, totalPendente } = calcularResumo();

  return (
    <div className="space-y-6">
      {/* Resumo Colaboradores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pago</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalPago)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pendente</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(totalPendente)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reembolsos</p>
                <p className="text-2xl font-bold text-primary">
                  {despesasColaboradores.length}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Despesas de Colaboradores */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Reembolsos de Colaboradores
            </CardTitle>
            <Dialog open={showLancamentoModal} onOpenChange={setShowLancamentoModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Lançamento Manual
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Lançamento - Colaborador</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCriarLancamento} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="colaborador_nome">Nome do Colaborador *</Label>
                    <Input 
                      id="colaborador_nome"
                      value={lancamentoForm.colaborador_nome}
                      onChange={(e) => setLancamentoForm(prev => ({ ...prev, colaborador_nome: e.target.value }))}
                      placeholder="Nome do colaborador"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição *</Label>
                    <Textarea 
                      id="descricao"
                      value={lancamentoForm.descricao}
                      onChange={(e) => setLancamentoForm(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descrição do reembolso..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="valor">Valor (R$) *</Label>
                      <Input 
                        id="valor" 
                        type="number" 
                        step="0.01"
                        value={lancamentoForm.valor}
                        onChange={(e) => setLancamentoForm(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="data_ocorrencia">Data da Ocorrência</Label>
                      <Input 
                        id="data_ocorrencia" 
                        type="date"
                        value={lancamentoForm.data_ocorrencia}
                        onChange={(e) => setLancamentoForm(prev => ({ ...prev, data_ocorrencia: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea 
                      id="observacoes"
                      value={lancamentoForm.observacoes}
                      onChange={(e) => setLancamentoForm(prev => ({ ...prev, observacoes: e.target.value }))}
                      placeholder="Observações adicionais..."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowLancamentoModal(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      Criar Lançamento
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : despesasColaboradores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum reembolso de colaborador encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {despesasColaboradores.map((despesa) => (
                  <TableRow key={despesa.id}>
                    <TableCell>{formatDate(despesa.data_criacao)}</TableCell>
                    <TableCell className="font-medium">{despesa.colaborador_nome}</TableCell>
                    <TableCell>{despesa.descricao}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(despesa.valor)}</TableCell>
                    <TableCell>{getStatusBadge(despesa.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => abrirModalAtualizar(despesa)}
                        >
                          <Edit className="h-4 w-4" />
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

      {/* Modal para Atualizar Status */}
      <Dialog open={showAtualizarModal} onOpenChange={setShowAtualizarModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Status - {selectedDespesa?.colaborador_nome}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAtualizarStatus} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Novo Status</Label>
              <Select 
                value={statusForm.status}
                onValueChange={(value: any) => setStatusForm(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente_envio">Pendente de Envio</SelectItem>
                  <SelectItem value="enviado">Enviado</SelectItem>
                  <SelectItem value="pendente_pagamento">Pendente de Pagamento</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {statusForm.status === 'enviado' && (
              <div className="space-y-2">
                <Label htmlFor="data_envio">Data de Envio</Label>
                <Input 
                  id="data_envio" 
                  type="date"
                  value={statusForm.data_envio}
                  onChange={(e) => setStatusForm(prev => ({ ...prev, data_envio: e.target.value }))}
                />
              </div>
            )}

            {statusForm.status === 'pago' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="data_pagamento">Data de Pagamento</Label>
                  <Input 
                    id="data_pagamento" 
                    type="date"
                    value={statusForm.data_pagamento}
                    onChange={(e) => setStatusForm(prev => ({ ...prev, data_pagamento: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
                  <Select 
                    value={statusForm.forma_pagamento}
                    onValueChange={(value) => setStatusForm(prev => ({ ...prev, forma_pagamento: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMAS_PAGAMENTO.map(forma => (
                        <SelectItem key={forma.value} value={forma.value}>
                          {forma.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="observacoes_status">Observações</Label>
              <Textarea 
                id="observacoes_status"
                value={statusForm.observacoes}
                onChange={(e) => setStatusForm(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações sobre a atualização..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAtualizarModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Atualizar Status
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );  
} 