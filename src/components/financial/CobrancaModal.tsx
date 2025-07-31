import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Plus } from "lucide-react";

interface CobrancaModalProps {
  trigger?: React.ReactNode;
}

export function CobrancaModal({ trigger }: CobrancaModalProps) {
  const [formData, setFormData] = useState({
    nomeCliente: "",
    referencia: "",
    valor: "",
    vencimento: "",
    chavePix: "",
    observacoes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você implementaria a lógica para salvar a cobrança
    console.log("Dados da cobrança:", formData);
    // Gerar PDF da cobrança
    generatePDF();
  };

  const generatePDF = () => {
    // Implementar geração de PDF
    console.log("Gerando PDF da cobrança...");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Cobrança
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Nova Cobrança
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nomeCliente">Nome do Cliente/Empresa *</Label>
              <Input
                id="nomeCliente"
                placeholder="Ex: CARVALIMA TRANSPORTES LTDA"
                value={formData.nomeCliente}
                onChange={(e) => setFormData({ ...formData, nomeCliente: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="referencia">Referência do Débito *</Label>
              <Input
                id="referencia"
                placeholder="Ex: TARIFA INFRAERO - 543462T"
                value={formData.referencia}
                onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$) *</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vencimento">Data de Vencimento *</Label>
              <Input
                id="vencimento"
                type="date"
                value={formData.vencimento}
                onChange={(e) => setFormData({ ...formData, vencimento: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chavePix">Chave PIX (Copia e Cola) *</Label>
            <Textarea
              id="chavePix"
              placeholder="Cole aqui a chave PIX completa..."
              value={formData.chavePix}
              onChange={(e) => setFormData({ ...formData, chavePix: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Observações adicionais..."
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="submit" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Criar e Baixar PDF
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}