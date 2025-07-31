import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AeronaveModal } from "@/components/agenda/AeronaveModal";
import { Plane, Calendar, Users, Plus } from "lucide-react";
import { useState } from "react";

interface Aeronave {
  id: string;
  matricula: string;
  modelo: string;
  status: 'ativa' | 'manutencao' | 'inativa';
  horasTotais: number;
  cotistas: number;
}

export default function AgendamentoVoo() {
  const [aeronaves] = useState<Aeronave[]>([]);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sistema de Agendamento de Voos</h1>
            <p className="text-muted-foreground mt-2">
              Selecione uma aeronave para acessar o calendário
            </p>
          </div>
          <AeronaveModal />
        </div>

        {aeronaves.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Plane className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma aeronave cadastrada</h3>
              <p className="text-muted-foreground mb-4">
                Cadastre suas aeronaves para começar a fazer agendamentos
              </p>
              <AeronaveModal 
                trigger={
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Cadastrar Primeira Aeronave
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aeronaves.map((aeronave) => (
              <Card key={aeronave.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                      <Plane className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{aeronave.matricula}</CardTitle>
                      <p className="text-sm text-muted-foreground">{aeronave.modelo}</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Diário 2025</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">⏱</span>
                    <span className="text-sm">{aeronave.horasTotais} horas totais</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{aeronave.cotistas} Cotistas</span>
                  </div>
                  
                  <Badge 
                    className={
                      aeronave.status === 'ativa' 
                        ? "bg-green-100 text-green-800 border-green-300" 
                        : aeronave.status === 'manutencao'
                        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                        : "bg-gray-100 text-gray-800 border-gray-300"
                    }
                  >
                    {aeronave.status === 'ativa' ? 'ATIVA' : 
                     aeronave.status === 'manutencao' ? 'MANUTENÇÃO' : 'INATIVA'}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}