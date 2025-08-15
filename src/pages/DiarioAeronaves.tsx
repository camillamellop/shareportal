import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DiarioDetalhes from "./DiarioDetalhes";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plane, Plus, Calendar, Clock, Award } from "lucide-react";
import { toast } from "sonner";
import { DiarioBordoCard } from "@/components/shared/DiarioBordoCard";
import { aeronaveService } from "@/services/firestore";
import { executarSeedCompleto, limparDadosExistentes } from "@/utils/executarSeed";

interface Aeronave {
  id: string;
  matricula: string;
  modelo: string;
  ano_diario: number;
  horas_totais: number;
  status: "ativa" | "inativa" | "manutencao";
  createdAt: any;
  updatedAt: any;
}

export default function DiarioAeronaves() {
  const navigate = useNavigate();
  const [aeronaves, setAeronaves] = useState<Aeronave[]>([]);
  const [loading, setLoading] = useState(true);
  const [executandoSeed, setExecutandoSeed] = useState(false); // usado apenas internamente
  const [aeronaveSelecionada, setAeronaveSelecionada] = useState<Aeronave | null>(null);

  // Carregar aeronaves do Firebase
  useEffect(() => {
    const loadAeronaves = async () => {
      try {
        setLoading(true);
        const aeronavesData = await aeronaveService.getAll();
        
        // Sempre executar seed para garantir dados corretos
        if (aeronavesData.length === 0 || aeronavesData.length < 8) {
          console.log("Executando seed para garantir dados corretos...");
          setExecutandoSeed(true);
          await executarSeedCompleto();
          setExecutandoSeed(false);
          
          // Recarregar aeronaves após o seed
          const aeronavesAposSeed = await aeronaveService.getAll();
          setAeronaves(aeronavesAposSeed);
          toast.success("Dados de exemplo carregados com sucesso!");
        } else {
          setAeronaves(aeronavesData);
        }
      } catch (error) {
        console.error("Erro ao carregar aeronaves:", error);
        toast.error("Erro ao carregar aeronaves");
      } finally {
        setLoading(false);
      }
    };

    loadAeronaves();
  }, []);

  const handleAeronaveClick = (aeronave: Aeronave) => {
    setAeronaveSelecionada(aeronave);
  };

  const handleAddAeronave = () => {
    navigate("/diario/nova-aeronave");
  };



  const handleLimparDados = async () => {
    try {
      setExecutandoSeed(true);
      await limparDadosExistentes();
      toast.success("Dados limpos com sucesso!");
      
      // Recarregar aeronaves
      const aeronavesData = await aeronaveService.getAll();
      setAeronaves(aeronavesData);
    } catch (error) {
      console.error("Erro ao limpar dados:", error);
      toast.error("Erro ao limpar dados");
    } finally {
      setExecutandoSeed(false);
    }
  };

  if (loading || executandoSeed) {
    return (
      <Layout>
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                  {executandoSeed ? "Carregando dados de exemplo..." : "Carregando aeronaves..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (aeronaveSelecionada) {
    return <DiarioDetalhes matricula={aeronaveSelecionada.matricula} onVoltar={() => setAeronaveSelecionada(null)} />;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Diários de Bordo
                </h1>
                <p className="text-muted-foreground">
                  Gerencie os diários de bordo digitais das aeronaves
                </p>
              </div>
              <Button 
                onClick={handleAddAeronave}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Aeronave
              </Button>

            </div>
          </div>

          {/* Grid de Aeronaves */}
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
              <Plane className="h-6 w-6 text-primary" /> Diário de Bordo
            </h1>
            
            {/* Cards do Diário de Bordo - Grid 2x4 como na imagem */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {aeronaves.map((aeronave) => (
                <DiarioBordoCard
                  key={aeronave.id}
                  matricula={aeronave.matricula}
                  modelo={aeronave.modelo}
                  anoDiario={aeronave.ano_diario}
                  horasTotais={aeronave.horas_totais}
                  status={aeronave.status}
                  onClick={() => handleAeronaveClick(aeronave)}
                />
              ))}
            </div>
          </div>

          {/* Mensagem quando não há aeronaves */}
          {aeronaves.length === 0 && (
            <div className="text-center py-12">
              <Plane className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma aeronave encontrada</p>
              <Button 
                onClick={handleAddAeronave}
                className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeira Aeronave
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 