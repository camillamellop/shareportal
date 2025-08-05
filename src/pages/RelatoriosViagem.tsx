import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plane, Plus, Search, Filter, Eye, Download, Calendar, User, MapPin, Mail } from "lucide-react";
import { relatorioViagemService, RelatorioViagem } from "@/services/firestore";
import { AERONAVES } from "@/types/viagem";
import RelatorioViagemForm from "@/pages/financeiro/RelatorioViagem";
import { toast } from "sonner";

export default function RelatoriosViagem() {
  const [relatorios, setRelatorios] = useState<RelatorioViagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAeronave, setFilterAeronave] = useState("todas");
  const [filterStatus, setFilterStatus] = useState("todos");

  useEffect(() => {
    loadRelatorios();
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

  const handleCreateRelatorio = async (data: RelatorioViagem) => {
    try {
      setShowForm(false);
      await loadRelatorios();
      toast.success("Relatório criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar relatório:", error);
      toast.error("Erro ao criar relatório");
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

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {!showForm ? (
          <>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Relatórios de Viagem</h1>
                <p className="text-muted-foreground">Gerencie relatórios de viagem e despesas</p>
              </div>
              
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
                        {AERONAVES.map(aeronave => (
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

            {/* Lista de Relatórios */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4">Carregando relatórios...</p>
              </div>
            ) : filteredRelatorios.length > 0 ? (
              <div className="grid gap-4">
                {filteredRelatorios.map((relatorio) => (
                  <Card key={relatorio.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            <Plane className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold">
                              {relatorio.cotista} - {relatorio.destino}
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
                            <span className="font-medium">Total: R$ {relatorio.valor_total.toFixed(2)}</span>
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
                          <Button variant="outline" size="sm">
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
            {/* Header do Formulário */}
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

            {/* Formulário */}
            <RelatorioViagemForm />
          </>
        )}
      </div>
    </Layout>
  );
} 