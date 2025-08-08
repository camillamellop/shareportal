import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Plus } from "lucide-react";
<<<<<<< HEAD
import { conciliacaoService } from "@/services/conciliacaoService";
import { toast } from "sonner";
import { PDFGenerator } from "@/utils/pdfGenerator";
=======
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524

interface CobrancaModalProps {
  trigger?: React.ReactNode;
}

export function CobrancaModal({ trigger }: CobrancaModalProps) {
<<<<<<< HEAD
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
=======
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
  const [formData, setFormData] = useState({
    nomeCliente: "",
    referencia: "",
    valor: "",
    vencimento: "",
    chavePix: "",
    observacoes: ""
  });

<<<<<<< HEAD
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 1. Criar despesa a receber na conciliação bancária
      await criarDespesaReceber();
      
      // 2. Gerar PDF da cobrança
      await generatePDF();
      
      // 3. Pequeno delay para feedback visual
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 4. Limpar formulário
      setFormData({
        nomeCliente: "",
        referencia: "",
        valor: "",
        vencimento: "",
        chavePix: "",
        observacoes: ""
      });
      
      // 5. Fechar modal
      setIsOpen(false);
      
      toast.success("Cobrança criada e PDF gerado com sucesso!");
      
    } catch (error) {
      console.error("Erro ao criar cobrança:", error);
      toast.error("Erro ao criar cobrança");
    } finally {
      setIsSubmitting(false);
    }
  };

  const criarDespesaReceber = async () => {
    try {
      const valor = parseFloat(formData.valor);
      if (isNaN(valor)) {
        throw new Error("Valor inválido");
      }

      await conciliacaoService.criarDespesaPendente({
        categoria: 'cliente',
        tipo: 'lancamento_manual',
        origem_id: `cobranca_${new Date().getTime()}`,
        numero_documento: formData.referencia,
        cliente_nome: formData.nomeCliente,
        descricao: `[RECEITA] Cobrança: ${formData.referencia}`,
        valor: valor,
        data_criacao: new Date().toISOString().split('T')[0],
        data_vencimento: formData.vencimento,
        status: 'pendente_envio',
        observacoes: `RECEITA A RECEBER - ${formData.observacoes || `Chave PIX: ${formData.chavePix}`}`,
        forma_pagamento: 'pix',
        comprovante_envio: '',
        comprovante_pagamento: '',
        data_envio: '',
        data_pagamento: '',
        conta_bancaria: ''
      });

      console.log("Despesa a receber criada com sucesso");
    } catch (error) {
      console.error("Erro ao criar despesa a receber:", error);
      throw error;
    }
  };

  const generatePDF = async () => {
    try {
      toast.info("Gerando PDF da cobrança...");
      await PDFGenerator.generateCobrancaPDF(formData);
      console.log("PDF gerado com sucesso");
      toast.success("PDF gerado e baixado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      throw error;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
=======
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
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
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
<<<<<<< HEAD
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Gerando PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Criar e Baixar PDF
                </>
              )}
=======
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="submit" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Criar e Baixar PDF
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}