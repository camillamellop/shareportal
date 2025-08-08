import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Fuel, Plus, Search, Filter, Download, Upload, Calendar, DollarSign, FileText, Mail, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { abastecimentoService, Abastecimento as AbastecimentoType } from '@/services/abastecimentoService';
import { executarSeedAbastecimento } from '@/utils/seedAbastecimento';

interface Abastecimento {
  id: string;
  acft: string; // Matrícula da aeronave
  cotista: string;
  dataAbastecimento: string;
  abastecedor: string;
  numeroComanda: string;
  litros: number;
  valorUnitario: number;
  total: number;
  numeroFiscal: string;
  numeroBoleto: string;
  vencimento: string;
  email: boolean;
  rateio: boolean;
  observacoes: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function ControleAbastecimento() {
  const [abastecimentos, setAbastecimentos] = useState<Abastecimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAircraft, setFilterAircraft] = useState('all');
  const [filterCotista, setFilterCotista] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAbastecimento, setEditingAbastecimento] = useState<Abastecimento | null>(null);

  // Dados mockados baseados no Excel
  const mockData: Abastecimento[] = [
    {
      id: '1',
      acft: 'PR-MDL',
      cotista: 'João Silva',
      dataAbastecimento: '2024-08-01',
      abastecedor: 'Posto Aeroporto Congonhas',
      numeroComanda: 'COM001',
      litros: 500,
      valorUnitario: 6.67,
      total: 3337.50,
      numeroFiscal: 'NF001',
      numeroBoleto: 'BOL001',
      vencimento: '2024-08-15',
      email: true,
      rateio: false,
      observacoes: 'SBCY - SWJN 28/05',
      createdAt: new Date('2024-08-01'),
      updatedAt: new Date('2024-08-01')
    },
    {
      id: '2',
      acft: 'PT-OPC',
      cotista: 'Maria Santos',
      dataAbastecimento: '2024-08-02',
      abastecedor: 'Posto Aeroporto Santos Dumont',
      numeroComanda: 'COM002',
      litros: 800,
      valorUnitario: 6.50,
      total: 5200.00,
      numeroFiscal: 'NF002',
      numeroBoleto: 'BOL002',
      vencimento: '2024-08-20',
      email: true,
      rateio: false,
      observacoes: 'SEM BOLETO',
      createdAt: new Date('2024-08-02'),
      updatedAt: new Date('2024-08-02')
    },
    {
      id: '3',
      acft: 'PS-AVE',
      cotista: 'Carlos Oliveira',
      dataAbastecimento: '2024-08-03',
      abastecedor: 'Posto Aeroporto Guarulhos',
      numeroComanda: 'COM003',
      litros: 600,
      valorUnitario: 6.80,
      total: 4080.00,
      numeroFiscal: 'NF003',
      numeroBoleto: 'BOL003',
      vencimento: '2024-08-25',
      email: false,
      rateio: true,
      observacoes: 'SEM COMANDA E BOLETO',
      createdAt: new Date('2024-08-03'),
      updatedAt: new Date('2024-08-03')
    }
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await abastecimentoService.getAll();
        setAbastecimentos(data);
        logger.info('Dados de abastecimento carregados do Firestore', { count: data.length });
      } catch (error) {
        logger.error('Erro ao carregar dados de abastecimento', error);
        toast.error('Erro ao carregar dados de abastecimento');
        // Fallback para dados mockados em caso de erro
        setAbastecimentos(mockData);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredAbastecimentos = abastecimentos.filter(abastecimento => {
    const matchesSearch = 
      abastecimento.acft.toLowerCase().includes(searchTerm.toLowerCase()) ||
      abastecimento.cotista.toLowerCase().includes(searchTerm.toLowerCase()) ||
      abastecimento.abastecedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      abastecimento.numeroComanda.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAircraft = !filterAircraft || filterAircraft === 'all' || abastecimento.acft === filterAircraft;
    const matchesCotista = !filterCotista || filterCotista === 'all' || abastecimento.cotista === filterCotista;

    return matchesSearch && matchesAircraft && matchesCotista;
  });

  const totalLitros = filteredAbastecimentos.reduce((sum, item) => sum + item.litros, 0);
  const totalValor = filteredAbastecimentos.reduce((sum, item) => sum + item.total, 0);
  const pendentesEmail = filteredAbastecimentos.filter(item => !item.email).length;
  const pendentesRateio = filteredAbastecimentos.filter(item => item.rateio).length;

  const handleSaveAbastecimento = async (data: Omit<Abastecimento, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingAbastecimento) {
        // Atualizar existente
        await abastecimentoService.update(editingAbastecimento.id, data);
        setAbastecimentos(prev => 
          prev.map(item => item.id === editingAbastecimento.id 
            ? { ...item, ...data, updatedAt: new Date() } 
            : item
          )
        );
        toast.success('Abastecimento atualizado com sucesso');
      } else {
        // Criar novo
        const newId = await abastecimentoService.create(data);
        const newAbastecimento: Abastecimento = {
          ...data,
          id: newId,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setAbastecimentos(prev => [newAbastecimento, ...prev]);
        toast.success('Abastecimento registrado com sucesso');
      }
      
      setIsModalOpen(false);
      setEditingAbastecimento(null);
      logger.info('Abastecimento salvo no Firestore', { id: editingAbastecimento?.id || 'new' });
    } catch (error) {
      logger.error('Erro ao salvar abastecimento', error);
      toast.error('Erro ao salvar abastecimento');
    }
  };

  const handleDeleteAbastecimento = async (id: string) => {
    try {
      await abastecimentoService.delete(id);
      setAbastecimentos(prev => prev.filter(item => item.id !== id));
      toast.success('Abastecimento excluído com sucesso');
      logger.info('Abastecimento excluído do Firestore', { id });
    } catch (error) {
      logger.error('Erro ao excluir abastecimento', error);
      toast.error('Erro ao excluir abastecimento');
    }
  };

  const handleSeedData = async () => {
    try {
      setLoading(true);
      const result = await executarSeedAbastecimento();
      toast.success(`Seed concluído: ${result.sucessos} sucessos, ${result.erros} erros`);
      
      // Recarregar dados
      const data = await abastecimentoService.getAll();
      setAbastecimentos(data);
    } catch (error) {
      logger.error('Erro ao executar seed', error);
      toast.error('Erro ao executar seed');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Fuel className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Controle de Abastecimento</h1>
              <p className="text-muted-foreground">Gerencie os registros de abastecimento das aeronaves</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingAbastecimento(null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Abastecimento
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingAbastecimento ? 'Editar Abastecimento' : 'Novo Abastecimento'}
                  </DialogTitle>
                </DialogHeader>
                <AbastecimentoForm 
                  abastecimento={editingAbastecimento}
                  onSave={handleSaveAbastecimento}
                  onCancel={() => setIsModalOpen(false)}
                />
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="outline" 
              onClick={handleSeedData}
              disabled={loading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Popular Dados
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Fuel className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total de Registros</p>
                  <p className="text-2xl font-bold">{filteredAbastecimentos.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total em Litros</p>
                  <p className="text-2xl font-bold">{totalLitros.toLocaleString()} L</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalValor)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold">{pendentesEmail + pendentesRateio}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Buscar por aeronave, cotista, abastecedor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="w-full md:w-48">
                <Label htmlFor="aircraft">Aeronave</Label>
                <Select value={filterAircraft} onValueChange={setFilterAircraft}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as aeronaves" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as aeronaves</SelectItem>
                    <SelectItem value="PR-MDL">PR-MDL</SelectItem>
                    <SelectItem value="PT-OPC">PT-OPC</SelectItem>
                    <SelectItem value="PS-AVE">PS-AVE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-48">
                <Label htmlFor="cotista">Cotista</Label>
                <Select value={filterCotista} onValueChange={setFilterCotista}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os cotistas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os cotistas</SelectItem>
                    <SelectItem value="João Silva">João Silva</SelectItem>
                    <SelectItem value="Maria Santos">Maria Santos</SelectItem>
                    <SelectItem value="Carlos Oliveira">Carlos Oliveira</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Registros de Abastecimento</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ACFT</TableHead>
                      <TableHead>COTISTA</TableHead>
                      <TableHead>DATA ABASTECIMENTO</TableHead>
                      <TableHead>ABASTECEDOR</TableHead>
                      <TableHead>Nº COMANDA</TableHead>
                      <TableHead>LITROS</TableHead>
                      <TableHead>VALOR UNIT</TableHead>
                      <TableHead>TOTAL</TableHead>
                      <TableHead>Nº FISCAL</TableHead>
                      <TableHead>Nº BOLETO</TableHead>
                      <TableHead>VENCIMENTO</TableHead>
                      <TableHead>EMAIL</TableHead>
                      <TableHead>RATEIO</TableHead>
                      <TableHead>OBSERVAÇÕES</TableHead>
                      <TableHead>AÇÕES</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAbastecimentos.map((abastecimento) => (
                      <TableRow key={abastecimento.id}>
                        <TableCell className="font-medium">{abastecimento.acft}</TableCell>
                        <TableCell>{abastecimento.cotista}</TableCell>
                        <TableCell>{formatDate(abastecimento.dataAbastecimento)}</TableCell>
                        <TableCell>{abastecimento.abastecedor}</TableCell>
                        <TableCell>{abastecimento.numeroComanda}</TableCell>
                        <TableCell>{abastecimento.litros.toLocaleString()}</TableCell>
                        <TableCell>{formatCurrency(abastecimento.valorUnitario)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(abastecimento.total)}</TableCell>
                        <TableCell>{abastecimento.numeroFiscal}</TableCell>
                        <TableCell>{abastecimento.numeroBoleto}</TableCell>
                        <TableCell>{formatDate(abastecimento.vencimento)}</TableCell>
                        <TableCell>
                          <Badge variant={abastecimento.email ? "default" : "destructive"}>
                            {abastecimento.email ? "SIM" : "NÃO"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={abastecimento.rateio ? "secondary" : "outline"}>
                            {abastecimento.rateio ? "SIM" : "NÃO"}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={abastecimento.observacoes}>
                          {abastecimento.observacoes}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingAbastecimento(abastecimento);
                                setIsModalOpen(true);
                              }}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteAbastecimento(abastecimento.id)}
                            >
                              Excluir
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

// Componente do formulário
interface AbastecimentoFormProps {
  abastecimento: Abastecimento | null;
  onSave: (data: Omit<Abastecimento, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

function AbastecimentoForm({ abastecimento, onSave, onCancel }: AbastecimentoFormProps) {
  const [formData, setFormData] = useState({
    acft: abastecimento?.acft || '',
    cotista: abastecimento?.cotista || '',
    dataAbastecimento: abastecimento?.dataAbastecimento || '',
    abastecedor: abastecimento?.abastecedor || '',
    numeroComanda: abastecimento?.numeroComanda || '',
    litros: abastecimento?.litros || 0,
    valorUnitario: abastecimento?.valorUnitario || 0,
    total: abastecimento?.total || 0,
    numeroFiscal: abastecimento?.numeroFiscal || '',
    numeroBoleto: abastecimento?.numeroBoleto || '',
    vencimento: abastecimento?.vencimento || '',
    email: abastecimento?.email || false,
    rateio: abastecimento?.rateio || false,
    observacoes: abastecimento?.observacoes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleLitrosChange = (value: string) => {
    const litros = parseFloat(value) || 0;
    const total = litros * formData.valorUnitario;
    setFormData(prev => ({ ...prev, litros, total }));
  };

  const handleValorUnitarioChange = (value: string) => {
    const valorUnitario = parseFloat(value) || 0;
    const total = formData.litros * valorUnitario;
    setFormData(prev => ({ ...prev, valorUnitario, total }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="acft">Aeronave (ACFT)</Label>
          <Input
            id="acft"
            value={formData.acft}
            onChange={(e) => setFormData(prev => ({ ...prev, acft: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="cotista">Cotista</Label>
          <Input
            id="cotista"
            value={formData.cotista}
            onChange={(e) => setFormData(prev => ({ ...prev, cotista: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="dataAbastecimento">Data de Abastecimento</Label>
          <Input
            id="dataAbastecimento"
            type="date"
            value={formData.dataAbastecimento}
            onChange={(e) => setFormData(prev => ({ ...prev, dataAbastecimento: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="abastecedor">Abastecedor</Label>
          <Input
            id="abastecedor"
            value={formData.abastecedor}
            onChange={(e) => setFormData(prev => ({ ...prev, abastecedor: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="numeroComanda">Nº Comanda</Label>
          <Input
            id="numeroComanda"
            value={formData.numeroComanda}
            onChange={(e) => setFormData(prev => ({ ...prev, numeroComanda: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="litros">Litros</Label>
          <Input
            id="litros"
            type="number"
            step="0.01"
            value={formData.litros}
            onChange={(e) => handleLitrosChange(e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="valorUnitario">Valor Unitário</Label>
          <Input
            id="valorUnitario"
            type="number"
            step="0.01"
            value={formData.valorUnitario}
            onChange={(e) => handleValorUnitarioChange(e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="total">Total</Label>
          <Input
            id="total"
            type="number"
            step="0.01"
            value={formData.total}
            readOnly
            className="bg-muted"
          />
        </div>
        
        <div>
          <Label htmlFor="numeroFiscal">Nº Fiscal</Label>
          <Input
            id="numeroFiscal"
            value={formData.numeroFiscal}
            onChange={(e) => setFormData(prev => ({ ...prev, numeroFiscal: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="numeroBoleto">Nº Boleto</Label>
          <Input
            id="numeroBoleto"
            value={formData.numeroBoleto}
            onChange={(e) => setFormData(prev => ({ ...prev, numeroBoleto: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="vencimento">Vencimento</Label>
          <Input
            id="vencimento"
            type="date"
            value={formData.vencimento}
            onChange={(e) => setFormData(prev => ({ ...prev, vencimento: e.target.value }))}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="email"
            checked={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.checked }))}
          />
          <Label htmlFor="email">Email enviado</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="rateio"
            checked={formData.rateio}
            onChange={(e) => setFormData(prev => ({ ...prev, rateio: e.target.checked }))}
          />
          <Label htmlFor="rateio">Rateio</Label>
        </div>
      </div>
      
      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
          rows={3}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {abastecimento ? 'Atualizar' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}
