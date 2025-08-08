import { Layout } from "@/components/layout/Layout";
import { TripulacaoCard } from "@/components/tripulacao/TripulacaoCard";
import { ValoresHorasVoo } from "@/components/tripulacao/ValoresHorasVoo";
import { HorasVooTripulante } from "@/components/tripulacao/HorasVooTripulante";
import { Plus, Search, Users, Clock, DollarSign, ArrowLeft, Edit, X } from "lucide-react";
import { useState, useEffect } from "react";
import { tripulacaoService } from "@/services/tripulacaoService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Tripulante {
  id: string;
  nome: string;
  cargo: string;
  cpf: string;
  telefone: string;
  email: string;
  cht: {
    numero: string;
    vencimento: string;
    status: 'valido' | 'vencido' | 'proximo_vencimento';
  };
  cma: {
    numero: string;
    vencimento: string;
    status: 'valido' | 'vencido' | 'proximo_vencimento';
  };
  foto?: string;
  status: 'ativo' | 'inativo' | 'afastado';
}

export default function GestaoTripulacao() {
  const [tripulantes, setTripulantes] = useState<Tripulante[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("tripulantes");
  const [selectedTripulante, setSelectedTripulante] = useState<string | null>(null);
  
  // Estados para modais
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTripulante, setEditingTripulante] = useState<Tripulante | null>(null);
  
  // Formulário
  const [form, setForm] = useState({
    nome: "",
    cargo: "",
    cpf: "",
    telefone: "",
    email: "",
    cht_numero: "",
    cht_vencimento: "",
    cma_numero: "",
    cma_vencimento: "",
    status: "ativo" as const
  });

  useEffect(() => {
    loadTripulantes();
  }, []);

  const loadTripulantes = async () => {
      try {
        setLoading(true);
      const data = await tripulacaoService.buscarTripulantes();
      setTripulantes(data);
      } catch (error) {
      console.error("Erro ao carregar tripulantes:", error);
      toast.error("Erro ao carregar tripulantes");
      } finally {
        setLoading(false);
      }
    };

  const handleViewHoras = (tripulanteNome: string) => {
    setSelectedTripulante(tripulanteNome);
    setActiveTab("horas-tripulante");
  };

  const handleBackToTripulantes = () => {
    setSelectedTripulante(null);
    setActiveTab("tripulantes");
  };

  const handleEditTripulante = (tripulante: Tripulante) => {
    setEditingTripulante(tripulante);
    setForm({
      nome: tripulante.nome,
      cargo: tripulante.cargo,
      cpf: tripulante.cpf,
      telefone: tripulante.telefone,
      email: tripulante.email,
      cht_numero: tripulante.cht.numero,
      cht_vencimento: tripulante.cht.vencimento,
      cma_numero: tripulante.cma.numero,
      cma_vencimento: tripulante.cma.vencimento,
      status: tripulante.status
    });
    setShowEditModal(true);
  };

  const handleAddTripulante = () => {
    setForm({
      nome: "",
      cargo: "",
      cpf: "",
      telefone: "",
      email: "",
      cht_numero: "",
      cht_vencimento: "",
      cma_numero: "",
      cma_vencimento: "",
      status: "ativo"
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.nome || !form.cargo || !form.cpf || !form.telefone || !form.email) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const tripulanteData = {
        nome: form.nome,
        cargo: form.cargo,
        cpf: form.cpf,
        telefone: form.telefone,
        email: form.email,
        cht: {
          numero: form.cht_numero,
          vencimento: form.cht_vencimento,
          status: 'valido' as const
        },
        cma: {
          numero: form.cma_numero,
          vencimento: form.cma_vencimento,
          status: 'valido' as const
        },
        status: form.status
      };

      if (editingTripulante) {
        // Atualizar tripulante existente
        await tripulacaoService.atualizarTripulante(editingTripulante.id, tripulanteData);
        toast.success("Tripulante atualizado com sucesso!");
      } else {
        // Criar novo tripulante
        await tripulacaoService.criarTripulante(tripulanteData);
        toast.success("Tripulante criado com sucesso!");
      }

      setShowAddModal(false);
      setShowEditModal(false);
      setEditingTripulante(null);
      loadTripulantes();
    } catch (error) {
      console.error("Erro ao salvar tripulante:", error);
      toast.error("Erro ao salvar tripulante");
    }
  };

  const resetForm = () => {
    setForm({
      nome: "",
      cargo: "",
      cpf: "",
      telefone: "",
      email: "",
      cht_numero: "",
      cht_vencimento: "",
      cma_numero: "",
      cma_vencimento: "",
      status: "ativo"
    });
    setEditingTripulante(null);
  };

  const filteredTripulantes = tripulantes.filter(tripulante =>
    tripulante.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tripulante.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-6"></div>
              <p className="text-lg text-muted-foreground font-medium">Carregando tripulantes...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestão de Tripulação</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie tripulantes, horas de voo e valores por aeronave
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tripulantes" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Tripulantes
            </TabsTrigger>
            <TabsTrigger value="valores-horas" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Valores/Hora
            </TabsTrigger>
            <TabsTrigger value="horas-tripulante" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Horas/Tripulante
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tripulantes" className="space-y-6">
            {/* Header da aba Tripulantes */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Tripulantes</h2>
                <p className="text-muted-foreground mt-1">
                  Gerencie informações dos tripulantes
                </p>
              </div>
              <Button onClick={handleAddTripulante}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Tripulante
              </Button>
            </div>

            {/* Busca */}
          <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle>Buscar Tripulantes</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome ou cargo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Grid de Tripulantes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredTripulantes.map((tripulante) => (
                <TripulacaoCard 
                  key={tripulante.id} 
                  tripulante={tripulante}
                  onViewHoras={handleViewHoras}
                  onEdit={() => handleEditTripulante(tripulante)}
                />
              ))}
            </div>

            {filteredTripulantes.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Nenhum tripulante encontrado</p>
                <p className="text-sm">Adicione tripulantes para começar</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="valores-horas" className="space-y-6">
            <ValoresHorasVoo />
          </TabsContent>

          <TabsContent value="horas-tripulante" className="space-y-6">
            {selectedTripulante ? (
              <div className="space-y-6">
                {/* Header com botão voltar */}
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    onClick={handleBackToTripulantes}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar aos Tripulantes
                  </Button>
                <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Horas de Voo - {selectedTripulante}
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Controle as horas voadas por mês
                    </p>
                  </div>
                </div>

                {/* Componente de Horas de Voo */}
                <HorasVooTripulante tripulanteFiltrado={selectedTripulante} />
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Selecione um Tripulante</p>
                <p className="text-sm">Clique no ícone de relógio no card de um tripulante para ver suas horas</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Modal Adicionar Tripulante */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Tripulante</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={form.nome}
                    onChange={(e) => setForm(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Nome completo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo *</Label>
                  <Input
                    id="cargo"
                    value={form.cargo}
                    onChange={(e) => setForm(prev => ({ ...prev, cargo: e.target.value }))}
                    placeholder="Ex: Comandante"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={form.cpf}
                    onChange={(e) => setForm(prev => ({ ...prev, cpf: e.target.value }))}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={form.telefone}
                    onChange={(e) => setForm(prev => ({ ...prev, telefone: e.target.value }))}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cht_numero">Número CHT</Label>
                  <Input
                    id="cht_numero"
                    value={form.cht_numero}
                    onChange={(e) => setForm(prev => ({ ...prev, cht_numero: e.target.value }))}
                    placeholder="Número do CHT"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cht_vencimento">Vencimento CHT</Label>
                  <Input
                    id="cht_vencimento"
                    type="date"
                    value={form.cht_vencimento}
                    onChange={(e) => setForm(prev => ({ ...prev, cht_vencimento: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cma_numero">Número CMA</Label>
                  <Input
                    id="cma_numero"
                    value={form.cma_numero}
                    onChange={(e) => setForm(prev => ({ ...prev, cma_numero: e.target.value }))}
                    placeholder="Número do CMA"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cma_vencimento">Vencimento CMA</Label>
                  <Input
                    id="cma_vencimento"
                    type="date"
                    value={form.cma_vencimento}
                    onChange={(e) => setForm(prev => ({ ...prev, cma_vencimento: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={form.status} 
                  onValueChange={(value: any) => setForm(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="afastado">Afastado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Criar Tripulante
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal Editar Tripulante */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Tripulante</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_nome">Nome Completo *</Label>
                  <Input
                    id="edit_nome"
                    value={form.nome}
                    onChange={(e) => setForm(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Nome completo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_cargo">Cargo *</Label>
                  <Input
                    id="edit_cargo"
                    value={form.cargo}
                    onChange={(e) => setForm(prev => ({ ...prev, cargo: e.target.value }))}
                    placeholder="Ex: Comandante"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_cpf">CPF *</Label>
                  <Input
                    id="edit_cpf"
                    value={form.cpf}
                    onChange={(e) => setForm(prev => ({ ...prev, cpf: e.target.value }))}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_telefone">Telefone *</Label>
                  <Input
                    id="edit_telefone"
                    value={form.telefone}
                    onChange={(e) => setForm(prev => ({ ...prev, telefone: e.target.value }))}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_email">E-mail *</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                  required
                />
        </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_cht_numero">Número CHT</Label>
                  <Input
                    id="edit_cht_numero"
                    value={form.cht_numero}
                    onChange={(e) => setForm(prev => ({ ...prev, cht_numero: e.target.value }))}
                    placeholder="Número do CHT"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_cht_vencimento">Vencimento CHT</Label>
                  <Input
                    id="edit_cht_vencimento"
                    type="date"
                    value={form.cht_vencimento}
                    onChange={(e) => setForm(prev => ({ ...prev, cht_vencimento: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_cma_numero">Número CMA</Label>
                  <Input
                    id="edit_cma_numero"
                    value={form.cma_numero}
                    onChange={(e) => setForm(prev => ({ ...prev, cma_numero: e.target.value }))}
                    placeholder="Número do CMA"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_cma_vencimento">Vencimento CMA</Label>
                  <Input
                    id="edit_cma_vencimento"
                    type="date"
                    value={form.cma_vencimento}
                    onChange={(e) => setForm(prev => ({ ...prev, cma_vencimento: e.target.value }))}
                  />
              </div>
            </div>

              <div className="space-y-2">
                <Label htmlFor="edit_status">Status</Label>
                <Select 
                  value={form.status} 
                  onValueChange={(value: any) => setForm(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="afastado">Afastado</SelectItem>
                  </SelectContent>
                </Select>
                  </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Atualizar Tripulante
                </Button>
            </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
