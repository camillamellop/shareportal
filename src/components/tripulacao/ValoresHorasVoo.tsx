import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  DollarSign, 
  Plane, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { valoresHorasService, ValorHoraVoo } from "@/services/valoresHorasService";
import "@/utils/seedValoresHoras";

export function ValoresHorasVoo() {
  const [valores, setValores] = useState<ValorHoraVoo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingValor, setEditingValor] = useState<ValorHoraVoo | null>(null);
  const [saving, setSaving] = useState(false);

  // Formulário
  const [form, setForm] = useState({
    aeronave_matricula: "",
    modelo: "",
    valor_hora: "",
    status: "ativo" as const,
    observacoes: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log("Carregando valores de horas de voo...");
      const valoresData = await valoresHorasService.obterValores();
      console.log("Valores carregados:", valoresData);
      setValores(valoresData);
    } catch (error) {
      console.error("Erro ao carregar valores:", error);
      toast.error("Erro ao carregar valores de horas de voo");
      // Em caso de erro, tentar popular dados de exemplo
      try {
        console.log("Tentando popular dados de exemplo...");
        await (window as any).seedValoresHoras();
        const valoresData = await valoresHorasService.obterValores();
        setValores(valoresData);
        toast.success("Dados de exemplo carregados automaticamente!");
      } catch (seedError) {
        console.error("Erro ao popular dados de exemplo:", seedError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.aeronave_matricula || !form.modelo || !form.valor_hora) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setSaving(true);
      
      const valorHora = parseFloat(form.valor_hora);
      if (isNaN(valorHora) || valorHora <= 0) {
        toast.error("Valor por hora deve ser um número positivo");
        return;
      }

      if (editingValor) {
        await valoresHorasService.atualizarValor(editingValor.id, {
          aeronave_matricula: form.aeronave_matricula,
          modelo: form.modelo,
          valor_hora: valorHora,
          status: form.status,
          observacoes: form.observacoes
        });
        toast.success("Valor atualizado com sucesso!");
      } else {
        await valoresHorasService.criarValor({
          aeronave_matricula: form.aeronave_matricula,
          modelo: form.modelo,
          valor_hora: valorHora,
          status: form.status,
          observacoes: form.observacoes
        });
        toast.success("Valor criado com sucesso!");
      }

      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Erro ao salvar valor:", error);
      toast.error("Erro ao salvar valor");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (valor: ValorHoraVoo) => {
    setEditingValor(valor);
    setForm({
      aeronave_matricula: valor.aeronave_matricula,
      modelo: valor.modelo,
      valor_hora: valor.valor_hora.toString(),
      status: valor.status,
      observacoes: valor.observacoes || ""
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este valor?")) {
      return;
    }

    try {
      await valoresHorasService.deletarValor(id);
      toast.success("Valor excluído com sucesso!");
      loadData();
    } catch (error) {
      console.error("Erro ao excluir valor:", error);
      toast.error("Erro ao excluir valor");
    }
  };

  const resetForm = () => {
    setForm({
      aeronave_matricula: "",
      modelo: "",
      valor_hora: "",
      status: "ativo",
      observacoes: ""
    });
    setEditingValor(null);
  };

  const openNewModal = () => {
    resetForm();
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    return status === 'ativo' ? (
      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Inativo</Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const filteredValores = valores.filter(valor =>
    valor.aeronave_matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
    valor.modelo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log("Valores filtrados:", filteredValores);
  console.log("Total de valores:", valores.length);

  const totalValor = valores.reduce((sum, v) => sum + v.valor_hora, 0);
  const valoresAtivos = valores.filter(v => v.status === 'ativo').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground font-medium">Carregando valores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
             {/* Header */}
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
         <div>
           <h2 className="text-2xl font-bold text-foreground">Valores das Horas de Voo</h2>
           <p className="text-muted-foreground mt-1">
             Gerencie os valores por hora de cada aeronave
           </p>
         </div>
       </div>

      

             {/* Tabela de Valores */}
       <Card>
         <CardHeader>
           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
             <CardTitle>Tabela de Valores das Aeronaves</CardTitle>
             <div className="flex gap-2">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input
                   placeholder="Buscar aeronave..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-10 w-full sm:w-64"
                 />
               </div>
               <Button onClick={openNewModal}>
                 <Plus className="h-4 w-4 mr-2" />
                 Adicionar Aeronave
               </Button>
             </div>
           </div>
         </CardHeader>
         <CardContent>
           <div className="overflow-x-auto">
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead className="bg-primary text-primary-foreground font-bold">AERONAVE</TableHead>
                   {filteredValores.map((valor) => (
                     <TableHead key={valor.id} className="bg-primary text-primary-foreground font-bold text-center">
                       {valor.aeronave_matricula}
                     </TableHead>
                   ))}
                 </TableRow>
               </TableHeader>
               <TableBody>
                 <TableRow>
                   <TableCell className="font-bold bg-muted">VALOR/HORA</TableCell>
                   {filteredValores.map((valor) => (
                     <TableCell key={valor.id} className="text-center font-semibold text-green-600">
                       {formatCurrency(valor.valor_hora)}
                     </TableCell>
                   ))}
                 </TableRow>
                 <TableRow>
                   <TableCell className="font-bold bg-muted">STATUS</TableCell>
                   {filteredValores.map((valor) => (
                     <TableCell key={valor.id} className="text-center">
                       {getStatusBadge(valor.status)}
                     </TableCell>
                   ))}
                 </TableRow>
                 <TableRow>
                   <TableCell className="font-bold bg-muted">AÇÕES</TableCell>
                   {filteredValores.map((valor) => (
                     <TableCell key={valor.id} className="text-center">
                       <div className="flex justify-center gap-2">
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleEdit(valor)}
                         >
                           <Edit className="h-4 w-4" />
                         </Button>
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleDelete(valor.id)}
                           className="text-red-600 hover:text-red-700"
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                     </TableCell>
                   ))}
                 </TableRow>
               </TableBody>
             </Table>
           </div>

                       {filteredValores.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Plane className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Nenhuma aeronave encontrada</p>
                <p className="text-sm">Adicione aeronaves para começar a gerenciar valores</p>
                <div className="mt-4">
                  <Button 
                    onClick={async () => {
                      try {
                        console.log("Populando dados de exemplo...");
                        await (window as any).seedValoresHoras();
                        toast.success("Dados de exemplo carregados!");
                        loadData();
                      } catch (error) {
                        console.error("Erro ao popular dados:", error);
                        toast.error("Erro ao popular dados de exemplo");
                      }
                    }}
                    variant="outline"
                  >
                    Carregar Dados de Exemplo
                  </Button>
                </div>
              </div>
            )}
         </CardContent>
       </Card>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md sm:max-w-lg w-full mx-4">
          <DialogHeader>
            <DialogTitle>
              {editingValor ? "Editar Valor" : "Adicionar Aeronave"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aeronave_matricula">Matrícula da Aeronave *</Label>
                <Input
                  id="aeronave_matricula"
                  value={form.aeronave_matricula}
                  onChange={(e) => setForm(prev => ({ ...prev, aeronave_matricula: e.target.value }))}
                  placeholder="Ex: PR-MDL"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo *</Label>
                <Input
                  id="modelo"
                  value={form.modelo}
                  onChange={(e) => setForm(prev => ({ ...prev, modelo: e.target.value }))}
                  placeholder="Ex: Piper Seneca"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor_hora">Valor por Hora (R$) *</Label>
                <Input
                  id="valor_hora"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.valor_hora}
                  onChange={(e) => setForm(prev => ({ ...prev, valor_hora: e.target.value }))}
                  placeholder="0,00"
                  required
                />
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
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={form.observacoes}
                onChange={(e) => setForm(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações adicionais..."
                rows={3}
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
                disabled={saving}
                className="w-full sm:w-auto"
              >
                {saving ? 'Salvando...' : (editingValor ? 'Atualizar' : 'Criar')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
