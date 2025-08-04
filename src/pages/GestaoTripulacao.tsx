import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TripulacaoCard } from "@/components/tripulacao/TripulacaoCard";
import { TripulanteModal } from "@/components/tripulacao/TripulanteModal";
import { Plus, Search, Users } from "lucide-react";
import { useState } from "react";

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

const mockTripulantes: Tripulante[] = [];

export default function GestaoTripulacao() {
  const [tripulantes] = useState<Tripulante[]>(mockTripulantes);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTripulantes = tripulantes.filter(tripulante =>
    tripulante.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tripulante.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tripulante.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function getStatusCounts() {
    const chtVencidos = tripulantes.filter(t => t.cht.status === 'vencido').length;
    const cmaVencidos = tripulantes.filter(t => t.cma.status === 'vencido').length;
    const chtProximoVenc = tripulantes.filter(t => t.cht.status === 'proximo_vencimento').length;
    const cmaProximoVenc = tripulantes.filter(t => t.cma.status === 'proximo_vencimento').length;

    return { chtVencidos, cmaVencidos, chtProximoVenc, cmaProximoVenc };
  }

  const { chtVencidos, cmaVencidos, chtProximoVenc, cmaProximoVenc } = getStatusCounts();

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestão de Tripulação</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie os dados e vencimentos da sua equipe
            </p>
          </div>
          <TripulanteModal />
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tripulantes</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar tripulante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTripulantes.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Nenhum tripulante cadastrado</p>
                  <p className="text-sm">Clique em "Novo Tripulante" para começar</p>
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
