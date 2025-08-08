import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Download, Mail, Trash2 } from "lucide-react";
import { ConciliacaoClientes } from "@/components/conciliacao/ConciliacaoClientes";
import { ConciliacaoColaborador } from "@/components/conciliacao/ConciliacaoColaborador";

export default function ConciliacaoBancaria() {
  const [selectedPeriod, setSelectedPeriod] = useState("30");

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
            <Button size="sm" variant="outline" className="flex items-center gap-2 justify-center">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
            <Button 
              size="sm" 
              className="flex items-center gap-2 justify-center"
              onClick={() => window.open('https://webmail-seguro.com.br/sharebrasil.net.br/?_task=mail&_mbox=INBOX', '_blank')}
            >
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Enviar Email</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Período</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="60">Últimos 60 dias</SelectItem>
                    <SelectItem value="90">Últimos 90 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Data Inicial</label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Data Final</label>
                <Input type="date" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs para Conciliação */}
        <Tabs defaultValue="clientes" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2">
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