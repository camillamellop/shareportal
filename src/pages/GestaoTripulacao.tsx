import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TripulacaoCard } from "@/components/tripulacao/TripulacaoCard";
import { Plus, Search, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { tripulacaoService } from "@/services/tripulacaoService";

import { Tripulante } from "@/services/tripulacaoService";

const mockTripulantes: Tripulante[] = [];

export default function GestaoTripulacao() {
  const [tripulantes, setTripulantes] = useState<Tripulante[]>(mockTripulantes);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Carregar tripulantes do Firebase ao montar o componente
  useEffect(() => {
    const carregarTripulantes = async () => {
      try {
        setLoading(true);
        const tripulantesFirebase = await tripulacaoService.buscarTripulantes();
        setTripulantes(tripulantesFirebase);
        console.log("Tripulantes carregados do Firebase:", tripulantesFirebase);
      } catch (error) {
        console.error("Erro ao carregar tripulantes do Firebase:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarTripulantes();
  }, []);

  const filteredTripulantes = tripulantes.filter(tripulante =>
    tripulante.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tripulante.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tripulante.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function getStatusCounts() {
    const chtVencidos = tripulantes.filter(t => t.cht?.status === 'vencido').length;
    const cmaVencidos = tripulantes.filter(t => t.cma?.status === 'vencido').length;
    const chtProximoVenc = tripulantes.filter(t => t.cht?.status === 'proximo_vencimento').length;
    const cmaProximoVenc = tripulantes.filter(t => t.cma?.status === 'proximo_vencimento').length;

    return { chtVencidos, cmaVencidos, chtProximoVenc, cmaProximoVenc };
  }

  const { chtVencidos, cmaVencidos, chtProximoVenc, cmaProximoVenc } = getStatusCounts();

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-6"></div>
              <p className="text-lg text-muted-foreground font-medium">Carregando tripulantes...</p>
              <p className="text-sm text-muted-foreground mt-2">Aguarde enquanto buscamos os dados</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestão de Tripulação</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie os dados e vencimentos da sua equipe
            </p>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{tripulantes.length}</p>
                  <p className="text-sm text-muted-foreground">Total Tripulantes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 font-bold text-sm">CHT</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{chtVencidos}</p>
                  <p className="text-sm text-muted-foreground">CHT Vencidos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 font-bold text-sm">CMA</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{cmaVencidos}</p>
                  <p className="text-sm text-muted-foreground">CMA Vencidos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-yellow-100 flex items-center justify-center">
                  <span className="text-yellow-600 font-bold text-sm">!</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{chtProximoVenc + cmaProximoVenc}</p>
                  <p className="text-sm text-muted-foreground">Próx. Vencimento</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-xl">Tripulantes</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar tripulante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
                     <CardContent className="pt-0">
             <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                             {filteredTripulantes.length === 0 ? (
                                   <div className="col-span-full text-center py-16 text-muted-foreground">
                    <Users className="h-16 w-16 mx-auto mb-6 opacity-50" />
                    <p className="text-xl font-medium mb-3">Nenhum tripulante encontrado</p>
                    <p className="text-sm max-w-md mx-auto">Não há tripulantes cadastrados no sistema</p>
                  </div>
               ) : (
                 filteredTripulantes.map((tripulante) => (
                   <TripulacaoCard key={tripulante.id} tripulante={tripulante} />
                 ))
               )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
