import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Plane } from "lucide-react";

interface AeronaveModalProps {
  trigger?: React.ReactNode;
}

export function AeronaveModal({ trigger }: AeronaveModalProps) {
  const [formData, setFormData] = useState({
    matricula: "",
    modelo: "",
    ano: "",
    horasTotais: "",
    horimetro: "",
    consumoMedio: "",
    status: "ativa",
    observacoes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Dados da aeronave:", formData);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Aeronave
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Nova Aeronave
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="matricula">Matrícula *</Label>
              <Input
                id="matricula"
                placeholder="Ex: PT-WSR"
                value={formData.matricula}
                onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo *</Label>
              <Input
                id="modelo"
                placeholder="Ex: PA34220T"
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ano">Ano</Label>
              <Input
                id="ano"
                type="number"
                placeholder="2024"
                value={formData.ano}
                onChange={(e) => setFormData({ ...formData, ano: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horasTotais">Horas Totais</Label>
              <Input
                id="horasTotais"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={formData.horasTotais}
                onChange={(e) => setFormData({ ...formData, horasTotais: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horimetro">Horímetro</Label>
              <Input
                id="horimetro"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={formData.horimetro}
                onChange={(e) => setFormData({ ...formData, horimetro: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="consumoMedio">Consumo Médio (L/h)</Label>
              <Input
                id="consumoMedio"
                type="number"
                step="0.1"
                placeholder="83.0"
                value={formData.consumoMedio}
                onChange={(e) => setFormData({ ...formData, consumoMedio: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="manutencao">Em Manutenção</SelectItem>
                  <SelectItem value="inativa">Inativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Observações sobre a aeronave..."
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="submit">
              Salvar Aeronave
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}