import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Download } from "lucide-react";
import { ConciliacaoClientes } from "@/components/conciliacao/ConciliacaoClientes";
import { ConciliacaoColaborador } from "@/components/conciliacao/ConciliacaoColaborador";
import { toast } from "sonner";
import { db } from "@/integrations/firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

export default function ConciliacaoBancaria() {
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [firebaseStatus, setFirebaseStatus] = useState<string>("Verificando...");
  const { user, loading } = useAuth();

  // Teste de conexão com Firebase
  useEffect(() => {
    const testFirebaseConnection = async () => {
      try {
        const testCollection = collection(db, "test");
        await getDocs(testCollection);
        setFirebaseStatus("Conectado");
        
      } catch (error) {
        console.error("Erro na conexão com Firebase:", error);
        setFirebaseStatus("Erro na conexão");
        toast.error(
          `Erro na conexão com Firebase: ${
            error instanceof Error ? error.message : "Erro desconhecido"
          }`
        );
      }
    };
    if (!loading) testFirebaseConnection();
  }, [loading]);

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Conciliação Bancária</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie e concilie as movimentações bancárias da empresa
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button className="flex items-center gap-2 justify-center">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar Relatório</span>
              <span className="sm:hidden">Exportar</span>
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Período</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="60">Últimos 60 dias</SelectItem>
                    <SelectItem value="90">Últimos 90 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Data Inicial</label>
                <Input type="date" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Data Final</label>
                <Input type="date" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs para Conciliação */}
        <Tabs defaultValue="clientes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="clientes">Conciliação com Clientes</TabsTrigger>
            <TabsTrigger value="colaborador">Conciliação Colaborador</TabsTrigger>
          </TabsList>

          <TabsContent value="clientes" className="space-y-4">
            <ConciliacaoClientes />
          </TabsContent>

          <TabsContent value="colaborador" className="space-y-4">
            <ConciliacaoColaborador />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
              