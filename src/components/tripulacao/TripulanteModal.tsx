import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Upload, User, Calendar } from "lucide-react";

interface TripulanteModalProps {
  trigger?: React.ReactNode;
}

export function TripulanteModal({ trigger }: TripulanteModalProps) {
  const [formData, setFormData] = useState({
    nome: "",
    cargo: "",
    cpf: "",
    telefone: "",
    email: "",
    chtNumero: "",
    chtVencimento: "",
    cmaNumero: "",
    cmaVencimento: "",
    status: "ativo",
    observacoes: "",
    foto: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Dados do tripulante:", formData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, foto: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Tripulante
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Novo Tripulante
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Foto */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={formData.foto} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="foto" className="cursor-pointer">
                <Button type="button" variant="outline" className="flex items-center gap-2" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    Carregar Foto
                  </span>
                </Button>
              </Label>
              <Input
                id="foto"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG até 2MB</p>
            </div>
          </div>

          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dados Pessoais</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  placeholder="Nome completo do tripulante"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo *</Label>
                <Select value={formData.cargo} onValueChange={(value) => setFormData({ ...formData, cargo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Piloto Comandante">Piloto Comandante</SelectItem>
                    <SelectItem value="Piloto Comercial">Piloto Comercial</SelectItem>
                    <SelectItem value="Copiloto">Copiloto</SelectItem>
                    <SelectItem value="Mecânico">Mecânico</SelectItem>
                    <SelectItem value="Comissário">Comissário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  placeholder="(11) 99999-9999"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="afastado">Afastado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Documentos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Documentos e Vencimentos
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">CHT (Certificado de Habilitação Técnica)</h4>
                <div className="space-y-2">
                  <Label htmlFor="chtNumero">Número CHT</Label>
                  <Input
                    id="chtNumero"
                    placeholder="CHT-12345"
                    value={formData.chtNumero}
                    onChange={(e) => setFormData({ ...formData, chtNumero: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chtVencimento">Data de Vencimento</Label>
                  <Input
                    id="chtVencimento"
                    type="date"
                    value={formData.chtVencimento}
                    onChange={(e) => setFormData({ ...formData, chtVencimento: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">CMA (Certificado Médico Aeronáutico)</h4>
                <div className="space-y-2">
                  <Label htmlFor="cmaNumero">Número CMA</Label>
                  <Input
                    id="cmaNumero"
                    placeholder="CMA-67890"
                    value={formData.cmaNumero}
                    onChange={(e) => setFormData({ ...formData, cmaNumero: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cmaVencimento">Data de Vencimento</Label>
                  <Input
                    id="cmaVencimento"
                    type="date"
                    value={formData.cmaVencimento}
                    onChange={(e) => setFormData({ ...formData, cmaVencimento: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Observações adicionais sobre o tripulante..."
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
              Salvar Tripulante
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}