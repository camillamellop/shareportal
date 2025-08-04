import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Plus, Plane } from "lucide-react";

interface RelatorioViagemModalProps {
  trigger?: React.ReactNode;
}

export function RelatorioViagemModal({ trigger }: RelatorioViagemModalProps) {
  const [formData, setFormData] = useState({
    aeronave: "",
    dataInicio: "",
    dataFim: "",
    origem: "",
    destino: "",
    piloto: "",
    copiloto: "",
    passageiros: "",
    combustivel: "",
    observacoes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Dados do relatório:", formData);
    generateReport();
  };

  const generateReport = () => {
    console.log("Gerando relatório de viagem...");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Relatório
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Relatório de Viagem
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aeronave">Aeronave *</Label>
              <Select value={formData.aeronave} onValueChange={(value) => setFormData({ ...formData, aeronave: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PT-WSR">PT-WSR</SelectItem>
                  <SelectItem value="PR-MDL">PR-MDL</SelectItem>
                  <SelectItem value="PS-AVE">PS-AVE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data Início *</Label>
              <Input
                id="dataInicio"
                type="date"
                value={formData.dataInicio}
                onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataFim">Data Fim *</Label>
              <Input
                id="dataFim"
                type="date"
                value={formData.dataFim}
                onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origem">Origem *</Label>
              <Input
                id="origem"
                placeholder="Ex: SBGR - Guarulhos"
                value={formData.origem}
                onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destino">Destino *</Label>
              <Input
                id="destino"
                placeholder="Ex: SBSP - Congonhas"
                value={formData.destino}
                onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="piloto">Piloto Comandante *</Label>
              <Input
                id="piloto"
                placeholder="Nome do piloto"
                value={formData.piloto}
                onChange={(e) => setFormData({ ...formData, piloto: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="copiloto">Copiloto</Label>
              <Input
                id="copiloto"
                placeholder="Nome do copiloto"
                value={formData.copiloto}
                onChange={(e) => setFormData({ ...formData, copiloto: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="passageiros">Passageiros</Label>
              <Textarea
                id="passageiros"
                placeholder="Lista de passageiros..."
                value={formData.passageiros}
                onChange={(e) => setFormData({ ...formData, passageiros: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="combustivel">Combustível (Litros)</Label>
              <Input
                id="combustivel"
                type="number"
                placeholder="0"
                value={formData.combustivel}
                onChange={(e) => setFormData({ ...formData, combustivel: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Observações sobre a viagem..."
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="submit" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Gerar Relatório
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}