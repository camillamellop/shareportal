import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plane, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { aeronaveService } from "@/services/firestore";

export default function NovaAeronave() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    matricula: "",
    modelo: "",
    ano_diario: new Date().getFullYear(),
    horas_totais: 0,
    status: "ativa" as "ativa" | "inativa" | "manutencao"
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.matricula || !formData.modelo) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      await aeronaveService.create({
        matricula: formData.matricula.toUpperCase(),
        modelo: formData.modelo,
        ano_diario: formData.ano_diario,
        horas_totais: formData.horas_totais,
        status: formData.status
      });

      toast.success("Aeronave adicionada com sucesso!");
      navigate("/diario");
    } catch (error) {
      console.error("Erro ao adicionar aeronave:", error);
      toast.error("Erro ao adicionar aeronave");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/diario")}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Nova Aeronave
              </h1>
              <p className="text-slate-300">
                Adicione uma nova aeronave ao sistema de diários de bordo
              </p>
            </div>
          </div>

          {/* Formulário */}
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Plane className="h-5 w-5" />
                Informações da Aeronave
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Matrícula */}
                  <div className="space-y-2">
                    <Label htmlFor="matricula" className="text-foreground">
                      Matrícula *
                    </Label>
                    <Input
                      id="matricula"
                      value={formData.matricula}
                      onChange={(e) => handleInputChange("matricula", e.target.value)}
                      placeholder="Ex: PT-WSR"
                      className="bg-input border-border text-foreground"
                      required
                    />
                  </div>

                  {/* Modelo */}
                  <div className="space-y-2">
                    <Label htmlFor="modelo" className="text-foreground">
                      Modelo *
                    </Label>
                    <Input
                      id="modelo"
                      value={formData.modelo}
                      onChange={(e) => handleInputChange("modelo", e.target.value)}
                      placeholder="Ex: PA34220T"
                      className="bg-input border-border text-foreground"
                      required
                    />
                  </div>

                  {/* Ano do Diário */}
                  <div className="space-y-2">
                    <Label htmlFor="ano_diario" className="text-foreground">
                      Ano do Diário
                    </Label>
                    <Input
                      id="ano_diario"
                      type="number"
                      value={formData.ano_diario}
                      onChange={(e) => handleInputChange("ano_diario", parseInt(e.target.value))}
                      className="bg-input border-border text-foreground"
                    />
                  </div>

                  {/* Horas Totais */}
                  <div className="space-y-2">
                    <Label htmlFor="horas_totais" className="text-foreground">
                      Horas Totais
                    </Label>
                    <Input
                      id="horas_totais"
                      type="number"
                      step="0.1"
                      value={formData.horas_totais}
                      onChange={(e) => handleInputChange("horas_totais", parseFloat(e.target.value))}
                      className="bg-input border-border text-foreground"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-foreground">
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange("status", value)}
                    >
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativa">Ativa</SelectItem>
                        <SelectItem value="inativa">Inativa</SelectItem>
                        <SelectItem value="manutencao">Manutenção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/diario")}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Salvando..." : "Salvar Aeronave"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
} 