import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plane, Plus, Calendar, Clock, Award } from "lucide-react";
import { toast } from "sonner";
import { DiarioBordoCard } from "@/components/shared/DiarioBordoCard";
import { aeronaveService } from "@/services/firestore";
import { executarSeedCompleto } from "@/utils/executarSeed";

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
  const [executandoSeed, setExecutandoSeed] = useState(false);

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
    navigate(`/diario/detalhes/${aeronave.matricula}`);
  };

  const handleAddAeronave = () => {
    navigate("/diario/nova-aeronave");
  };

  const handleTestSeed = async () => {
    try {
      setExecutandoSeed(true);
      await executarSeedCompleto();
      toast.success("Seed executado com sucesso!");
      
      // Recarregar aeronaves
      const aeronavesData = await aeronaveService.getAll();
      setAeronaves(aeronavesData);
    } catch (error) {
      console.error("Erro ao executar seed:", error);
      toast.error("Erro ao executar seed");
    } finally {
      setExecutandoSeed(false);
    }
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-slate-300">
                  {executandoSeed ? "Carregando dados de exemplo..." : "Carregando aeronaves..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Diários de Bordo
                </h1>
                <p className="text-slate-300">
                  Gerencie os diários de bordo digitais das aeronaves
                </p>
              </div>
              <Button 
                onClick={handleAddAeronave}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Aeronave
              </Button>
              <Button 
                onClick={handleTestSeed}
                className="bg-green-600 hover:bg-green-700 text-white ml-2"
              >
                Testar Seed
              </Button>
            </div>
          </div>

          {/* Grid de Aeronaves */}
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
              <Plane className="h-6 w-6 text-primary" /> Diário de Bordo
            </h1>
            
            {/* Cards do Diário de Bordo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              <Plane className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">Nenhuma aeronave encontrada</p>
              <Button 
                onClick={handleAddAeronave}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
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